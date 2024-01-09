import axios from 'axios';
import { Asset } from '../consts';

export const decodedAssetId = (assetId: string) => {
  return assetId.replaceAll('#', '"');
};

export const encodedAssetId = (assetId: string) => {
  return assetId.substring(assetId.indexOf('['), assetId.indexOf(']') + 1).replaceAll('"', '#');
};

export const getAssetUsdPrices = async (): Promise<Map<Asset, number>> => {
  const prices: Map<Asset, number> = new Map([
    [Asset.Polkadot, 1],
    [Asset.Zeitgeist, 1],
  ]);
  if (process.env.WS_NODE_URL?.includes(`bs`)) return prices;
  await Promise.all(
    Array.from(prices).map(async (price) => {
      try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${price[0]}&vs_currencies=usd`);
        prices.set(price[0], res.data[price[0]].usd);
      } catch (err) {
        console.log(JSON.stringify(err, null, 2));
      }
    })
  );
  return prices;
};

export const mergeByField = (array1: any[], array2: any[], field: string) =>
  array1.map((a1) => ({
    ...a1,
    ...array2.find((a2) => a2[field].toString() == a1[field].toString() && a2),
  }));
