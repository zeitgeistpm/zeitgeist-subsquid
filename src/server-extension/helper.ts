import axios from 'axios';
import { Field, InputType } from 'type-graphql';
import { Asset } from '../types/v51';
import { BaseAsset, CacheHint, TargetAsset, _Asset } from '../consts';
import { formatAssetId, isBatteryStation, isLocalEnv } from '../helper';
import { Cache } from '../util';
import { AssetPriceResolver } from './resolvers/assetPrice';
import { isHexadecimal } from 'is-hexadecimal';

// Optimized helper for combinatorial token validation
const isCombinatorialToken = (str: string): boolean => {
  return (str.length === 63 || str.length === 64) && isHexadecimal(str);
};

// Simplified extraction function
const extractCombinatorialHash = (assetId: string): string | null => {
  try {
    const parsed = JSON.parse(assetId);
    if (!parsed?.combinatorialToken) return null;
    
    const tokenValue = parsed.combinatorialToken.toString();
    return tokenValue.startsWith('0x') ? tokenValue.slice(2) : tokenValue;
  } catch {
    return null;
  }
};

export const decodedAssetId = (assetId: string): string => {
  // Handle raw combinatorial token hashes
  if (isCombinatorialToken(assetId)) {
    return JSON.stringify({
      combinatorialToken: `0x${assetId}`
    });
  }
  
  // Handle categorical outcomes: [885,0] -> {"categoricalOutcome":[885,0]}
  const arrayMatch = assetId.match(/^\[(\d+),(\d+)\]$/);
  if (arrayMatch) {
    return JSON.stringify({
      categoricalOutcome: [parseInt(arrayMatch[1]), parseInt(arrayMatch[2])]
    });
  }
  
  // Handle encoded categorical outcomes with #: [885#0] -> {"categoricalOutcome":[885,0]}
  if (assetId.includes('#')) {
    const restored = assetId.replaceAll('#', ',');
    const arrayMatch2 = restored.match(/^\[(\d+),(\d+)\]$/);
    if (arrayMatch2) {
      return JSON.stringify({
        categoricalOutcome: [parseInt(arrayMatch2[1]), parseInt(arrayMatch2[2])]
      });
    }
    // Fallback for other # encoded formats
    return assetId.replaceAll('#', '"');
  }
  
  // Return valid JSON as-is, or simple strings like "Ztg"
  try {
    JSON.parse(assetId);
    return assetId;
  } catch {
    return assetId;
  }
};

export const encodedAssetId = (assetId: string) => {
  // Handle combinatorial tokens
  if (assetId.includes('combinatorialToken')) {
    const hash = extractCombinatorialHash(assetId);
    return hash || assetId.replaceAll('"', '#');
  }
  
  // Handle categorical outcomes (bracket format)
  if (assetId.includes('[') && assetId.includes(']')) {
    return assetId.substring(assetId.indexOf('['), assetId.indexOf(']') + 1).replaceAll('"', '#');
  }
  
  // Fallback for other formats
  return assetId.replaceAll('"', '#');
};

// Fetch price from redis db.. Returns null in case of failure
export const fetchFromCache = async (b: string, t: string): Promise<{ pair: string; price: number }> => {
  const base = Object.keys(BaseAsset)[Object.values(BaseAsset).indexOf(<any>b)];
  const target = Object.keys(TargetAsset)[Object.values(TargetAsset).indexOf(<any>t)];
  const pair = `${base}/${target}`;

  if (isLocalEnv()) return { pair, price: 1 };
  const price = await (await Cache.init()).getData(CacheHint.Price, pair);
  return { pair, price: price ? +price : 1 };
};

export const getAssetUsdPrices = async (): Promise<Map<BaseAsset, number>> => {
  let prices: Map<BaseAsset, number>;
  if (isLocalEnv() || isBatteryStation()) {
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
  if (isLocalEnv()) return;
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