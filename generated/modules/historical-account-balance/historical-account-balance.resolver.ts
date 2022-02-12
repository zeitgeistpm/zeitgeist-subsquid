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
  HistoricalAccountBalanceCreateInput,
  HistoricalAccountBalanceCreateManyArgs,
  HistoricalAccountBalanceUpdateArgs,
  HistoricalAccountBalanceWhereArgs,
  HistoricalAccountBalanceWhereInput,
  HistoricalAccountBalanceWhereUniqueInput,
  HistoricalAccountBalanceOrderByEnum,
} from '../../warthog';

import { HistoricalAccountBalance } from './historical-account-balance.model';
import { HistoricalAccountBalanceService } from './historical-account-balance.service';

@ObjectType()
export class HistoricalAccountBalanceEdge {
  @Field(() => HistoricalAccountBalance, { nullable: false })
  node!: HistoricalAccountBalance;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalAccountBalanceConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalAccountBalanceEdge], { nullable: false })
  edges!: HistoricalAccountBalanceEdge[];

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
export class HistoricalAccountBalanceConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalAccountBalanceWhereInput, { nullable: true })
  where?: HistoricalAccountBalanceWhereInput;

  @Field(() => HistoricalAccountBalanceOrderByEnum, { nullable: true })
  orderBy?: [HistoricalAccountBalanceOrderByEnum];
}

@Resolver(HistoricalAccountBalance)
export class HistoricalAccountBalanceResolver {
  constructor(@Inject('HistoricalAccountBalanceService') public readonly service: HistoricalAccountBalanceService) {}

  @Query(() => [HistoricalAccountBalance])
  async historicalAccountBalances(
    @Args() { where, orderBy, limit, offset }: HistoricalAccountBalanceWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalAccountBalance[]> {
    return this.service.find<HistoricalAccountBalanceWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalAccountBalance, { nullable: true })
  async historicalAccountBalanceByUniqueInput(
    @Arg('where') where: HistoricalAccountBalanceWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalAccountBalance | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalAccountBalanceConnection)
  async historicalAccountBalancesConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalAccountBalanceConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalAccountBalanceConnection> {
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
      result = await this.service.findConnection<HistoricalAccountBalanceWhereInput>(
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

    return result as Promise<HistoricalAccountBalanceConnection>;
  }
}
