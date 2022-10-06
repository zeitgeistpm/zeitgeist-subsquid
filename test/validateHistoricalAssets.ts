/**
 * Script to validate units of an asset in pool against on-chain data
 * Run using `ts-node test/validateHistoricalAssets.ts`
 */
import { util } from '@zeitgeistpm/sdk';
import https from 'https';
import { Tools } from '../src/mappings/util';

// Modify values as per requirement
const NODE_URL = `wss://bsr.zeitgeist.pm`;
const QUERY_NODE_HOSTNAME = `processor.bsr.zeitgeist.pm`;
const MARKET_ID = 44;
const ASSET_INDEX = 0;
const POOL_ID = 30;

// GraphQL query for retrieving balance history of an asset in pool
const query = JSON.stringify({
  query: `{
     historicalAssets(where: {assetId_contains: "[${MARKET_ID},${ASSET_INDEX}]"}, orderBy: id_DESC) {
      newAmountInPool
      blockNumber
     }
     accounts(where: {poolId_eq: ${POOL_ID}}) {
      accountId
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
    let balanceDiff = BigInt(0),
      diffs = ``,
      falseBlockNums = ``,
      trueBlockNums = ``;
    const assetHistory = JSON.parse(data).data.historicalAssets;
    const accountId = JSON.parse(data).data.accounts[0].accountId;
    console.log(
      `Number of records found in balance history of [${MARKET_ID},${ASSET_INDEX}] : ${assetHistory.length}`
    );
    const sdk = await Tools.getSDK(NODE_URL);

    for (let i = 0; i < assetHistory.length; i++) {
      const blockHash = await sdk.api.rpc.chain.getBlockHash(
        assetHistory[i].blockNumber
      );
      const balance = (await sdk.api.query.tokens.accounts.at(
        blockHash,
        accountId,
        util.AssetIdFromString(`[${MARKET_ID},${ASSET_INDEX}]`)
      )) as any;

      if (!trueBlockNums.includes(assetHistory[i].blockNumber)) {
        if (
          balance.free.toString() !== assetHistory[i].newAmountInPool.toString()
        ) {
          console.log(
            `\n${
              assetHistory.length - i
            }. Balances don't match at ${blockHash} [#${
              assetHistory[i].blockNumber
            }]`
          );
          console.log(`On Chain: ` + balance.free.toBigInt());
          console.log(`On Subsquid: ` + assetHistory[i].newAmountInPool);
          balanceDiff =
            balance.free.toBigInt() - BigInt(assetHistory[i].newAmountInPool);
          diffs += balanceDiff + `,`;
          falseBlockNums += assetHistory[i].blockNumber + `,`;
        } else {
          console.log(
            `${assetHistory.length - i}. Balances match at ${blockHash} [#${
              assetHistory[i].blockNumber
            }]`
          );
          trueBlockNums += assetHistory[i].blockNumber + `,`;
        }
      }
    }
    sdk.api.disconnect();

    if (balanceDiff == BigInt(0)) {
      console.log(
        `\nAsset balance history on ${accountId} is in alliance with on-chain data`
      );
    } else {
      console.log(
        `\nAsset balance history on ${accountId} is not in alliance with on-chain data`
      );
      const diffsList = diffs.split(',');
      const blockNumsList = falseBlockNums.split(',');
      console.log(`The differences found are:`);
      for (let i = diffsList.length; i > 1; i--) {
        console.log(`${diffsList[i - 2]} units at #${blockNumsList[i - 2]}`);
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
