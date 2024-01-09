import { Arg, Field, Int, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { marketStatsWithOrder } from '../query';
import { getAssetUsdPrices } from '../helper';

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
