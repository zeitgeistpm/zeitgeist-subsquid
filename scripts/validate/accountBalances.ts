/** 
 * Script to validate Ztg balance of an account against on-chain balance
 * Run using `ts-node scripts/validate/accountBalances.ts wss://bsr.zeitgeist.pm processor.zeitgeist.pm`
 */
import { AccountInfo } from '@polkadot/types/interfaces/system';
import https from 'https';
import { Tools } from '../../src/mappings/util';

// Modify values as per requirement
const WS_NODE_URL = process.argv[2];
const QUERY_NODE_HOSTNAME = process.argv[3];

// GraphQL query for retrieving Ztg balances of accounts
const query = JSON.stringify({
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
    const blockHash = await sdk.api.rpc.chain.getBlockHash(JSON.parse(data).data.squidStatus.height);
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