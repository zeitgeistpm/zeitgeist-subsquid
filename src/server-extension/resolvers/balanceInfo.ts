import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { HistoricalAccountBalance } from '../../model/generated';
import { BalanceInfoEvent, _Asset } from '../../consts';
import { AssetKindValue } from '../helper';
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

@Resolver()
export class BalanceInfoResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => BalanceInfo)
  async balanceInfo(
    @Arg('accountId', () => String, { nullable: false }) accountId: string,
    @Arg('assetId', () => AssetKindValue, { nullable: true, defaultValue: { kind: _Asset.Ztg } })
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
