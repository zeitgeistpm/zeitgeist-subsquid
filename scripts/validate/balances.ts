/**
 * Script to validate asset balances of all squid accounts against on-chain balance
 * Run using `ts-node scripts/validate/balances.ts wss://bsr.zeitgeist.pm`
 */
import axios from 'axios';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import { util } from '@zeitgeistpm/sdk';
import { Tools } from '../../src/mappings/util';
import { Account, AccountBalance } from '../../src/model';

const PROGRESS = false; // true or false for viewing running logs
const NODE_URL = process.argv[2];
const GRAPHQL_HOSTNAME = NODE_URL.includes(`bs`) ? `processor.zeitgeist.pm` : `processor.rpc-0.zeitgeist.pm`;

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

  const { outlierMap, validatedCount } = await getOutliers(accounts, squidHeight);
  console.log(`\nAccounts received via ${GRAPHQL_HOSTNAME}: ${accounts.length}`);
  console.log(`Total asset balances validated: ${validatedCount}`);
  if (validatedCount === 0) process.exit();
  if (outlierMap.size > 0) {
    console.log(`Asset balances don't match for ${outlierMap.size} account(s) 🔴`);
    [...outlierMap.entries()].map(([accountId, assets], idx) => {
      console.log(`${idx + 1}. ` + accountId);
      console.log(assets);
    });
    process.exit();
  }
  console.log(`Asset balances match for all accounts ✅`);
  process.exit();
};

const getOutliers = async (
  accounts: Account[],
  squidHeight: bigint
): Promise<{ outlierMap: Map<string, string[]>; validatedCount: number }> => {
  let validatedCount = 0;
  const outlierMap = new Map<string, string[]>();
  const sdk = await Tools.getSDK(NODE_URL);
  const blockHash = await sdk.api.rpc.chain.getBlockHash(squidHeight);
  await Promise.all(
    accounts.map(async (account) => {
      await Promise.all(
        account.balances.map(async (ab) => {
          try {
            if (ab.assetId === 'Ztg') {
              const {
                data: { free },
              } = (await sdk.api.query.system.account.at(blockHash, account.accountId)) as AccountInfo;
              if (!isSame(account.accountId, free, ab)) {
                let assets = outlierMap.get(account.accountId) || [];
                assets.push(ab.assetId);
                outlierMap.set(account.accountId, assets);
              }
              validatedCount++;
            } else {
              const { free } = (await sdk.api.query.tokens.accounts.at(
                blockHash,
                account.accountId,
                ab.assetId.includes('foreign')
                  ? { ForeignAsset: ab.assetId.replace(/\D/g, '') }
                  : util.AssetIdFromString(ab.assetId)
              )) as any;
              if (!isSame(account.accountId, free, ab)) {
                let assets = outlierMap.get(account.accountId) || [];
                assets.push(ab.assetId);
                outlierMap.set(account.accountId, assets);
              }
              validatedCount++;
            }
          } catch (err) {
            console.error(err);
            return { outlierMap, validatedCount };
          }
        })
      );
    })
  );
  return { outlierMap, validatedCount };
};

const isSame = (accountId: string, chainBal: any, squidAB: AccountBalance): boolean => {
  if (chainBal.toString() !== squidAB.balance.toString()) {
    console.log(`\n${squidAB.assetId} balance don't match for ${accountId}`);
    console.log(`On Chain: ${chainBal.toBigInt()}, On Subsquid: ${squidAB.balance}`);
    return false;
  }

  if (PROGRESS) {
    console.log(`${squidAB.assetId} balance match for ${accountId}`);
    console.log(`On Chain: ${chainBal.toBigInt()}, On Subsquid: ${squidAB.balance}`);
  }
  return true;
};

validateBalances();
