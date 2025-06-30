import axios from 'axios';
import { Field, InputType } from 'type-graphql';
import { Asset } from '../types/v51';
import { BaseAsset, CacheHint, TargetAsset, _Asset } from '../consts';
import { formatAssetId, isBatteryStation, isLocalEnv } from '../helper';
import { Cache } from '../util';
import { AssetPriceResolver } from './resolvers/assetPrice';

export const decodedAssetId = (assetId: string): string => {
  // Handle encoded combinatorial tokens
  if (assetId.startsWith('combo_')) {
    try {
      // Extract the truncated hash from the combo key
      const hashMatch = assetId.match(/^combo_([a-fA-F0-9]+)$/);
      if (!hashMatch || !hashMatch[1]) {
        throw new Error(`Invalid combo format: ${assetId}`);
      }
      
      const truncatedHash = hashMatch[1];
      
      // Validate the extracted hash format
      if (!/^[a-fA-F0-9]{8,}$/.test(truncatedHash)) {
        throw new Error(`Invalid hash format in combo: ${truncatedHash}`);
      }
      
      // Since the original hash was truncated during encoding, we need to reconstruct
      // a valid combinatorial token JSON structure. We can't recover the full hash,
      // but we can create a consistent format that downstream processes can handle.
      
      // Try to reconstruct as a proper combinatorial token JSON
      // Note: The hash is truncated, so we indicate this in the structure
      const reconstructedToken = {
        combinatorialToken: `0x${truncatedHash}_truncated`
      };
      
      return JSON.stringify(reconstructedToken);
      
    } catch (error) {
      console.warn(`Failed to reconstruct combinatorial token from ${assetId}:`, error);
      
      // Fallback: create a minimal valid JSON structure
      const fallbackHash = assetId.replace('combo_', '');
      return JSON.stringify({
        combinatorialToken: `0x${fallbackHash}_fallback`
      });
    }
  }
  
  // Handle categorical outcomes and other encoded formats
  if (assetId.includes('#')) {
    // Replace # with " to restore JSON structure
    const restored = assetId.replaceAll('#', '"');
    
    // Validate that the restored string is valid JSON
    try {
      JSON.parse(restored);
      return restored;
    } catch {
      // If not valid JSON, try to construct a proper structure
      console.warn(`Invalid JSON structure after decoding: ${restored}`);
      
      // For categorical outcomes, try to extract array format
      const arrayMatch = restored.match(/\[([^\]]+)\]/);
      if (arrayMatch) {
        try {
          const numbers = arrayMatch[1].split(',').map(s => parseInt(s.trim()));
          return JSON.stringify({ categoricalOutcome: numbers });
        } catch {
          // Fallback to raw format
          return JSON.stringify({ rawAssetId: assetId });
        }
      }
      
      // General fallback
      return JSON.stringify({ rawAssetId: assetId });
    }
  }
  
  // For unencoded assets, ensure they're in proper JSON format
  try {
    // If it's already valid JSON, return as-is
    JSON.parse(assetId);
    return assetId;
  } catch {
    // If not JSON, wrap it in a consistent structure
    return JSON.stringify({ rawAssetId: assetId });
  }
};

export const encodedAssetId = (assetId: string) => {
  // Handle combinatorial tokens (JSON format)
  if (assetId.includes('combinatorialToken')) {
    // Extract the hex hash from the combinatorial token
    const hashMatch = assetId.match(/"0x([a-f0-9]+)"/);
    return hashMatch ? `combo_${hashMatch[1].substring(0, 12)}` : assetId.replaceAll('"', '#');
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
      [BaseAsset.WSX, 1],
      [BaseAsset.ZTG, 1],
    ]);
  } else {
    // Refresh prices if they are older than 60 minutes
    if (new Date().getTime() - AssetPriceResolver.cachedAt.getTime() > 60 * 60 * 1000) refreshPrices();
    prices = new Map([
      [BaseAsset.DOT, (await fetchFromCache(BaseAsset.DOT, TargetAsset.USD)).price],
      [BaseAsset.WSX, 0],
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