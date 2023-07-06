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
  volume_ASC = 'VOLUME ASC',
  volume_DESC = 'VOLUME DESC',
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
    @Arg('marketId', () => [Int!], { nullable: false }) ids: number[],
    @Arg('orderBy', () => OrderBy, { nullable: false }) orderBy: OrderBy
  ): Promise<MarketStats[]> {
    const manager = await this.tx();
    const result = await manager.getRepository(Market).query(marketStats(ids));
    return result;
  }
}
