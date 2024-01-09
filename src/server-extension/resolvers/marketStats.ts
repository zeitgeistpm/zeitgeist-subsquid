import { Arg, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { getAssetUsdPrices, mergeByField } from '../helper';
import { marketLiquidity, marketParticipants, marketVolume } from '../query';

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

@Resolver()
export class MarketStatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [MarketStats])
  async marketStats(@Arg('marketId', () => [Int!], { nullable: false }) ids: number[]): Promise<MarketStats[]> {
    const manager = await this.tx();
    const participants = await manager.getRepository(Market).query(marketParticipants(ids));
    const liquidity = await manager.getRepository(Market).query(marketLiquidity(ids));
    const volume = await manager.getRepository(Market).query(marketVolume(ids, await getAssetUsdPrices()));

    let result = mergeByField(participants, liquidity, 'market_id');
    result = mergeByField(result, volume, 'market_id');
    return result;
  }
}
