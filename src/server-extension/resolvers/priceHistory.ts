import { util } from '@zeitgeistpm/sdk';
import { Field, Int, ObjectType, Query, registerEnumType, Resolver, InputType, Arg } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { mergeByField } from '../../mappings/helper';
import { decodedAssetId } from '../helper';
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

enum Unit {
  Day = 'DAYS',
  Hour = 'HOURS',
  Minute = 'MINUTES',
  Second = 'SECONDS',
}

registerEnumType(Unit, {
  name: 'Unit',
  description: 'Unit for the interval',
});

@InputType()
class IntervalArgs {
  @Field(() => Unit)
  unit!: Unit;

  @Field(() => Int)
  value!: number;

  constructor(props: Partial<IntervalArgs>) {
    Object.assign(this, props);
  }

  toString(): string {
    return `${this.value} ${this.unit}`;
  }
}

@Resolver()
export class PriceHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [PriceHistory], { nullable: true })
  async priceHistory(
    @Arg('marketId', () => Int, { nullable: false }) marketId: number,
    @Arg('startTime', () => String, { nullable: true }) startTime: string,
    @Arg('endTime', () => String, { nullable: true }) endTime: string,
    @Arg('interval', () => IntervalArgs, { nullable: true }) interval: IntervalArgs
  ): Promise<PriceHistory[] | undefined> {
    const manager = await this.tx();
    const market = await manager.query(marketInfo(marketId));
    if (!market[0]) return;

    if (!endTime && market[1]) {
      let marketResolvedTime = new Date(market[1].timestamp.toISOString());
      marketResolvedTime.setDate(marketResolvedTime.getDate() + 1);
      endTime = marketResolvedTime.toISOString();
    } else {
      endTime = new Date().toISOString();
    }
    startTime = startTime ?? market[0].timestamp.toISOString();
    interval = interval ?? new IntervalArgs({ unit: Unit.Day, value: 1 });

    let merged = [];
    let priceHistory = await manager.query(
      assetPriceHistory(market[0].outcome_assets[0], startTime, endTime, interval.toString())
    );
    for (let i = 1; i < market[0].outcome_assets.length; i++) {
      let priceHistory2 = await manager.query(
        assetPriceHistory(market[0].outcome_assets[i], startTime, endTime, interval.toString())
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
