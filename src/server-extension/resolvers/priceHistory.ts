import { util } from '@zeitgeistpm/sdk';
import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { decodedAssetId, encodedAssetId, mergeByField } from '../helper';
import { assetPriceHistory, outcomeAssets } from '../query';

@ObjectType()
export class PriceHistory {
  @Field(() => Date)
  timestamp!: Date;

  @Field(() => [Price])
  assets!: Price[];

  constructor(props: Partial<PriceHistory>) {
    Object.assign(this, props);
  }
}

@ObjectType()
class Price {
  @Field(() => String)
  assetId!: string;

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
  async priceHistory(@Arg('marketId', () => Number!, { nullable: false }) marketId: number): Promise<PriceHistory[]> {
    const manager = await this.tx();
    const marketAssets = await manager.query(outcomeAssets(marketId));

    let merged = [];
    let priceHistory = await manager.query(assetPriceHistory(encodedAssetId(marketAssets[0].assets[0])));
    for (let i = 1; i < marketAssets[0].assets.length; i++) {
      let priceHistory2 = await manager.query(assetPriceHistory(encodedAssetId(marketAssets[0].assets[i])));
      merged = mergeByField(priceHistory, priceHistory2, 'timestamp');
      priceHistory = merged;
    }

    let result: any[] = [];
    for (let i = 0; i < merged.length; i++) {
      let obj: any = {};
      obj.timestamp = merged[i].timestamp;
      delete merged[i].timestamp;
      let assets = [];
      for (const [key, value] of Object.entries(merged[i])) {
        assets.push({
          assetId: JSON.stringify(util.AssetIdFromString(decodedAssetId(key))),
          price: value,
        });
      }
      obj.assets = assets;
      result.push(obj);
    }
    return result;
  }
}
