/** 
 * Script to validate Ztg balance history of an account against on-chain data
 * Run using `ts-node test/validateHistoricalBalances.ts`
 */
import https from 'https';
import { Tools } from '../src/processor/util';
import { AccountInfo } from '@polkadot/types/interfaces/system';

// Modify values as per requirement
const ACCOUNT_ID = `dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW`;
const WS_NODE_URL = `wss://bsr.zeitgeist.pm`;
const QUERY_NODE_HOSTNAME = `processor.zeitgeist.pm`;

// GraphQL query for retrieving balance history of an account
const query = JSON.stringify({
  query: `{
    historicalAccountBalances(where: {accountId_eq: "${ACCOUNT_ID}", assetId_eq: "Ztg"}, orderBy: id_ASC) {
      balance
      blockNumber
      event
      dBalance
    }
  }`,
});

const options = {
  hostname: QUERY_NODE_HOSTNAME,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': query.length,
    'User-Agent': 'Node',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (d) => {
    data += d;
  });
  res.on('end', async () => {
    if (res.statusCode == 200) {
      console.log(`Validating response received from ${options.hostname}`);
    } else {
      console.log(JSON.parse(data).errors[0].message);
      return;
    }
    let balanceDiff = BigInt(0), diffs = ``, falseBlockNums = ``, trueBlockNums = ``;
    const balanceHistory = JSON.parse(data).data.historicalAccountBalances;
    console.log(`Number of records found in balance history of ${ACCOUNT_ID} : ${balanceHistory.length}`);
    const sdk = await Tools.getSDK(WS_NODE_URL);

    for (let i = 0; i < balanceHistory.length; i++) {
      const blockHash = await sdk.api.rpc.chain.getBlockHash(balanceHistory[i].blockNumber);
      const {data: { free: amt }} = (await sdk.api.query.system.account.at(blockHash, ACCOUNT_ID)) as AccountInfo;

      // Avoid checking block numbers which have already passed the check
      if (!trueBlockNums.includes(balanceHistory[i].blockNumber)) {
        if (amt.toString() !== balanceHistory[i].balance.toString()) {
          // Avoid redundant errors in case of multiple transactions in a block number
          if ((balanceHistory[i+1] !== undefined) ? balanceHistory[i].blockNumber !== balanceHistory[i+1].blockNumber : true) {
            console.log(`\nBalances don't match at ${blockHash} [#${balanceHistory[i].blockNumber}]`);
            console.log(`On Chain: ` + amt.toBigInt());
            console.log(`On Subsquid: ` + balanceHistory[i].balance);
            balanceDiff = amt.toBigInt() - BigInt(balanceHistory[i].balance);
            diffs += balanceDiff + `,`;
            falseBlockNums += balanceHistory[i].blockNumber + `,`;
          }
        } else {
          console.log(`Balances match at ${blockHash} [#${balanceHistory[i].blockNumber}]`);
          trueBlockNums += balanceHistory[i].blockNumber + `,`;
        }
      }
    }
    sdk.api.disconnect();

    if (balanceDiff == BigInt(0)) {
      console.log(`\nBalance history for ${ACCOUNT_ID} is in alliance with on-chain data`);
    } else {
      console.log(`\nBalance history for ${ACCOUNT_ID} is not in alliance with on-chain data`);
      const diffsList = diffs.split(',');
      const blockNumsList = falseBlockNums.split(',');
      console.log(`The differences found are:`)
      for (let i = 0; i < diffsList.length - 1; i++) {
        console.log(`${diffsList[i]} units at #${blockNumsList[i]}`)
      }
    }
    process.exit(1);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(query);
req.end();