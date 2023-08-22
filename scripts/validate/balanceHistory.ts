/**
 * Script to validate Ztg balance history of an account against on-chain data
 * Run using the command: ts-node scripts/validate/balanceHistory.ts <env> <account-id>
 */
import axios from 'axios';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import SDK from '@zeitgeistpm/sdk';
import { Tools } from '../../src/mappings/util';
import { HistoricalAccountBalance } from '../../src/model';

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
      `Example: ts-node scripts/validate/balanceHistory.ts main dDyQQkwy5MmibHv5y1qQYpADS6x2x8yJjzaTRt2uTGfeSD7V9`
    );
    process.exit(1);
}

const ACCOUNT_ID = process.argv[3];
const balanceHistoryQuery = {
  // GraphQL query for retrieving balance history of an account
  query: `{
    historicalAccountBalances(where: {accountId_eq: "${ACCOUNT_ID}", assetId_eq: "Ztg"}, orderBy: blockNumber_ASC) {
      blockNumber
    }
  }`,
};

const validateBalanceHistory = async () => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, balanceHistoryQuery);
  const balanceHistory = res.data.data.historicalAccountBalances as HistoricalAccountBalance[];
  console.log(`Received ${balanceHistory.length} records of ${ACCOUNT_ID} via ${GRAPHQL_HOSTNAME}`);

  const sdk = await Tools.getSDK(NODE_URL);
  let fromBlockNum = balanceHistory[0].blockNumber;
  let toBlockNum = balanceHistory[balanceHistory.length - 1].blockNumber;
  let lastDiff = BigInt(0);

  // Inspired by binary search algorithm
  while (fromBlockNum <= toBlockNum) {
    console.log(`Reading between #${fromBlockNum} and #${toBlockNum}`);
    const midBlockNum = Math.floor((fromBlockNum + toBlockNum) / 2);
    const chainBalance = await getChainBalance(sdk, midBlockNum);
    const squidBalance = await getSquidBalance(midBlockNum);

    console.log(`Detected difference of ${squidBalance - chainBalance} ZTG at #${midBlockNum}`);
    if (squidBalance - chainBalance !== BigInt(0)) {
      toBlockNum = midBlockNum;
      lastDiff = squidBalance - chainBalance;
    } else {
      fromBlockNum = midBlockNum;
    }

    // When all block numbers are covered
    if (toBlockNum - fromBlockNum === 1) {
      if (lastDiff !== BigInt(0)) {
        console.log(`\nFound difference of ${lastDiff} ZTG on ${ACCOUNT_ID} at #${toBlockNum}`);
        console.log(`On Subsquid: ${squidBalance}, On Chain: ${chainBalance}`);
      } else {
        console.log(`Ztg balance history of ${ACCOUNT_ID} is in sync with ${CHAIN_ENV} chain`);
      }
      sdk.api.disconnect();
      process.exit(0);
    }
  }
};

// To query indexer for Ztg balance as on block number
const getSquidBalance = async (blockNumber: number): Promise<bigint> => {
  const res = await axios.post(`https://${GRAPHQL_HOSTNAME}/graphql`, {
    query: `{
      balanceInfo(accountId: "${ACCOUNT_ID}", blockNumber: "${blockNumber}") {
        balance
      }
    }`,
  });
  const balance = res.data.data.balanceInfo.balance as string;
  return BigInt(balance);
};

// To query chain for Ztg balance as on block number
const getChainBalance = async (sdk: SDK, blockNumber: number) => {
  const blockHash = await sdk.api.rpc.chain.getBlockHash(blockNumber);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(blockHash, ACCOUNT_ID)) as AccountInfo;
  return amt.toBigInt();
};

validateBalanceHistory();
