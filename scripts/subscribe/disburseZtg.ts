/**
 * Script to automatically disburse Ztg to eligible accounts
 * Run using `ts-node scripts/subscribe/disburseZtg.ts wss://bsr.zeitgeist.pm`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import { util } from '@zeitgeistpm/sdk';
import { Tools } from '../../src/mappings/util';
import { HistoricalAccountBalance } from '../../src/model';
import { DisburseDb } from './db';

const NODE_URL = process.argv[2];
const GRAPHQL_WS_URL = NODE_URL.includes(`bs`)
  ? `wss://processor.bsr.zeitgeist.pm/graphql`
  : `wss://processor.rpc-0.zeitgeist.pm/graphql`;
const TXN_FEE = NODE_URL.includes(`bs`) ? BigInt(9269600000) : BigInt(1326669);
const CACHE_DB_PATH = `disburseZtg-db.db`;

const client = createClient({ webSocketImpl: WebSocket, url: GRAPHQL_WS_URL });
const db = new DisburseDb(CACHE_DB_PATH);

client.subscribe(
  {
    query: `
      subscription {
        historicalAccountBalances(where: {event_contains: "Deposited", assetId_contains: "foreign"}, orderBy: id_ASC) {
          id
          accountId
          assetId
          dBalance
          blockNumber
        }
      }  
    `,
  },
  {
    next: async ({ data }) => {
      const { historicalAccountBalances } = data as any;
      const habs = historicalAccountBalances as HistoricalAccountBalance[];

      for (let i = 0; i < habs.length - 1; i++) {
        if (habs[i].accountId === 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ') {
          console.log(`[${new Date().toLocaleString()}] TxnID:${habs[i].id} is on treasury account`);
          continue;
        }
        if (BigInt(habs[i].dBalance) < BigInt(10 ** 10)) {
          console.log(
            `[${new Date().toLocaleString()}] TxnID:${habs[i].id} has an amount which is less than 1 unit (${
              habs[i].dBalance
            })`
          );
          continue;
        }
        if (
          habs[i].blockNumber !== habs[i + 1].blockNumber ||
          habs[i + 1].accountId !== 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ' ||
          BigInt(habs[i + 1].dBalance) !== TXN_FEE
        ) {
          console.log(`[${new Date().toLocaleString()}] TxnID:${habs[i].id} doesn't seem like a XCM transfer`);
          continue;
        }

        const entry = await db.getTxnWithId(habs[i].id);
        if (entry) {
          console.log(
            `[${new Date().toLocaleString()}] TxnID:${habs[i].id} has already been logged with '${entry.log}'`
          );
        } else {
          const balance = await getBalance(habs[i]);
          if (balance === '0') {
            const dBalance = Number((BigInt(habs[i].dBalance) * 100n) / BigInt(10 ** 10)) / 100;
            console.log(
              `[${new Date().toLocaleString()}] TxnID:${habs[i].id} of ${dBalance} ${habs[i].assetId} is eligible for ${
                habs[i].accountId
              }`
            );
            const amount = 10 ** 10;
            const result = await sendTokens('seed-comes-here', habs[i].accountId, amount.toString());
            console.log(`[${new Date().toLocaleString()}] TxnID:${habs[i].id} ${result.log}`);
            await db.saveOrUpdateTxn(habs[i].id, result.log);
          } else {
            console.log(
              `[${new Date().toLocaleString()}] TxnID:${habs[i].id} Ztg balance of ${habs[i].accountId} at #${
                habs[i].blockNumber
              } is not 0 (${balance})`
            );
            await db.saveOrUpdateTxn(
              habs[i].id,
              `Ztg balance of ${habs[i].accountId} at #${habs[i].blockNumber} is ${balance}`
            );
          }
        }
      }
    },
    error: (error) => {
      console.error(`[${new Date().toLocaleString()}] Error while subscribing to query: ${error}`);
    },
    complete: () => {
      console.log(`[${new Date().toLocaleString()}] Subscription complete!`);
    },
  }
);

const sendTokens = async (seed: string, dest: string, amount: string): Promise<{ status: boolean; log: string }> => {
  const sdk = (await Tools.getSDK(NODE_URL)) as any;
  const keypair = util.signerFromSeed(seed);
  return new Promise(async (resolve) => {
    const unsub = await sdk.api.tx.balances
      .transfer(dest, amount)
      .signAndSend(keypair, ({ events = [], status }: { events: any[]; status: any }) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section } }) => {
            if (section === 'system' && method === 'ExtrinsicSuccess') {
              resolve({ status: true, log: `Successfully sent ${amount} to ${dest}` });
            } else if (section === 'system' && method === 'ExtrinsicFailed') {
              resolve({ status: false, log: `Failed to send ${amount} to ${dest}!` });
              const { index, error } = (data as any).toJSON()[0].module;
              try {
                const { errorName, documentation } = sdk.errorTable.getEntry(
                  index,
                  parseInt(error.substring(2, 4), 16)
                );
                console.log(`[${new Date().toLocaleString()}] ${errorName}: ${documentation}`);
              } catch (err) {
                console.log(`[${new Date().toLocaleString()}] ${err}`);
              } finally {
                resolve({ status: false, log: `Error while sending ${amount} to ${dest}` });
              }
            }
          });
          unsub();
        }
      });
  });
};

const getBalance = async (hab: HistoricalAccountBalance): Promise<string> => {
  console.log(`[${new Date().toLocaleString()}] TxnID:${hab.id} Checking Ztg balance of ${hab.accountId}`);
  const sdk = (await Tools.getSDK(NODE_URL)) as any;
  const blockHash = await sdk.api.rpc.chain.getBlockHash(hab.blockNumber);
  const {
    data: { free },
  } = (await sdk.api.query.system.account.at(blockHash, hab.accountId)) as AccountInfo;
  return free.toString();
};
