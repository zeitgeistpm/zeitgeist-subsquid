import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { HistoricalAsset } from '../../model/generated';

@ObjectType()
export class StatsResult {
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
  async stats(
    @Arg('marketId', { nullable: false }) marketId: number
  ): Promise<StatsResult> {
    const manager = await this.tx();
    const result = await manager.getRepository(HistoricalAsset)
      .query(`SELECT COUNT(DISTINCT account_id) as participants
        FROM historical_asset
        WHERE event LIKE '%Swap%'
        AND asset_id LIKE '%[${marketId},%'
        AND account_id != '';`);

    return result;
  }
}
