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
  HistoricalMarketCreateInput,
  HistoricalMarketCreateManyArgs,
  HistoricalMarketUpdateArgs,
  HistoricalMarketWhereArgs,
  HistoricalMarketWhereInput,
  HistoricalMarketWhereUniqueInput,
  HistoricalMarketOrderByEnum,
} from '../../warthog';

import { HistoricalMarket } from './historical-market.model';
import { HistoricalMarketService } from './historical-market.service';

@ObjectType()
export class HistoricalMarketEdge {
  @Field(() => HistoricalMarket, { nullable: false })
  node!: HistoricalMarket;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalMarketConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalMarketEdge], { nullable: false })
  edges!: HistoricalMarketEdge[];

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
export class HistoricalMarketConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalMarketWhereInput, { nullable: true })
  where?: HistoricalMarketWhereInput;

  @Field(() => HistoricalMarketOrderByEnum, { nullable: true })
  orderBy?: [HistoricalMarketOrderByEnum];
}

@Resolver(HistoricalMarket)
export class HistoricalMarketResolver {
  constructor(@Inject('HistoricalMarketService') public readonly service: HistoricalMarketService) {}

  @Query(() => [HistoricalMarket])
  async historicalMarkets(
    @Args() { where, orderBy, limit, offset }: HistoricalMarketWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalMarket[]> {
    return this.service.find<HistoricalMarketWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalMarket, { nullable: true })
  async historicalMarketByUniqueInput(
    @Arg('where') where: HistoricalMarketWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalMarket | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalMarketConnection)
  async historicalMarketsConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalMarketConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalMarketConnection> {
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
      result = await this.service.findConnection<HistoricalMarketWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<HistoricalMarketConnection>;
  }
}
