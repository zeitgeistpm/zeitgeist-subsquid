import { Arg, Field, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import { HistoricalMarket } from '../../model';

@ObjectType()
export class AssetPrice {
  @Field(() => String)
  pair!: string;

  @Field(() => Number)
  price!: number;

  @Field(() => Date)
  timestamp!: Date;

  constructor(props: Partial<AssetPrice>) {
    Object.assign(this, props);
  }
}

enum NumeratorAsset {
  DOT = 'polkadot',
  ZTG = 'zeitgeist',
}

enum DenominatorAsset {
  USD = 'usd',
}

registerEnumType(NumeratorAsset, {
  name: 'NumeratorAsset',
});

registerEnumType(DenominatorAsset, {
  name: 'DenominatorAsset',
});

@Resolver()
export class AssetPriceResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [AssetPrice])
  async assetPrice(
    @Arg('assetId', () => [NumeratorAsset], { nullable: false }) numerator: NumeratorAsset[],
    @Arg('denominator', () => [DenominatorAsset], { nullable: false }) denominator: DenominatorAsset[]
  ): Promise<AssetPrice[] | null> {
    const result = (await this.tx()).getRepository(HistoricalMarket);

    // Remove duplicates
    const nums = [...new Set(numerator)];
    const dens = [...new Set(denominator)];

    const prices: AssetPrice[] = [];
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < dens.length; j++) {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${nums[i]}&vs_currencies=${dens[j]}`
        );
        prices.push({
          pair: `${nums[i]}/${dens[j]}`,
          price: res.data[`${nums[i]}`][`${dens[j]}`],
          timestamp: new Date(),
        });
      }
    }
    return prices;
  }
}
