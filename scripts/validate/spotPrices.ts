/**
 * Script to validate spot price of an asset against on-chain price
 * Run using `ts-node scripts/validate/spotPrices.ts wss://bsr.zeitgeist.pm processor.bsr.zeitgeist.pm`
 */
import { AssetIdFromString } from '@zeitgeistpm/sdk/dist/util';
import https from 'https';
import { Tools } from '../../src/mappings/util';

// Modify values as per requirement
const NODE_URL = process.argv[2];
const QUERY_NODE_HOSTNAME = process.argv[3];
const ASSETS_LIMIT = 100; // Number of assets that need to be validated

// GraphQL query for retrieving price of assets
const query = JSON.stringify({
  query: `{
    assets(limit: ${ASSETS_LIMIT}, orderBy: id_DESC, where: {price_gt: 0}) {
      assetId
      price
      poolId
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
    let falseCounter = 0,
      trueCounter = 0,
      falseAssets = ``;
    const assets = JSON.parse(data).data.assets;
    const sdk = await Tools.getSDK(NODE_URL);

    const blockHash = await sdk.api.rpc.chain.getBlockHash(
      JSON.parse(data).data.squidStatus.height
    );
    console.log();

    for (let i = 0; i < assets.length; i++) {
      //Remove exceptions
      if (assets[i].assetId.includes('scalar')) continue;
      if (assets[i].price == 0 || assets[i].price == 1) continue;

      //@ts-ignore
      let price = await sdk.api.rpc.swaps.getSpotPrice(
        Number(assets[i].poolId),
        AssetIdFromString({ ztg: null }),
        AssetIdFromString(assets[i].assetId),
        blockHash
      );
      price = Number(price) / Math.pow(10, 10);

      const chainPrice = Math.round(price * 10); //Round to one decimal place
      const squidPrice = Math.round(assets[i].price * 10) ?? 0;
      if (chainPrice !== squidPrice) {
        falseCounter++;
        falseAssets +=
          `${assets[i].assetId} - pool id ${assets[i].poolId}` + `|`;
        console.log(
          `\n${trueCounter + falseCounter}. Prices don't match for ${
            assets[i].assetId
          } of pool id ${assets[i].poolId}`
        );
        console.log(`On Chain: ` + price);
        console.log(`On Subsquid: ` + assets[i].price);
        console.log();
      } else {
        trueCounter++;
        console.log(
          `${trueCounter + falseCounter}. Prices match for ` + assets[i].assetId
        );
      }
    }
    sdk.api.disconnect();

    console.log(`\nTotal assets checked: ${trueCounter + falseCounter}`);
    console.log(`Prices match for ${trueCounter} assets`);
    if (falseCounter > 0) {
      const falseAssetsList = falseAssets.split('|');
      console.log(`Prices don't match for the below ${falseCounter} asset(s):`);
      for (let a in falseAssetsList) {
        console.log(falseAssetsList[a]);
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
