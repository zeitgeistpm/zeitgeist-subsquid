import { Arg, Field, Int, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import axios from 'axios';
import { Market } from '../../model/generated';
import { marketStatsWithOrder } from '../query';

@ObjectType()
export class MarketStatsWithOrder {
  @Field(() => Int, { name: 'marketId' })
  market_id!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => BigInt)
  liquidity!: bigint;

  @Field(() => BigInt)
  volume!: bigint;

  constructor(props: Partial<MarketStatsWithOrder>) {
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
export class MarketStatsWithOrderResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [MarketStatsWithOrder])
  async marketStatsWithOrder(
    @Arg('marketId', () => [Int], { nullable: true }) ids: string,
    @Arg('orderBy', () => OrderBy, { nullable: true }) orderBy: OrderBy,
    @Arg('limit', () => Int, { nullable: true }) limit: number,
    @Arg('offset', () => Int, { nullable: true }) offset: number
  ): Promise<MarketStatsWithOrder[]> {
    const manager = await this.tx();
    const where = ids ? `WHERE m.market_id IN (${ids})` : ``;
    const result = await manager
      .getRepository(Market)
      .query(
        marketStatsWithOrder(where, orderBy ?? OrderBy.volume_DESC, limit ?? 10, offset ?? 0, await getAssetUsdPrices())
      );
    return result;
  }
}

const getAssetUsdPrices = async (): Promise<Map<Asset, number>> => {
  const prices: Map<Asset, number> = new Map([
    [Asset.Polkadot, 4.34],
    [Asset.Zeitgeist, 0.0313],
  ]);
  await Promise.all(
    Array.from(prices).map(async (price) => {
      if (process.env.WS_NODE_URL?.includes(`bs`)) {
        price[1] = 1;
        return;
      }
      try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${price[0]}&vs_currencies=usd`);
        price[1] = res.data[price[0]].usd;
      } catch (err) {
        console.log(JSON.stringify(err, null, 2));
      }
    })
  );
  return prices;
};

export enum Asset {
  Polkadot = 'polkadot',
  Zeitgeist = 'zeitgeist',
}
