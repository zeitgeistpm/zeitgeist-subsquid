import { Arg, Field, ObjectType, Query, Resolver, registerEnumType, InputType } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { formatAssetId } from '../../mappings/helper';
import { HistoricalAccountBalance } from '../../model/generated';
import { Asset } from '../../types/v50';
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

enum BalanceInfoEvent {
  MintedInCourt = 'MintedInCourt',
}

registerEnumType(BalanceInfoEvent, {
  name: 'BalanceInfoEvent',
  description: 'Filtering balance based on event',
});

@InputType()
class AssetKindValue {
  @Field(() => AssetKind)
  kind!: AssetKind;

  @Field(() => String, { nullable: true })
  value!: string;

  constructor(props: Partial<AssetKindValue>) {
    Object.assign(this, props);
  }

  toString(): string {
    return formatAssetId({ __kind: this.kind, value: this.value } as Asset);
  }
}

@Resolver()
export class BalanceInfoResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => BalanceInfo)
  async balanceInfo(
    @Arg('accountId', () => String, { nullable: false }) accountId: string,
    @Arg('assetId', () => AssetKindValue, { nullable: true, defaultValue: { kind: AssetKind.Ztg } })
    assetId: AssetKindValue,
    @Arg('blockNumber', () => String, { nullable: true }) blockNumber: string,
    @Arg('event', () => BalanceInfoEvent, { nullable: true }) event: BalanceInfoEvent
  ): Promise<BalanceInfo> {
    const manager = await this.tx();

    let conditions = ``;
    conditions += blockNumber ? `AND block_number <= ${blockNumber}` : ``;
    conditions += event ? `AND event ~ '${event}'` : ``;

    const result = await manager
      .getRepository(HistoricalAccountBalance)
      .query(balanceInfo(accountId, assetId.toString(), conditions));

    if (result.length == 0) return { asset_id: assetId.toString(), balance: BigInt(0) };
    return result[0];
  }
}
