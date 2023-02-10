import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';

@ObjectType()
export class StatsResult {
  @Field(() => Number, { nullable: false, name: 'marketId' })
  market_id!: number;

  @Field(() => Number)
  participants!: number;

  constructor(props: Partial<StatsResult>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class StatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [StatsResult])
  async marketStats(
    @Arg('ids', () => [String!], { nullable: false }) ids: string[]
  ): Promise<StatsResult[]> {
    const manager = await this.tx();
    const result = await manager.getRepository(Market).query(`
      SELECT 
        m.market_id, 
        COUNT(DISTINCT ha.account_id) as participants
      FROM
        market m
      JOIN
        historical_asset ha ON ha.asset_id = ANY (m.outcome_assets)
      WHERE
        m.market_id in (${ids})
      GROUP BY
        m.market_id;`);

    return result;
  }
}
