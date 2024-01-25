import { Arg, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { getAssetUsdPrices, mergeByField } from '../helper';
import { marketLiquidity, marketParticipants, marketTraders, marketVolume } from '../query';

@ObjectType()
export class MarketStats {
  @Field(() => Int, { name: 'marketId' })
  market_id!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => BigInt)
  liquidity!: bigint;

  @Field(() => Int)
  traders!: number;

  @Field(() => BigInt)
  volume!: bigint;

  constructor(props: Partial<MarketStats>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class MarketStatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [MarketStats])
  async marketStats(@Arg('marketId', () => [Int!], { nullable: false }) ids: number[]): Promise<MarketStats[]> {
    const manager = await this.tx();
    const participants = await manager.getRepository(Market).query(marketParticipants(ids));
    const liquidity = await manager.getRepository(Market).query(marketLiquidity(ids));
    const traders = await manager.getRepository(Market).query(marketTraders(ids));
    const volume = await manager.getRepository(Market).query(marketVolume(ids, await getAssetUsdPrices()));

    const merged1 = mergeByField(liquidity, volume, 'market_id');
    const merged2 = mergeByField(traders, participants, 'market_id');
    const result = mergeByField(merged1, merged2, 'market_id');
    return result;
  }
}
