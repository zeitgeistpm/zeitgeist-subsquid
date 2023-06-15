/**
 * Script to automatically disburse Ztg to eligible accounts
 * Run using `ts-node scripts/subscribe/disburseZtg.ts wss://bsr.zeitgeist.pm <origin-seed>`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import { util } from '@zeitgeistpm/sdk';
import { Tools } from '../../src/mappings/util';
import { HistoricalAccountBalance } from '../../src/model';
import { DisburseDb } from './db';

const NODE_URL = process.argv[2];
const SEED = process.argv[3];
const GRAPHQL_WS_URL = NODE_URL.includes(`bs`)
  ? `wss://processor.bsr.zeitgeist.pm/graphql`
  : `wss://processor.rpc-0.zeitgeist.pm/graphql`;
const TXN_FEES = NODE_URL.includes(`bs`) ? 9269600000 : 1326669;
const DISBURSE_AMOUNT = 10 ** 10 / 2;
const PER_DAY_LIMIT = 500;

const client = createClient({ webSocketImpl: WebSocket, url: GRAPHQL_WS_URL });
const db = new DisburseDb(`disburseZtg-db.db`);

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
          timestamp
        }
      }  
    `,
  },
  {
    next: async ({ data }) => {
      const { historicalAccountBalances } = data as any;
      const habs = historicalAccountBalances as HistoricalAccountBalance[];

      for (let i = 0; i < habs.length - 1; i++) {
        if (
          habs[i].blockNumber !== habs[i + 1].blockNumber ||
          habs[i + 1].accountId !== `dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ` ||
          BigInt(habs[i + 1].dBalance) !== BigInt(TXN_FEES)
        ) {
          log(`Doesn't seem like a XCM transfer`, habs[i].id);
          continue;
        }
        const entry = await db.getAccountWithId(habs[i].accountId);
        if (entry) {
          log(`Account has already been logged on ${entry.timestamp} with ${entry.amount} amount`, habs[i].id);
          continue;
        }
        if (BigInt(habs[i].dBalance) < BigInt(10 ** 10)) {
          log(`Amount is less than 1 unit (${habs[i].dBalance})`, habs[i].id);
          continue;
        }
        if (habs[i].accountId === `dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ`) {
          log(`Deposit on treasury account`, habs[i].id);
          continue;
        }
        const balance = await getBalance(habs[i]);
        if (balance !== 0) {
          log(`Ztg balance of ${habs[i].accountId} at #${habs[i].blockNumber} is not 0 (${balance})`, habs[i].id);
          await db.saveAccount(habs[i].accountId, new Date().toISOString(), 0);
          continue;
        }

        log(`${habs[i].dBalance} ${habs[i].assetId} by ${habs[i].accountId} is eligible`, habs[i].id);
        const date = new Date().toISOString().split('T')[0];
        const totalAmtPerDay = await db.getTotalAmount(date);
        log(`Amount disbursed as of ${date}: ${totalAmtPerDay}`, habs[i].id);
        if (totalAmtPerDay >= PER_DAY_LIMIT) {
          log(`Reached per day limit of ${PER_DAY_LIMIT}`, habs[i].id);
          continue;
        }

        const res = await sendTokens(habs[i].accountId, DISBURSE_AMOUNT.toString());
        log(res.result, habs[i].id);
        if (res.status) {
          await db.saveAccount(habs[i].accountId, new Date().toISOString(), DISBURSE_AMOUNT);
        }
      }
    },
    error: (error) => {
      log(`Error while subscribing to query: ${error}`);
    },
    complete: () => {
      log(`Subscription complete!`);
    },
  }
);

const sendTokens = async (dest: string, amount: string): Promise<{ status: boolean; result: string }> => {
  const sdk = (await Tools.getSDK(NODE_URL)) as any;
  log(`Sending ${amount} to ${dest}`);
  if (!SEED) return { status: false, result: `Seed not found` };
  const keypair = util.signerFromSeed(SEED);

  return new Promise(async (resolve) => {
    const unsub = await sdk.api.tx.balances
      .transfer(dest, amount)
      .signAndSend(keypair, ({ events = [], status }: { events: any[]; status: any }) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section } }) => {
            if (section === 'system' && method === 'ExtrinsicSuccess') {
              resolve({ status: true, result: `Successfully sent ${amount} to ${dest}` });
            } else if (section === 'system' && method === 'ExtrinsicFailed') {
              resolve({ status: false, result: `Failed to send ${amount} to ${dest}!` });
              const { index, error } = (data as any).toJSON()[0].module;
              try {
                const { errorName, documentation } = sdk.errorTable.getEntry(
                  index,
                  parseInt(error.substring(2, 4), 16)
                );
                log(`${errorName}: ${documentation}`);
              } catch (err) {
                log(err);
              } finally {
                resolve({ status: false, result: `Error while sending ${amount} to ${dest}` });
              }
            }
          });
          unsub();
        }
      });
  });
};

const getBalance = async (hab: HistoricalAccountBalance): Promise<number> => {
  log(`Checking Ztg balance of ${hab.accountId}`, hab.id);
  const sdk = (await Tools.getSDK(NODE_URL)) as any;
  const blockHash = await sdk.api.rpc.chain.getBlockHash(hab.blockNumber);
  const {
    data: { free },
  } = (await sdk.api.query.system.account.at(blockHash, hab.accountId)) as AccountInfo;
  return +free.toString();
};

const log = (message: string, txnId?: string) => {
  if (txnId) {
    console.log(`[${new Date().toLocaleString()}] [${txnId}] ${message}`);
    return;
  }
  console.log(`[${new Date().toLocaleString()}] ${message}`);
};
