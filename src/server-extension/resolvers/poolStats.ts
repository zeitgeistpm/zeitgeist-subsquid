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

    // Initialize result entries for all requested pool IDs with default values
    const results: PoolStats[] = ids.map(poolId => new PoolStats({
      pool_id: poolId,
      participants: 0,
      liquidity: BigInt(0),
      traders: 0,
      volume: BigInt(0),
    }));

    // Create lookup maps for efficient population
    const resultMap = new Map<number, PoolStats>();
    results.forEach(result => resultMap.set(result.pool_id, result));

    // Populate participants data
    participants.forEach((row: any) => {
      const result = resultMap.get(Number(row.pool_id));
      if (result) {
        result.participants = Number(row.participants || 0);
      }
    });

    // Populate liquidity data
    liquidity.forEach((row: any) => {
      const result = resultMap.get(Number(row.pool_id));
      if (result) {
        result.liquidity = BigInt(row.liquidity || 0);
      }
    });

    // Populate traders data
    traders.forEach((row: any) => {
      const result = resultMap.get(Number(row.pool_id));
      if (result) {
        result.traders = Number(row.traders || 0);
      }
    });

    // Populate volume data
    volume.forEach((row: any) => {
      const result = resultMap.get(Number(row.pool_id));
      if (result) {
        result.volume = BigInt(row.volume || 0);
      }
    });

    return results;
  }
}