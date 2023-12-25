import { Arg, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { mergeByField } from '../helper';
import { marketLiquidity, marketParticipants } from '../query';

@ObjectType()
export class MarketStats {
  @Field(() => Int, { name: 'marketId' })
  market_id!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => BigInt)
  liquidity!: bigint;

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

    const result = mergeByField(participants, liquidity, 'market_id');
    return result;
  }
}