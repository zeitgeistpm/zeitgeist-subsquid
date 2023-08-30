import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { HistoricalAccountBalance } from '../../model/generated';
import { balanceInfo } from '../query';

@ObjectType()
export class BalanceInfo {
  @Field(() => String, { name: 'assetId' })
  asset_id!: string;

  @Field(() => BigInt)
  balance!: bigint;

  constructor(props: Partial<BalanceInfo>) {
    Object.assign(this, props);
  }
}

enum AssetKind {
  CategoricalOutcome = 'CategoricalOutcome',
  ForeignAsset = 'ForeignAsset',
  PoolShare = 'PoolShare',
  ScalarOutcome = 'ScalarOutcome',
  Ztg = 'Ztg',
}

registerEnumType(AssetKind, {
  name: 'AssetKind',
  description: 'Kind of asset',
});

@InputType()
class AssetKindValue {
  @Field(() => AssetKind)
  kind!: AssetKind;

  @Field(() => Int, { nullable: true })
  value!: number;

  constructor(props: Partial<AssetKindValue>) {
    Object.assign(this, props);
  }

  toString(): string {
    return getAssetId({ __kind: this.kind, value: this.value });
  }
}

@Resolver()
export class BalanceInfoResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => BalanceInfo, { nullable: true })
  async balanceInfo(
    @Arg('accountId', () => String, { nullable: false }) accountId: string,
    @Arg('assetId', () => String, { nullable: true }) assetId: string,
    @Arg('blockNumber', () => String, { nullable: false }) blockNumber: string
  ): Promise<BalanceInfo> {
    const manager = await this.tx();
    const result = await manager
      .getRepository(HistoricalAccountBalance)
      .query(balanceInfo(accountId, assetId ?? 'Ztg', blockNumber));

    return result[0];
  }
}
