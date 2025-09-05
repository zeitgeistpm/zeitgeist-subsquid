import { Arg, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { getAssetUsdPrices, mergeByField } from '../helper';
import { poolLiquidity, poolParticipants, poolTraders, poolVolume } from '../query';

@ObjectType()
export class PoolStats {
  @Field(() => Int, { name: 'poolId' })
  pool_id!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => BigInt)
  liquidity!: bigint;

  @Field(() => Int)
  traders!: number;

  @Field(() => BigInt)
  volume!: bigint;

  constructor(props: Partial<PoolStats>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class PoolStatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [PoolStats])
  async poolStats(@Arg('poolId', () => [Int!], { nullable: false }) ids: number[]): Promise<PoolStats[]> {
    const manager = await this.tx();
    const participants = await manager.query(poolParticipants(ids));
    const liquidity = await manager.query(poolLiquidity(ids));
    const traders = await manager.query(poolTraders(ids));
    const volume = await manager.query(poolVolume(ids, await getAssetUsdPrices()));

    const merged1 = mergeByField(liquidity, volume, 'pool_id');
    const merged2 = mergeByField(traders, participants, 'pool_id');
    const result = mergeByField(merged1, merged2, 'pool_id');
    return result;
  }
}