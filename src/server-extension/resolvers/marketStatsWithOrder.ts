import { Arg, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { OrderBy } from '../../consts';
import { getAssetUsdPrices } from '../helper';
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
