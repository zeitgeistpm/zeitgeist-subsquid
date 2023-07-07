import { Arg, Field, Int, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import axios from 'axios';
import { Market } from '../../model/generated';
import { marketStats } from '../query';

@ObjectType()
export class MarketStats {
  @Field(() => Int, { name: 'marketId' })
  market_id!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => BigInt)
  liquidity!: bigint;

  @Field(() => BigInt)
  volume!: bigint;

  constructor(props: Partial<MarketStats>) {
    Object.assign(this, props);
  }
}

enum OrderBy {
  liquidity_ASC = 'liquidity ASC',
  liquidity_DESC = 'liquidity DESC',
  participants_ASC = 'participants ASC',
  participants_DESC = 'participants DESC',
  volume_ASC = 'volume ASC',
  volume_DESC = 'volume DESC',
}

registerEnumType(OrderBy, {
  name: 'OrderBy',
  description: 'Ordering stats',
});

@Resolver()
export class MarketStatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [MarketStats])
  async marketStats(
    @Arg('marketId', () => [Int], { nullable: true }) ids: string,
    @Arg('orderBy', () => OrderBy, { nullable: true }) orderBy: OrderBy,
    @Arg('limit', () => Int, { nullable: true }) limit: number,
    @Arg('offset', () => Int, { nullable: true }) offset: number
  ): Promise<MarketStats[]> {
    const manager = await this.tx();
    const result = await manager.getRepository(Market).query(
      marketStats(ids ?? 'SELECT market_id FROM market', orderBy ?? OrderBy.volume_DESC, limit ?? 10, offset ?? 0, {
        [Asset.Polkadot]: await getAssetUsdPrice(Asset.Polkadot),
        [Asset.Zeitgeist]: await getAssetUsdPrice(Asset.Zeitgeist),
      })
    );
    return result;
  }
}

const getAssetUsdPrice = async (coinGeckoId: Asset): Promise<any> => {
  return new Promise(async (resolve) => {
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`);
      resolve(res.data[`${coinGeckoId}`].usd);
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      if (coinGeckoId === Asset.Zeitgeist) resolve(0.0357);
      else resolve(5.08);
    }
  });
};

export enum Asset {
  Polkadot = 'polkadot',
  Zeitgeist = 'zeitgeist',
}
