import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { HistoricalAsset } from '../../model/generated';
import { assetPriceHistory } from '../query';

@ObjectType()
export class PriceHistory {
  @Field(() => Date)
  timestamp!: Date;

  @Field(() => Number)
  price!: number;

  constructor(props: Partial<PriceHistory>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class PriceHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [PriceHistory])
  async priceHistory(@Arg('assetId', () => String!, { nullable: false }) assetId: string): Promise<PriceHistory[]> {
    const manager = await this.tx();
    const result = await manager.getRepository(HistoricalAsset).query(assetPriceHistory(assetId));
    return result;
  }
}
