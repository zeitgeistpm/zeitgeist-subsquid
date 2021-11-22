import {
  Arg,
  Args,
  Mutation,
  Query,
  Root,
  Resolver,
  FieldResolver,
  ObjectType,
  Field,
  Int,
  ArgsType,
  Info,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { Inject } from 'typedi';
import { Min } from 'class-validator';
import {
  Fields,
  StandardDeleteResponse,
  UserId,
  PageInfo,
  RawFields,
  NestedFields,
  BaseContext,
} from '@subsquid/warthog';

import {
  HistoricalAssetBalanceCreateInput,
  HistoricalAssetBalanceCreateManyArgs,
  HistoricalAssetBalanceUpdateArgs,
  HistoricalAssetBalanceWhereArgs,
  HistoricalAssetBalanceWhereInput,
  HistoricalAssetBalanceWhereUniqueInput,
  HistoricalAssetBalanceOrderByEnum,
} from '../../warthog';

import { HistoricalAssetBalance } from './historical-asset-balance.model';
import { HistoricalAssetBalanceService } from './historical-asset-balance.service';

import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class HistoricalAssetBalanceEdge {
  @Field(() => HistoricalAssetBalance, { nullable: false })
  node!: HistoricalAssetBalance;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalAssetBalanceConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalAssetBalanceEdge], { nullable: false })
  edges!: HistoricalAssetBalanceEdge[];

  @Field(() => PageInfo, { nullable: false })
  pageInfo!: PageInfo;
}

@ArgsType()
export class ConnectionPageInputOptions {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string; // V3: TODO: should we make a RelayCursor scalar?

  @Field(() => Int, { nullable: true })
  @Min(0)
  last?: number;

  @Field(() => String, { nullable: true })
  before?: string;
}

@ArgsType()
export class HistoricalAssetBalanceConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalAssetBalanceWhereInput, { nullable: true })
  where?: HistoricalAssetBalanceWhereInput;

  @Field(() => HistoricalAssetBalanceOrderByEnum, { nullable: true })
  orderBy?: [HistoricalAssetBalanceOrderByEnum];
}

@Resolver(HistoricalAssetBalance)
export class HistoricalAssetBalanceResolver {
  constructor(@Inject('HistoricalAssetBalanceService') public readonly service: HistoricalAssetBalanceService) {}

  @Query(() => [HistoricalAssetBalance])
  async historicalAssetBalances(
    @Args() { where, orderBy, limit, offset }: HistoricalAssetBalanceWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalAssetBalance[]> {
    return this.service.find<HistoricalAssetBalanceWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalAssetBalance, { nullable: true })
  async historicalAssetBalanceByUniqueInput(
    @Arg('where') where: HistoricalAssetBalanceWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalAssetBalance | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalAssetBalanceConnection)
  async historicalAssetBalancesConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalAssetBalanceConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalAssetBalanceConnection> {
    const rawFields = graphqlFields(info, {}, { excludedFields: ['__typename'] });

    let result: any = {
      totalCount: 0,
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    // If the related database table does not have any records then an error is thrown to the client
    // by warthog
    try {
      result = await this.service.findConnection<HistoricalAssetBalanceWhereInput>(
        where,
        orderBy,
        pageOptions,
        rawFields
      );
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<HistoricalAssetBalanceConnection>;
  }

  @FieldResolver(() => Account)
  async account(@Root() r: HistoricalAssetBalance, @Ctx() ctx: BaseContext): Promise<Account | null> {
    return ctx.dataLoader.loaders.HistoricalAssetBalance.account.load(r);
  }
}
