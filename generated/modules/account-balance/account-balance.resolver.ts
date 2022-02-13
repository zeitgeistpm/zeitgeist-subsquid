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
  AccountBalanceCreateInput,
  AccountBalanceCreateManyArgs,
  AccountBalanceUpdateArgs,
  AccountBalanceWhereArgs,
  AccountBalanceWhereInput,
  AccountBalanceWhereUniqueInput,
  AccountBalanceOrderByEnum,
} from '../../warthog';

import { AccountBalance } from './account-balance.model';
import { AccountBalanceService } from './account-balance.service';

import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class AccountBalanceEdge {
  @Field(() => AccountBalance, { nullable: false })
  node!: AccountBalance;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class AccountBalanceConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [AccountBalanceEdge], { nullable: false })
  edges!: AccountBalanceEdge[];

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
export class AccountBalanceConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => AccountBalanceWhereInput, { nullable: true })
  where?: AccountBalanceWhereInput;

  @Field(() => AccountBalanceOrderByEnum, { nullable: true })
  orderBy?: [AccountBalanceOrderByEnum];
}

@Resolver(AccountBalance)
export class AccountBalanceResolver {
  constructor(@Inject('AccountBalanceService') public readonly service: AccountBalanceService) {}

  @Query(() => [AccountBalance])
  async accountBalances(
    @Args() { where, orderBy, limit, offset }: AccountBalanceWhereArgs,
    @Fields() fields: string[]
  ): Promise<AccountBalance[]> {
    return this.service.find<AccountBalanceWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => AccountBalance, { nullable: true })
  async accountBalanceByUniqueInput(
    @Arg('where') where: AccountBalanceWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<AccountBalance | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => AccountBalanceConnection)
  async accountBalancesConnection(
    @Args() { where, orderBy, ...pageOptions }: AccountBalanceConnectionWhereArgs,
    @Info() info: any
  ): Promise<AccountBalanceConnection> {
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
      result = await this.service.findConnection<AccountBalanceWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<AccountBalanceConnection>;
  }

  @FieldResolver(() => Account)
  async account(@Root() r: AccountBalance, @Ctx() ctx: BaseContext): Promise<Account | null> {
    return ctx.dataLoader.loaders.AccountBalance.account.load(r);
  }
}
