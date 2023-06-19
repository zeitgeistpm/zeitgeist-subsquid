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
