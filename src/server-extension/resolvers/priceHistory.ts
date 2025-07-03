import { util } from '@zeitgeistpm/sdk';
import { Field, Int, ObjectType, Query, Resolver, InputType, Arg } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { isHexadecimal } from 'is-hexadecimal';
import { Unit } from '../../consts';
import { decodedAssetId, mergeByField } from '../helper';
import { assetPriceHistory, marketInfo } from '../query';

const isCombinatorialHash = (key: string): boolean => {
  return (key.length === 63 || key.length === 64) && isHexadecimal(key);
};

const extractHashFromAsset = (asset: string): string | null => {
  try {
    const parsed = JSON.parse(asset);
    if (!parsed?.combinatorialToken) return null;
    
    const tokenValue = parsed.combinatorialToken.toString();
    const hash = tokenValue.startsWith('0x') ? tokenValue.slice(2) : tokenValue;
    
    // Return truncated to 63 chars to match PostgreSQL column names
    return hash.slice(0, 63);
  } catch {
    return null;
  }
};

const findMatchingAsset = (hash: string, outcomeAssets: string[]): string | null => {
  return outcomeAssets.find(asset => extractHashFromAsset(asset) === hash) || null;
};

const createFallbackAsset = (hash: string): string => {
  return JSON.stringify({ combinatorialToken: `0x${hash}` });
};

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

    // Build price history data by merging all assets
    let priceHistory = await manager.query(
      assetPriceHistory(market[0].outcome_assets[0], startTime, endTime, interval.toString())
    );

    for (let i = 1; i < market[0].outcome_assets.length; i++) {
      const nextAssetHistory = await manager.query(
        assetPriceHistory(market[0].outcome_assets[i], startTime, endTime, interval.toString())
      );
      priceHistory = mergeByField(priceHistory, nextAssetHistory, 'timestamp');
    }

    // Transform the merged data into the response format
    return priceHistory.map((entry: any) => {
      const { timestamp, ...priceData } = entry;
      
      const prices = Object.entries(priceData).map(([key, value]) => ({
        assetId: isCombinatorialHash(key) 
          ? findMatchingAsset(key, market[0].outcome_assets) || createFallbackAsset(key)
          : JSON.stringify(util.AssetIdFromString(decodedAssetId(key))),
        price: value,
      }));

      return { timestamp, prices };
    });
  }
}