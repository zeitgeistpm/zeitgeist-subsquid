import { Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { HistoricalAccountBalance, Market } from '../../model/generated';
import { totalLiquidityAndVolume, totalMintedInCourt } from '../query';

@ObjectType()
export class Stats {
  @Field(() => BigInt, { name: 'totalLiquidity' })
  total_liquidity!: bigint;

  @Field(() => BigInt, { name: 'totalMintedInCourt' })
  total_minted_in_court!: bigint;

  @Field(() => BigInt, { name: 'totalVolume' })
  total_volume!: bigint;

  constructor(props: Partial<Stats>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class StatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => Stats)
  async stats(): Promise<Stats> {
    const manager = await this.tx();
    const [{ total_liquidity, total_volume }] = await manager.getRepository(Market).query(totalLiquidityAndVolume());
    const [{ total_minted_in_court }] = await manager
      .getRepository(HistoricalAccountBalance)
      .query(totalMintedInCourt());

    return {
      total_liquidity: total_liquidity ?? BigInt(0),
      total_minted_in_court: total_minted_in_court ?? BigInt(0),
      total_volume: total_volume ?? BigInt(0),
    };
  }
}
