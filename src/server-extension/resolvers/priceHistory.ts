import { util } from '@zeitgeistpm/sdk';
import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { decodedAssetId, mergeByField } from '../helper';
import { assetPriceHistory, marketInfo } from '../query';

@ObjectType()
export class PriceHistory {
  @Field(() => Date)
  timestamp!: Date;

  @Field(() => [Price])
  prices!: Price[];

  constructor(props: Partial<PriceHistory>) {
    Object.assign(this, props);
  }
}

@ObjectType()
class Price {
  @Field(() => String)
  assetId!: string;

  @Field(() => Number, { nullable: true })
  price!: number;

  constructor(props: Partial<PriceHistory>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class PriceHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [PriceHistory])
  async priceHistory(
    @Arg('marketId', () => Number!, { nullable: false }) marketId: number,
    @Arg('startTime', () => String, { nullable: true }) startTime: string,
    @Arg('endTime', () => String, { nullable: true }) endTime: string,
    @Arg('interval', { nullable: true, defaultValue: '1 DAY' }) interval: string
  ): Promise<PriceHistory[]> {
    const manager = await this.tx();
    const market = await manager.query(marketInfo(marketId));
    const poolCreateTime = market[0].timestamp.toISOString().replace('T', ' ').split('.')[0];
    if (!startTime) {
      startTime = poolCreateTime;
    }
    if (!endTime) {
      let marketResolvedTime = new Date(market[1].timestamp.toISOString());
      marketResolvedTime.setDate(marketResolvedTime.getDate() + 1);
      endTime = marketResolvedTime.toISOString().replace('T', ' ').split('.')[0];
    }
    let merged = [];
    let priceHistory = await manager.query(
      assetPriceHistory(market[0].outcome_assets[0], poolCreateTime, startTime, endTime, interval)
    );
    for (let i = 1; i < market[0].outcome_assets.length; i++) {
      let priceHistory2 = await manager.query(
        assetPriceHistory(market[0].outcome_assets[i], poolCreateTime, startTime, endTime, interval)
      );
      merged = mergeByField(priceHistory, priceHistory2, 'timestamp');
      priceHistory = merged;
    }

    let result: any[] = [];
    for (let i = 0; i < merged.length; i++) {
      let obj: any = {};
      obj.timestamp = merged[i].timestamp;
      delete merged[i].timestamp;
      let prices = [];
      for (const [key, value] of Object.entries(merged[i])) {
        prices.push({
          assetId: JSON.stringify(util.AssetIdFromString(decodedAssetId(key))),
          price: value,
        });
      }
      obj.prices = prices;
      result.push(obj);
    }
    return result;
  }
}
