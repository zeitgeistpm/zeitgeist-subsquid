import { Arg, Field, Int, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql';
import type { EntityManager } from 'typeorm';
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
    @Arg('limit', () => Number, { nullable: true }) limit: number,
    @Arg('offset', () => Number, { nullable: true }) offset: number
  ): Promise<MarketStats[]> {
    const manager = await this.tx();
    const result = await manager
      .getRepository(Market)
      .query(
        marketStats(ids ?? 'SELECT market_id FROM market', orderBy ?? OrderBy.volume_DESC, limit ?? 10, offset ?? 0)
      );
    return result;
  }
}
