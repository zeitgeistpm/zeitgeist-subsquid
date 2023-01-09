/**
 * Script to validate token balance of an account against on-chain balance
 * Run using `ts-node scripts/validate/tokenBalances.ts wss://bsr.zeitgeist.pm processor.bsr.zeitgeist.pm 1000`
 */
import { Tools } from '../../src/mappings/util';
import { util } from '@zeitgeistpm/sdk';
import https from 'https';

const WS_NODE_URL = process.argv[2];
const QUERY_NODE_HOSTNAME = process.argv[3];
const AB_LIMIT = process.argv[4];

const query = JSON.stringify({
  query: `{
     accountBalances(limit: ${AB_LIMIT}, where: {assetId_contains: "categorical"}, orderBy: id_DESC) {
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

    const accountBalances = JSON.parse(data).data.accountBalances;
    const sdk = await Tools.getSDK(WS_NODE_URL);
    const blockHash = await sdk.api.rpc.chain.getBlockHash(
      JSON.parse(data).data.squidStatus.height
    );
    console.log();

    let outlierMap = new Map<string, string[]>();
    for (let i = 0; i < accountBalances.length; i++) {
      const { free: amt } = (await sdk.api.query.tokens.accounts.at(
        blockHash,
        accountBalances[i].account.accountId,
        util.AssetIdFromString(accountBalances[i].assetId)
      )) as any;

      if (amt.toString() !== accountBalances[i].balance.toString()) {
        let assets = outlierMap.get(accountBalances[i].account.accountId) || [];
        assets.push(accountBalances[i].assetId);
        outlierMap.set(accountBalances[i].account.accountId, assets);
        console.log(
          `\n${i + 1}. ${accountBalances[i].assetId} balance don't match for ${
            accountBalances[i].account.accountId
          }`
        );
        console.log(
          `On Chain: ${amt.toBigInt()}, On Subsquid: ${
            accountBalances[i].balance
          }\n`
        );
      } else {
        console.log(
          `${i + 1}. ${accountBalances[i].assetId} balance match for ${
            accountBalances[i].account.accountId
          }`
        );
      }
    }
    sdk.api.disconnect();

    console.log(
      `\nToken balances don't match for ${outlierMap.size} account(s)`
    );
    [...outlierMap.entries()].map(([accountId, assets], idx) => {
      console.log(`${idx + 1}. ` + accountId);
      console.log(assets);
    });
    process.exit(1);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(query);
req.end();
