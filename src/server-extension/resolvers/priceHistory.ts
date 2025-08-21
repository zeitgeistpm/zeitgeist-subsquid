import { Field, Int, ObjectType, Query, Resolver, InputType, Arg } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { Unit } from '../../consts';
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

    // Get normalized price history for all assets at once
    const priceHistoryRows = await manager.query(
      assetPriceHistory(market[0].outcome_assets, startTime, endTime, interval.toString())
    );

    // Group by timestamp and build response format
    const timestampGroups = new Map<string, any[]>();
    
    priceHistoryRows.forEach((row: any) => {
      const timestamp = row.timestamp.toISOString();
      if (!timestampGroups.has(timestamp)) {
        timestampGroups.set(timestamp, []);
      }
      
      if (row.asset_id && row.new_price !== null) {
        timestampGroups.get(timestamp)!.push({
          assetId: row.asset_id,
          price: row.new_price,
        });
      }
    });

    // Transform to expected response format
    return Array.from(timestampGroups.entries()).map(([timestamp, prices]) => ({
      timestamp: new Date(timestamp),
      prices,
    }));
  }
}