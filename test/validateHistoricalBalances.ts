/** 
 * Script to validate Ztg balance history of an account with polkadot.js 
 */
import https from 'https';
import { Tools } from '../src/processor/util';
import { AccountInfo } from '@polkadot/types/interfaces/system';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Temporarily stop verifying https certificate

// Modify values as per requirement
const ACCOUNT_ID = `dE1VdxVn8xy7HFH9dLeebJu3eELFqXXjK8c2cwEuRJXr4QAZA`;
const WS_NODE_URL = `wss://bsr.zeitgeist.pm`;
const QUERY_NODE_HOSTNAME = `processor.zeitgeist.pm`;

// GraphQL query for retrieving balance history of an account
const query = JSON.stringify({
  query: `{
    historicalAccountBalances(where: {accountId_eq: "${ACCOUNT_ID}", assetId_eq: "Ztg"}, orderBy: blockNumber_ASC) {
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
    const accounts = JSON.parse(data).data.historicalAccountBalances;
    const sdk = await Tools.getSDK(WS_NODE_URL);
    console.log(`For Account Id: ${ACCOUNT_ID}`);

    for (var i = 0; i < accounts.length; i++) {
      const blockHash = await sdk.api.rpc.chain.getBlockHash(accounts[i].blockNumber);
      const {data: { free: amt }} = (await sdk.api.query.system.account.at(blockHash, ACCOUNT_ID)) as AccountInfo;

      if (amt.toString() !== accounts[i].balance.toString()) {
        console.log(`\nBalances don't match at ${blockHash} [#${accounts[i].blockNumber}]`);
        console.log(`On Polkadot.js: ` + amt.toBigInt());
        console.log(`On Subsquid: ` + accounts[i].balance);
      } else {
        console.log(`Balances match at ${blockHash} [#${accounts[i].blockNumber}]`);
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