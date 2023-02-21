import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { marketLiquidity, marketParticipants } from '../query';

@ObjectType()
export class MarketStats {
  @Field(() => Number, { name: 'marketId' })
  market_id!: number;

  @Field(() => Number)
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
  async marketStats(@Arg('ids', () => [String!], { nullable: false }) ids: string[]): Promise<MarketStats[]> {
    const manager = await this.tx();
    const participants = await manager.getRepository(Market).query(marketParticipants(ids));
    const liquidity = await manager.getRepository(Market).query(marketLiquidity(ids));

    const mergeByMarketId = (participants: any[], liquidity: any[]) =>
      participants.map((p) => ({
        ...liquidity.find((l) => l.market_id === p.market_id && l),
        ...p,
      }));
    const result = mergeByMarketId(participants, liquidity);
    return result;
  }
}
