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
  AssetBalanceCreateInput,
  AssetBalanceCreateManyArgs,
  AssetBalanceUpdateArgs,
  AssetBalanceWhereArgs,
  AssetBalanceWhereInput,
  AssetBalanceWhereUniqueInput,
  AssetBalanceOrderByEnum,
} from '../../warthog';

import { AssetBalance } from './asset-balance.model';
import { AssetBalanceService } from './asset-balance.service';

import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class AssetBalanceEdge {
  @Field(() => AssetBalance, { nullable: false })
  node!: AssetBalance;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class AssetBalanceConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [AssetBalanceEdge], { nullable: false })
  edges!: AssetBalanceEdge[];

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
export class AssetBalanceConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => AssetBalanceWhereInput, { nullable: true })
  where?: AssetBalanceWhereInput;

  @Field(() => AssetBalanceOrderByEnum, { nullable: true })
  orderBy?: [AssetBalanceOrderByEnum];
}

@Resolver(AssetBalance)
export class AssetBalanceResolver {
  constructor(@Inject('AssetBalanceService') public readonly service: AssetBalanceService) {}

  @Query(() => [AssetBalance])
  async assetBalances(
    @Args() { where, orderBy, limit, offset }: AssetBalanceWhereArgs,
    @Fields() fields: string[]
  ): Promise<AssetBalance[]> {
    return this.service.find<AssetBalanceWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => AssetBalance, { nullable: true })
  async assetBalanceByUniqueInput(
    @Arg('where') where: AssetBalanceWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<AssetBalance | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => AssetBalanceConnection)
  async assetBalancesConnection(
    @Args() { where, orderBy, ...pageOptions }: AssetBalanceConnectionWhereArgs,
    @Info() info: any
  ): Promise<AssetBalanceConnection> {
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
      result = await this.service.findConnection<AssetBalanceWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<AssetBalanceConnection>;
  }

  @FieldResolver(() => Account)
  async account(@Root() r: AssetBalance, @Ctx() ctx: BaseContext): Promise<Account | null> {
    return ctx.dataLoader.loaders.AssetBalance.account.load(r);
  }
}
