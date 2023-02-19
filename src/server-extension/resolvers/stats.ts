import { Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { totalLiquidityAndVolume } from '../query';

@ObjectType()
export class Stats {
  @Field(() => BigInt, { name: 'totalLiquidity' })
  total_liquidity!: bigint;

  @Field(() => BigInt, { name: 'totalVolume' })
  total_volume!: bigint;

  constructor(props: Partial<Stats>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class StatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [Stats])
  async stats(): Promise<Stats[]> {
    const manager = await this.tx();
    const result = await manager.getRepository(Market).query(totalLiquidityAndVolume());
    return result;
  }
}
