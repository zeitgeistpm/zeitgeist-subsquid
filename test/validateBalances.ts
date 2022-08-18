/** 
 * Script to validate Ztg balance of an account with polkadot.js 
 */
import https from 'https'
import { Tools } from "../src/processor/util"
import { AccountInfo } from "@polkadot/types/interfaces/system";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Temporarily stop verifying https certificate

var falseCounter = 0, trueCounter = 0, falseAccs = ``;
const accountLimit = 20; // Number of accounts that need to be validated
const blockNumber = 1601267; // Balances from polkadot.js will be pulled as on this block number on chain

// GraphQL query for retrieving Ztg balances of accounts
const query = JSON.stringify({
  query: `{
    accountBalances(where: {assetId_eq: "Ztg"}, limit: ${accountLimit}) {
      account {
        accountId
      }
      assetId
      balance
    }
  }`,
});

const options = {
  hostname: 'processor.zeitgeist.pm',
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
    const accounts = JSON.parse(data).data.accountBalances;
    const sdk = await Tools.getSDK();

    /**
     * It is recommended to use `blockNumber` few blocks before finalized head 
     * of the chain so that subsquid has the data processed in its database.
     */
    const blockHash = await sdk.api.rpc.chain.getBlockHash(blockNumber);
    console.log();

    for (var i = 0; i < accounts.length; i++) {
      const {data: { free: amt }} = 
        (await sdk.api.query.system.account.at(blockHash, accounts[i].account.accountId)) as AccountInfo;
      if (amt.toString() !== accounts[i].balance.toString()) {
        falseCounter++;
        falseAccs += accounts[i].account.accountId + `,`;
        console.log(`\nBalances don't match for ` + accounts[i].account.accountId);
        console.log(`On Polkadot.js: ` + amt.toBigInt());
        console.log(`On Subsquid: ` + accounts[i].balance);
        console.log();
      } else {
        trueCounter++;
        console.log(`Balances match for ` + accounts[i].account.accountId);
      }
    }
    console.log(`\nTotal accounts checked: ${trueCounter+falseCounter}`);
    console.log(`Balances match for ${trueCounter} accounts`);
    if (falseCounter > 0) {
      console.log(`Balances don't match for the below ${falseCounter} account(s):`);
      var falseAccsList = falseAccs.split(',');
      for (var a in falseAccsList) {
        console.log(falseAccsList[a]);
      }
    }
    process.exit();
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(query);
req.end();