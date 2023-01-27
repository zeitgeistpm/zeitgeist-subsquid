/**
 * Script to validate token balance of all squid accounts against on-chain balance
 * Run using `ts-node scripts/validate/tokenBalances.ts wss://bsr.zeitgeist.pm`
 */
import axios from 'axios';
import { util } from '@zeitgeistpm/sdk';
import { Tools } from '../../src/mappings/util';
import { AccountBalance } from '../../src/model';

const PROGRESS = false; // true or false for viewing running logs
const NODE_URL = process.argv[2];
const GRAPHQL_HOSTNAME = NODE_URL.includes(`bs`)
  ? `processor.bsr.zeitgeist.pm`
  : `processor.rpc-0.zeitgeist.pm`;

const query = {
  query: `{
    accountBalances(where: {assetId_not_contains: "Ztg"}) {
      account {
        accountId
      }
      assetId
      balance
    }
    squidStatus {
      height
    }
  }`,
};

const validateTokenBalances = async () => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, query);
  const accountBalances = res.data.data.accountBalances as AccountBalance[];
  const squidHeight = res.data.data.squidStatus.height as bigint;

  const outlierMap = await getOutliers(accountBalances, squidHeight);
  if (!outlierMap) return;

  console.log(
    `\nAccount balances validated via ${GRAPHQL_HOSTNAME}: ${accountBalances.length}`
  );
  if (outlierMap.size > 0) {
    console.log(
      `Token balances don't match for ${outlierMap.size} account(s) 🔴`
    );
    [...outlierMap.entries()].map(([accountId, assets], idx) => {
      console.log(`${idx + 1}. ` + accountId);
      console.log(assets);
    });
    return;
  }
  console.log(`Token balances match for all accounts ✅`);
  return;
};

const getOutliers = async (
  accountBalances: AccountBalance[],
  squidHeight: bigint
): Promise<Map<string, string[]> | undefined> => {
  const outlierMap = new Map<string, string[]>();
  const sdk = await Tools.getSDK(NODE_URL);
  const blockHash = await sdk.api.rpc.chain.getBlockHash(squidHeight);

  await Promise.all(
    accountBalances.map(async (ab) => {
      try {
        const { free } = (await sdk.api.query.tokens.accounts.at(
          blockHash,
          ab.account.accountId,
          util.AssetIdFromString(ab.assetId)
        )) as any;

        const valid = compare(free, ab);
        if (!valid) {
          let assets = outlierMap.get(ab.account.accountId) || [];
          assets.push(ab.assetId);
          outlierMap.set(ab.account.accountId, assets);
        }
      } catch (err) {
        console.error(err);
        sdk.api.disconnect();
        return;
      }
    })
  );
  sdk.api.disconnect();
  return;
};

const compare = (chainBal: any, squidAB: AccountBalance): boolean => {
  if (chainBal.toString() !== squidAB.balance.toString()) {
    console.log(
      `\n${squidAB.assetId} balance don't match for ${squidAB.account.accountId}`
    );
    console.log(
      `On Chain: ${chainBal.toBigInt()}, On Subsquid: ${squidAB.balance}`
    );
    return false;
  }

  if (PROGRESS) {
    console.log(
      `${squidAB.assetId} balance match for ${squidAB.account.accountId}`
    );
    console.log(
      `On Chain: ${chainBal.toBigInt()}, On Subsquid: ${squidAB.balance}`
    );
  }
  return true;
};

validateTokenBalances();
