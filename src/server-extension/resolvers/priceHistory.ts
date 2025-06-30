import { util } from '@zeitgeistpm/sdk';
import { Field, Int, ObjectType, Query, Resolver, InputType, Arg } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { Unit } from '../../consts';
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
        // Handle combinatorial tokens - they come back as combo_<hash> from the SQL query
        if (key.startsWith('combo_')) {
          let finalAssetId: string;
          
          try {
            // More robust hash extraction from combo key format
            const hashMatch = key.match(/^combo_([a-fA-F0-9]+)$/);
            if (!hashMatch || !hashMatch[1]) {
              throw new Error(`Invalid combo key format: ${key}`);
            }
            
            const extractedHash = hashMatch[1];
            
            // Validate hash format (should be hexadecimal and reasonable length)
            if (!/^[a-fA-F0-9]{8,}$/.test(extractedHash)) {
              throw new Error(`Invalid hash format: ${extractedHash}`);
            }
            
            // Find the original asset ID from market outcome_assets that contains this hash
            const matchingAsset = market[0].outcome_assets.find((asset: string) => {
              try {
                // More precise matching - look for the exact hash in combinatorial token format
                const parsed = JSON.parse(asset);
                return parsed.combinatorialToken && 
                       parsed.combinatorialToken.toString().includes(extractedHash);
              } catch {
                // Fallback to string matching for non-JSON formatted assets
                return asset.includes('combinatorialToken') && asset.includes(extractedHash);
              }
            });
            
            if (!matchingAsset) {
              throw new Error(`No matching asset found for hash: ${extractedHash}`);
            }
            
            finalAssetId = matchingAsset;
          } catch (error) {
            // Error handling - log the issue and provide consistent fallback
            console.warn(`Failed to process combinatorial token ${key}:`, error);
            
            // Ensure fallback provides consistent JSON format
            const fallbackDecoded = decodedAssetId(key);
            try {
              // Try to parse and re-stringify to ensure valid JSON format
              const parsed = JSON.parse(fallbackDecoded);
              finalAssetId = JSON.stringify(parsed);
            } catch {
              // If decodedAssetId doesn't return valid JSON, create a consistent format
              finalAssetId = JSON.stringify({ 
                combinatorialToken: key.replace('combo_', '') 
              });
            }
          }
          
          prices.push({
            assetId: finalAssetId,
            price: value,
          });
        } else {
          // Handle categorical outcomes using the SDK
          prices.push({
            assetId: JSON.stringify(util.AssetIdFromString(decodedAssetId(key))),
            price: value,
          });
        }
      }
      obj.prices = prices;
      result.push(obj);
    }
    return result;
  }
}