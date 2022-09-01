/** 
 * Script to validate Ztg balance of an account against on-chain balance
 * Run using `ts-node test/validateBalances.ts`
 */
import https from 'https';
import { Tools } from '../src/processor/util';
import { AccountInfo } from '@polkadot/types/interfaces/system';

// Modify values as per requirement
const WS_NODE_URL = `wss://bsr.zeitgeist.pm`;
const QUERY_NODE_HOSTNAME = `processor.zeitgeist.pm`;
const ACCOUNTS_LIMIT = 20; // Number of accounts that need to be validated
const BLOCK_NUMBER = 1601267; // Balances from polkadot.js will be pulled as on this block number on chain

// GraphQL query for retrieving Ztg balances of accounts
const query = JSON.stringify({
  query: `{
    accountBalances(where: {assetId_eq: "Ztg"}, limit: ${ACCOUNTS_LIMIT}) {
      account {
        accountId
      }
      assetId
      balance
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
    let falseCounter = 0, trueCounter = 0, falseAccs = ``;
    const accounts = JSON.parse(data).data.accountBalances;
    const sdk = await Tools.getSDK(WS_NODE_URL);

    /**
     * It is recommended to use `BLOCK_NUMBER` few blocks before finalized head 
     * of the chain so that subsquid has the data processed in its database.
     */
    const blockHash = await sdk.api.rpc.chain.getBlockHash(BLOCK_NUMBER);
    console.log();

    for (let i = 0; i < accounts.length; i++) {
      const {data: { free: amt }} = 
        (await sdk.api.query.system.account.at(blockHash, accounts[i].account.accountId)) as AccountInfo;
      if (amt.toString() !== accounts[i].balance.toString()) {
        falseCounter++;
        falseAccs += accounts[i].account.accountId + `,`;
        console.log(`\n${trueCounter+falseCounter}. Balances don't match for ` + accounts[i].account.accountId);
        console.log(`On Chain: ` + amt.toBigInt());
        console.log(`On Subsquid: ` + accounts[i].balance);
        console.log();
      } else {
        trueCounter++;
        console.log(`${trueCounter+falseCounter}. Balances match for ` + accounts[i].account.accountId);
      }
    }
    sdk.api.disconnect();

    console.log(`\nTotal accounts checked: ${trueCounter+falseCounter}`);
    console.log(`Balances match for ${trueCounter} accounts`);
    if (falseCounter > 0) {
      const falseAccsList = falseAccs.split(',');
      console.log(`Balances don't match for the below ${falseCounter} account(s):`);
      for (let a in falseAccsList) {
        console.log(falseAccsList[a]);
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