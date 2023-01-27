/**
 * Script to validate Ztg balance of all squid accounts against on-chain balance
 * Run using `ts-node scripts/validate/ztgBalances.ts wss://bsr.zeitgeist.pm`
 */
import axios from 'axios';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import { Tools } from '../../src/mappings/util';
import { AccountBalance } from '../../src/model';

const PROGRESS = false; // true or false for viewing running logs
const NODE_URL = process.argv[2];
const GRAPHQL_HOSTNAME = NODE_URL.includes(`bs`)
  ? `processor.bsr.zeitgeist.pm`
  : `processor.rpc-0.zeitgeist.pm`;

const query = {
  query: `{
    accountBalances(where: {assetId_eq: "Ztg"}) {
      account {
        accountId
      }
      balance
    }
    squidStatus {
      height
    }
  }`,
};

const validateZtgBalances = async () => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, query);
  const accountBalances = res.data.data.accountBalances as AccountBalance[];
  const squidHeight = res.data.data.squidStatus.height as bigint;

  const outliers = await getOutliers(accountBalances, squidHeight);
  if (!outliers) return;

  console.log(
    `\nAccounts validated via ${GRAPHQL_HOSTNAME}: ${accountBalances.length}`
  );
  if (outliers.length > 0) {
    console.log(
      `Ztg balances don't match for ${outliers.length} account(s) 🔴`
    );
    outliers.map((accountId, idx) => {
      console.log(`${idx + 1}. ` + accountId);
    });
    return;
  }
  console.log(`Ztg balances match for all accounts ✅`);
  return;
};

const getOutliers = async (
  accountBalances: AccountBalance[],
  squidHeight: bigint
): Promise<string[] | undefined> => {
  const outliers: string[] = [];
  const sdk = await Tools.getSDK(NODE_URL);
  const blockHash = await sdk.api.rpc.chain.getBlockHash(squidHeight);

  await Promise.all(
    accountBalances.map(async (ab) => {
      try {
        const {
          data: { free },
        } = (await sdk.api.query.system.account.at(
          blockHash,
          ab.account.accountId
        )) as AccountInfo;

        if (!compare(free, ab)) {
          outliers.push(ab.account.accountId);
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
    console.log(`\nZtg balance don't match for ${squidAB.account.accountId}`);
    console.log(
      `On Chain: ${chainBal.toBigInt()}, On Subsquid: ${squidAB.balance}`
    );
    return false;
  }

  if (PROGRESS) {
    console.log(`Ztg balance match for ${squidAB.account.accountId}`);
    console.log(
      `On Chain: ${chainBal.toBigInt()}, On Subsquid: ${squidAB.balance}`
    );
  }
  return true;
};

validateZtgBalances();
