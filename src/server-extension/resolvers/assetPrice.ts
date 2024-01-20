import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { BaseAsset, EPOCH_TIME, TargetAsset } from '../../consts';
import { isLocalEnv } from '../../helper';
import { fetchFromCache, refreshPrices } from '../helper';

@ObjectType()
export class AssetPrice {
  @Field(() => String)
  pair!: string;

  @Field(() => Number, { nullable: true })
  price!: number | undefined;

  @Field(() => Date)
  timestamp!: Date;

  constructor(props: Partial<AssetPrice>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class AssetPriceResolver {
  static cachedAt: Date = EPOCH_TIME;

  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [AssetPrice], { nullable: true })
  async assetPrice(
    @Arg('base', () => [BaseAsset], { nullable: false }) base: BaseAsset[],
    @Arg('target', () => [TargetAsset], { nullable: false }) target: TargetAsset[]
  ): Promise<AssetPrice[] | undefined> {
    if (isLocalEnv()) return;

    // Refresh prices if they are older than 60 minutes
    if (new Date().getTime() - AssetPriceResolver.cachedAt.getTime() > 60 * 60 * 1000) refreshPrices();

    // Remove duplicates
    const bases = [...new Set(base)];
    const targets = [...new Set(target)];

    const prices: AssetPrice[] = [];
    for (let i = 0; i < bases.length; i++) {
      for (let j = 0; j < targets.length; j++) {
        const cachedData = await fetchFromCache(bases[i], targets[j]);
        prices.push({
          pair: cachedData.pair,
          price: cachedData.price,
          timestamp: AssetPriceResolver.cachedAt,
        });
      }
    }
    return prices;
  }
}
