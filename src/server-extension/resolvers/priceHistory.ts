import { Field, Int, ObjectType, Query, Resolver, InputType, Arg } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { Unit } from '../../consts';
import { assetPriceHistory, marketInfo, comboPoolAssets } from '../query';


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
    
    // Get market outcome assets directly from market table
    const marketQuery = `SELECT outcome_assets FROM market WHERE market_id = ${marketId}`;
    const marketResult = await manager.query(marketQuery);
    if (!marketResult || marketResult.length === 0) return;
    
    const outcomeAssets = marketResult[0].outcome_assets;
    if (!outcomeAssets || outcomeAssets.length === 0) return;

    // Set default time range if not provided
    if (!endTime) {
      endTime = new Date().toISOString();
    }
    if (!startTime) {
      // Default to 24 hours ago
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      startTime = yesterday.toISOString();
    }
    interval = interval ?? new IntervalArgs({ unit: Unit.Hour, value: 1 });

    // Get normalized price history for all assets at once
    const priceHistoryRows = await manager.query(
      assetPriceHistory(outcomeAssets, startTime, endTime, interval.toString())
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

  @Query(() => [PriceHistory], { nullable: true })
  async priceHistoryByPoolId(
    @Arg('poolId', () => Int, { nullable: false }) poolId: number,
    @Arg('startTime', () => String, { nullable: true }) startTime: string,
    @Arg('endTime', () => String, { nullable: true }) endTime: string,
    @Arg('interval', () => IntervalArgs, { nullable: true }) interval: IntervalArgs
  ): Promise<PriceHistory[] | undefined> {
    const manager = await this.tx();
    
    // Get combinatorial assets from pool's account balances
    const poolResult = await manager.query(comboPoolAssets(poolId));
    if (!poolResult || poolResult.length === 0) return;
    
    const outcomeAssets = poolResult[0].outcome_assets;
    if (!outcomeAssets || outcomeAssets.length === 0) return;

    // Set default time range if not provided
    if (!endTime) {
      endTime = new Date().toISOString();
    }
    if (!startTime) {
      // Default to 24 hours ago
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      startTime = yesterday.toISOString();
    }
    interval = interval ?? new IntervalArgs({ unit: Unit.Hour, value: 1 });

    // Get normalized price history for all combinatorial assets at once
    const priceHistoryRows = await manager.query(
      assetPriceHistory(outcomeAssets, startTime, endTime, interval.toString())
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