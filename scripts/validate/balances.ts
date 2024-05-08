/**
 * Script to validate asset balances of all squid accounts against on-chain balance
 * Run using the command: ts-node scripts/validate/balances.ts <env>
 */
import { AccountInfo } from '@polkadot/types/interfaces/system';
import { util } from '@zeitgeistpm/sdk';
import axios from 'axios';
import Decimal from 'decimal.js';
import { Account, AccountBalance } from '../../src/model';
import { Tools } from '../../src/util';

const PROGRESS = false; // true or false for viewing running logs

let NODE_URL: string;
let GRAPHQL_HOSTNAME: string;
switch (process.argv[2]) {
  case 'dev':
    NODE_URL = 'wss://bsr.zeitgeist.pm';
    GRAPHQL_HOSTNAME = 'processor.zeitgeist.pm';
    break;
  case 'test':
    NODE_URL = 'wss://bsr.zeitgeist.pm';
    GRAPHQL_HOSTNAME = 'processor.bsr.zeitgeist.pm';
    break;
  case 'main':
    NODE_URL = 'wss://zeitgeist-rpc.dwellir.com';
    GRAPHQL_HOSTNAME = 'processor.rpc-0.zeitgeist.pm';
    break;
  default:
    console.log(`Please pass 'dev' or 'test' or 'main' as environment`);
    console.log(`Example: ts-node scripts/validate/balances.ts dev`);
    process.exit(1);
}

const query = {
  query: `{
    accounts {
      accountId
      balances {
        assetId
        balance
      }
    }
    squidStatus {
      height
    }
  }`,
};

const validateBalances = async () => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, query);
  const accounts = res.data.data.accounts as Account[];
  const squidHeight = res.data.data.squidStatus.height as bigint;
  console.log(`Received ${accounts.length} accounts at #${squidHeight} via ${GRAPHQL_HOSTNAME}`);

  const { validatedAccCount, validatedABCount, outlierMap } = await getOutliers(accounts, squidHeight);
  console.log(`\nTotal accounts validated: ${validatedAccCount}`);
  console.log(`Total asset balances validated: ${validatedABCount}`);
  if (validatedAccCount === 0) process.exit(1);
  if (outlierMap.size > 0) {
    console.log(`Asset balances don't match for ${outlierMap.size} account(s) 🔴`);
    [...outlierMap.entries()].map(([accountId, assets], idx) => {
      console.log(`${idx + 1}. ${accountId}`);
      console.log(assets);
    });
    process.exit(0);
  }
  console.log(`Asset balances match for all accounts ✅`);
  process.exit(0);
};

const getOutliers = async (
  accounts: Account[],
  squidHeight: bigint
): Promise<{ validatedAccCount: number; validatedABCount: number; outlierMap: Map<string, string[]> }> => {
  let validatedAccounts = new Set();
  let validatedABCount = 0;
  const outlierMap = new Map<string, string[]>();
  const sdk = await Tools.getSDK(NODE_URL);
  const blockHash = await sdk.api.rpc.chain.getBlockHash(squidHeight);

  await Promise.all(
    accounts.map(async (account) => {
      await Promise.all(
        account.balances.map(async (ab) => {
          let chainBalance;
          try {
            if (ab.assetId === 'Ztg') {
              const bal = (await sdk.api.query.system.account.at(blockHash, account.accountId)) as AccountInfo;
              chainBalance = new Decimal(bal.data.free.toString());
            } else if (ab.assetId.includes('campaign')) {
              const bal = (await sdk.api.query.campaignAssets.account(
                ab.assetId.replace(/\D/g, ''),
                account.accountId
              )) as any;
              chainBalance = new Decimal(bal.unwrap().balance.toString());
            } else {
              let marketId = 0;
              if (ab.assetId.includes('Outcome'))
                marketId = Number(ab.assetId.substring(ab.assetId.indexOf('[') + 1, ab.assetId.indexOf(',')));

              // Last market using tokens pallet for their assets
              if (marketId > 873) {
                const bal = (await sdk.api.query.marketAssets.account(
                  util.AssetIdFromString(ab.assetId),
                  account.accountId
                )) as any;
                chainBalance = new Decimal(bal.unwrap().balance.toString());
              } else {
                const bal = (await sdk.api.query.tokens.accounts.at(
                  blockHash,
                  account.accountId,
                  ab.assetId.includes('foreign')
                    ? { ForeignAsset: ab.assetId.replace(/\D/g, '') }
                    : util.AssetIdFromString(ab.assetId)
                )) as any;
                chainBalance = new Decimal(bal.free.toString());
              }
            }
          } catch (err) {
            if (PROGRESS) console.error(err);
          }

          if (chainBalance) {
            if (!isSame(account.accountId, chainBalance, ab)) {
              let assets = outlierMap.get(account.accountId) || [];
              assets.push(ab.assetId);
              outlierMap.set(account.accountId, assets);
            }
            validatedAccounts.add(account.accountId);
            validatedABCount++;
          }
        })
      );
    })
  );
  return { validatedAccCount: validatedAccounts.size, validatedABCount, outlierMap };
};

const isSame = (accountId: string, chainBalance: Decimal, squidBalance: AccountBalance): boolean => {
  if (chainBalance.toString() !== squidBalance.balance.toString()) {
    console.log(`\n${squidBalance.assetId} balance don't match for ${accountId}`);
    console.log(`On Chain: ${chainBalance}, On Subsquid: ${squidBalance.balance}`);
    return false;
  }

  if (PROGRESS) {
    console.log(`${squidBalance.assetId} balance match for ${accountId}`);
    console.log(`On Chain: ${chainBalance}, On Subsquid: ${squidBalance.balance}`);
  }
  return true;
};

validateBalances();
