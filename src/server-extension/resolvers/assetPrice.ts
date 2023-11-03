import { Arg, Field, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import { CacheHint, EPOCH_TIME, TEN_MINUTES } from '../../mappings/helper';
import { Cache } from '../../mappings/util';
import { HistoricalMarket } from '../../model';

@ObjectType()
export class AssetPrice {
  @Field(() => String)
  pair!: string;

  @Field(() => Number, { nullable: true })
  price!: number | undefined;

  @Field(() => Date)
  timestamp!: Date;

  constructor(props: Partial<AssetPrice>) {
    Object.assign(this, props);
  }
}

enum BaseAsset {
  DOT = 'polkadot',
  ZTG = 'zeitgeist',
}

enum TargetAsset {
  USD = 'usd',
}

registerEnumType(BaseAsset, {
  name: 'BaseAsset',
});

registerEnumType(TargetAsset, {
  name: 'TargetAsset',
});

@Resolver()
export class AssetPriceResolver {
  static cachedAt: Date = EPOCH_TIME;

  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [AssetPrice])
  async assetPrice(
    @Arg('base', () => [BaseAsset], { nullable: false }) base: BaseAsset[],
    @Arg('target', () => [TargetAsset], { nullable: false }) target: TargetAsset[]
  ): Promise<AssetPrice[]> {
    // Required for visibility on graphql
    const result = (await this.tx()).getRepository(HistoricalMarket);

    // Refresh prices if they are older than 10 minutes
    if (new Date().getTime() - AssetPriceResolver.cachedAt.getTime() > TEN_MINUTES) {
      refreshPrices();
    }

    // Remove duplicates
    const bases = [...new Set(base)];
    const targets = [...new Set(target)];

    const prices: AssetPrice[] = [];
    for (let i = 0; i < bases.length; i++) {
      for (let j = 0; j < targets.length; j++) {
        const pairedAsset = generatePair(bases[i], targets[j]);
        prices.push({
          pair: pairedAsset,
          price: await fetchFromCache(pairedAsset),
          timestamp: AssetPriceResolver.cachedAt,
        });
      }
    }
    return prices;
  }
}

// Fetch prices from Coingecko for all supported assets
const refreshPrices = async () => {
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

// Fetch price from redis db.. Returns null in case of failure
const fetchFromCache = async (pair: string): Promise<number | undefined> => {
  const price = await (await Cache.init()).getData(CacheHint.Price, pair);
  return price ? +price : undefined;
};

// Traverse through response from Coingecko to cache prices
const storeOnCache = async (data: any): Promise<void> => {
  Object.entries(data).forEach(([baseAsset, targetAssetPrice]) => {
    Object.entries(targetAssetPrice as Map<string, number>).forEach(async ([targetAsset, price]) => {
      await (await Cache.init()).setData(CacheHint.Price, generatePair(baseAsset, targetAsset), price.toString());
    });
  });
};

const generatePair = (b: string, t: string): string => {
  const base = Object.keys(BaseAsset)[Object.values(BaseAsset).indexOf(<any>b)];
  const target = Object.keys(TargetAsset)[Object.values(TargetAsset).indexOf(<any>t)];
  return `${base}/${target}`;
};
