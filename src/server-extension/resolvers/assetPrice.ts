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

enum NumeratorAsset {
  DOT = 'polkadot',
  ZTG = 'zeitgeist',
}

enum DenominatorAsset {
  USD = 'usd',
}

registerEnumType(NumeratorAsset, {
  name: 'NumeratorAsset',
});

registerEnumType(DenominatorAsset, {
  name: 'DenominatorAsset',
});

@Resolver()
export class AssetPriceResolver {
  static cachedAt: Date = EPOCH_TIME;

  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [AssetPrice])
  async assetPrice(
    @Arg('assetId', () => [NumeratorAsset], { nullable: false }) numerator: NumeratorAsset[],
    @Arg('denominator', () => [DenominatorAsset], { nullable: false }) denominator: DenominatorAsset[]
  ): Promise<AssetPrice[]> {
    // Required for visibility on graphql
    const result = (await this.tx()).getRepository(HistoricalMarket);

    // Refresh prices if they are older than 10 minutes
    if (new Date().getTime() - AssetPriceResolver.cachedAt.getTime() > TEN_MINUTES) {
      refreshPrices();
    }

    // Remove duplicates
    const nums = [...new Set(numerator)];
    const dens = [...new Set(denominator)];

    const prices: AssetPrice[] = [];
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < dens.length; j++) {
        const pairedAsset = generatePair(nums[i], dens[j]);
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
  const ids = Object.values(NumeratorAsset).join(',');
  const vs_currencies = Object.values(DenominatorAsset).join(',');
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
  Object.entries(data).forEach(([numAsset, denAssetPrice]) => {
    Object.entries(denAssetPrice as Map<string, number>).forEach(async ([denAsset, price]) => {
      await (await Cache.init()).setData(CacheHint.Price, generatePair(numAsset, denAsset), price.toString());
    });
  });
};

const generatePair = (num: string, den: string): string => {
  const numerator = Object.keys(NumeratorAsset)[Object.values(NumeratorAsset).indexOf(<any>num)];
  const denominator = Object.keys(DenominatorAsset)[Object.values(DenominatorAsset).indexOf(<any>den)];
  return `${numerator}/${denominator}`;
};
