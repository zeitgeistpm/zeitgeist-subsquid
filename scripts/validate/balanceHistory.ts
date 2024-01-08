/**
 * Script to validate asset balance history of an account against on-chain data
 * Run using the command: ts-node scripts/validate/balanceHistory.ts <env> <account-id> <asset-kind> <asset-value1> <asset-value2>
 */
import axios from 'axios';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import SDK, { util } from '@zeitgeistpm/sdk';
import { HistoricalAccountBalance } from '../../src/model';
import { Tools } from '../../src/util';

let NODE_URL: string;
let GRAPHQL_HOSTNAME: string;
const CHAIN_ENV = process.argv[2];
switch (CHAIN_ENV) {
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
    console.log(
      `Example: ts-node scripts/validate/balanceHistory.ts dev dE3phcNpdXRzK8RQnWej9C87CJ3AphKwCYXniTKAqiaUfdfCz PoolShare 316`
    );
    process.exit(1);
}

const ACCOUNT_ID = process.argv[3];
const ASSET_KIND = process.argv[4];
const ASSET_VALUE1 = process.argv[5];
const ASSET_VALUE2 = process.argv[6];

let chainAssetId: any,
  assetValue: string | null,
  assetQuery = '';
switch (ASSET_KIND) {
  case 'CategoricalOutcome':
    assetValue = `${ASSET_VALUE1},${ASSET_VALUE2}`;
    assetQuery = `assetId_contains: "[${assetValue}]"`;
    chainAssetId = util.AssetIdFromString(`[${assetValue}]`);
    break;
  case 'ForeignAsset':
    assetValue = ASSET_VALUE1;
    assetQuery = `assetId_contains: "foreign", AND: {assetId_contains: "${assetValue}"}`;
    chainAssetId = { ForeignAsset: ASSET_VALUE1 };
    break;
  case 'PoolShare':
    assetValue = ASSET_VALUE1;
    assetQuery = `assetId_contains: "pool", AND: {assetId_contains: "${assetValue}"}`;
    chainAssetId = util.AssetIdFromString(`pool ${assetValue}`);
    break;
  case 'Ztg':
    assetValue = null;
    assetQuery = `assetId_eq: "${ASSET_KIND}"`;
    chainAssetId = ASSET_KIND;
    break;
  default:
    console.log(`Please pass CategoricalOutcome/ForeignAsset/PoolShare/ScalarOutcome/Ztg as asset-kind`);
    console.log(
      `Example: ts-node scripts/validate/balanceHistory.ts dev dE3phcNpdXRzK8RQnWej9C87CJ3AphKwCYXniTKAqiaUfdfCz CategoricalOutcome 367 0`
    );
    process.exit(1);
}

const balanceHistoryQuery = {
  // GraphQL query for retrieving balance history of an account
  query: `{
    historicalAccountBalances(where: {accountId_eq: "${ACCOUNT_ID}", ${assetQuery}}, orderBy: blockNumber_ASC, limit: 1) {
      blockNumber
    }
    squidStatus {
      height
    }
  }`,
};

const validateBalanceHistory = async () => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, balanceHistoryQuery);
  const balanceHistory = res.data.data.historicalAccountBalances as HistoricalAccountBalance[];
  const squidHeight = +res.data.data.squidStatus.height.toString();
  console.log(`Validating balance history of ${JSON.stringify(chainAssetId)} on ${ACCOUNT_ID} via ${GRAPHQL_HOSTNAME}`);
  if (balanceHistory.length === 0) process.exit(0);

  const sdk = await Tools.getSDK(NODE_URL);
  let fromBlockNum = balanceHistory[0].blockNumber - 1;
  let toBlockNum = squidHeight;
  let lastChainBalance = BigInt(0);
  let lastSquidBalance = BigInt(0);

  // Inspired by binary search algorithm
  while (fromBlockNum < toBlockNum) {
    console.log(`Reading between #${fromBlockNum} and #${toBlockNum}`);
    const midBlockNum = Math.floor((fromBlockNum + toBlockNum) / 2);
    const chainBalance = await getChainBalance(sdk, midBlockNum);
    const squidBalance = await getSquidBalance(midBlockNum);

    console.log(`Detected difference of ${squidBalance - chainBalance} units at #${midBlockNum}`);
    if (squidBalance !== chainBalance) {
      toBlockNum = midBlockNum;
      lastChainBalance = chainBalance;
      lastSquidBalance = squidBalance;
    } else {
      fromBlockNum = midBlockNum;
    }

    // When all block numbers are covered
    if (toBlockNum - fromBlockNum === 1) {
      console.log();
      if (lastSquidBalance !== lastChainBalance) {
        console.log(
          `Found difference of ${lastSquidBalance - lastChainBalance} units on ${ACCOUNT_ID} at #${toBlockNum}`
        );
        console.log(`On Subsquid: ${lastSquidBalance}, On Chain: ${lastChainBalance}`);
      } else {
        console.log(
          `${JSON.stringify(chainAssetId)} balance history of ${ACCOUNT_ID} is in sync with ${CHAIN_ENV} chain`
        );
      }
      sdk.api.disconnect();
      process.exit(0);
    }
  }
};

// To query indexer for asset balance as on block number
const getSquidBalance = async (blockNumber: number): Promise<bigint> => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, {
    query: `{
      balanceInfo(accountId: "${ACCOUNT_ID}", assetId: {kind: ${ASSET_KIND}, value: "${assetValue}"}, blockNumber: "${blockNumber}") {
        balance
      }
    }`,
  });
  const balance = res.data.data.balanceInfo.balance as string;
  return BigInt(balance);
};

// To query chain for asset balance as on block number
const getChainBalance = async (sdk: SDK, blockNumber: number) => {
  const blockHash = await sdk.api.rpc.chain.getBlockHash(blockNumber);
  try {
    if (ASSET_KIND === 'Ztg') {
      const {
        data: { free },
      } = (await sdk.api.query.system.account.at(blockHash, ACCOUNT_ID)) as AccountInfo;
      return free.toBigInt();
    } else {
      const { free } = (await sdk.api.query.tokens.accounts.at(blockHash, ACCOUNT_ID, chainAssetId)) as any;
      return free.toBigInt();
    }
  } catch (err) {
    console.error(err);
  }
};

validateBalanceHistory();
