import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { _Asset } from '../../consts';
import { AssetKindValue } from '../helper';
import { issuanceHistory } from '../query';

@ObjectType()
export class IssuanceHistory {
  @Field(() => String, { name: 'assetId' })
  asset_id!: string;

  @Field(() => [Issuance])
  issuances!: Issuance[];

  constructor(props: Partial<IssuanceHistory>) {
    Object.assign(this, props);
  }
}

@ObjectType()
class Issuance {
  @Field(() => String)
  date!: string;

  @Field(() => BigInt)
  issuance!: BigInt;

  constructor(props: Partial<Issuance>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class IssuanceHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => IssuanceHistory)
  async issuanceHistory(
    @Arg('assetId', () => AssetKindValue, { nullable: true, defaultValue: { kind: _Asset.Ztg } })
    assetId: AssetKindValue
  ): Promise<IssuanceHistory> {
    const manager = await this.tx();
    const result = await manager.query(issuanceHistory(assetId.toString()));

    const issuances: Issuance[] = [];
    await Promise.all(
      result.map(async ({ date, issuance }: any) => {
        issuances.push({
          date: date.toISOString().split('T')[0],
          issuance,
        });
      })
    );
    return {
      asset_id: result[0].asset_id,
      issuances,
    };
  }
}
