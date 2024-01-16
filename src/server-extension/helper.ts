import axios from 'axios';
import { AssetPriceResolver } from './resolvers';
import { Field, InputType } from 'type-graphql';
import { Asset } from '../types/v51';
import { BaseAsset, CacheHint, TargetAsset, _Asset } from '../consts';
import { formatAssetId } from '../helper';
import { Cache } from '../util';

export const decodedAssetId = (assetId: string) => {
  return assetId.replaceAll('#', '"');
};

export const encodedAssetId = (assetId: string) => {
  return assetId.substring(assetId.indexOf('['), assetId.indexOf(']') + 1).replaceAll('"', '#');
};

// Fetch price from redis db.. Returns null in case of failure
export const fetchFromCache = async (b: string, t: string): Promise<{ pair: string; price: number }> => {
  const base = Object.keys(BaseAsset)[Object.values(BaseAsset).indexOf(<any>b)];
  const target = Object.keys(TargetAsset)[Object.values(TargetAsset).indexOf(<any>t)];
  const pair = `${base}/${target}`;

  const price = await (await Cache.init()).getData(CacheHint.Price, pair);
  return { pair, price: price ? +price : 1 };
};

export const getAssetUsdPrices = async (): Promise<Map<BaseAsset, number>> => {
  let prices: Map<BaseAsset, number>;
  if (process.env.WS_NODE_URL?.includes(`bs`)) {
    prices = new Map([
      [BaseAsset.DOT, 1],
      [BaseAsset.ZTG, 1],
    ]);
  } else {
    // Refresh prices if they are older than 60 minutes
    if (new Date().getTime() - AssetPriceResolver.cachedAt.getTime() > 60 * 60 * 1000) refreshPrices();
    prices = new Map([
      [BaseAsset.DOT, (await fetchFromCache(BaseAsset.DOT, TargetAsset.USD)).price],
      [BaseAsset.ZTG, (await fetchFromCache(BaseAsset.ZTG, TargetAsset.USD)).price],
    ]);
  }
  return prices;
};

export const mergeByField = (array1: any[], array2: any[], field: string) =>
  array1.map((a1) => ({
    ...a1,
    ...array2.find((a2) => a2[field].toString() == a1[field].toString() && a2),
  }));

// Fetch prices from Coingecko for all supported assets
export const refreshPrices = async () => {
  const ids = Object.values(BaseAsset).join(',');
  const vs_currencies = Object.values(TargetAsset).join(',');
  let res;
  try {
    res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`);
  } catch (err) {
    console.error(`Error while fetching prices from coingecko: ` + JSON.stringify(err, null, 2));
  } finally {
    if (!res || res.data.length == 0) return;
    await storeOnCache(res.data);
    AssetPriceResolver.cachedAt = new Date();
  }
};

// Traverse through response from Coingecko to cache prices
const storeOnCache = async (data: any): Promise<void> => {
  Object.entries(data).forEach(([baseAsset, targetAssetPrice]) => {
    Object.entries(targetAssetPrice as Map<string, number>).forEach(async ([targetAsset, price]) => {
      const base = Object.keys(BaseAsset)[Object.values(BaseAsset).indexOf(<any>baseAsset)];
      const target = Object.keys(TargetAsset)[Object.values(TargetAsset).indexOf(<any>targetAsset)];

      await (await Cache.init()).setData(CacheHint.Price, `${base}/${target}`, price.toString());
    });
  });
};

@InputType()
export class AssetKindValue {
  @Field(() => _Asset)
  kind!: _Asset;

  @Field(() => String, { nullable: true })
  value!: string;

  constructor(props: Partial<AssetKindValue>) {
    Object.assign(this, props);
  }

  toString(): string {
    return formatAssetId({ __kind: this.kind, value: this.value } as Asset);
  }
}
