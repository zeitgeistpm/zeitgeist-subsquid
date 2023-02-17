import { Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { totalLiquidity } from '../query';

@ObjectType()
export class Stats {
  @Field(() => BigInt, { name: 'totalLiquidity' })
  total_liquidity!: bigint;

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
    const result = await manager.getRepository(Market).query(totalLiquidity());
    return result;
  }
}
