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
  MarketCreateInput,
  MarketCreateManyArgs,
  MarketUpdateArgs,
  MarketWhereArgs,
  MarketWhereInput,
  MarketWhereUniqueInput,
  MarketOrderByEnum,
} from '../../warthog';

import { Market } from './market.model';
import { MarketService } from './market.service';

import { MarketHistory } from '../market-history/market-history.model';
import { MarketHistoryService } from '../market-history/market-history.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class MarketEdge {
  @Field(() => Market, { nullable: false })
  node!: Market;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class MarketConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [MarketEdge], { nullable: false })
  edges!: MarketEdge[];

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
export class MarketConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => MarketWhereInput, { nullable: true })
  where?: MarketWhereInput;

  @Field(() => MarketOrderByEnum, { nullable: true })
  orderBy?: [MarketOrderByEnum];
}

@Resolver(Market)
export class MarketResolver {
  constructor(@Inject('MarketService') public readonly service: MarketService) {}

  @Query(() => [Market])
  async markets(
    @Args() { where, orderBy, limit, offset }: MarketWhereArgs,
    @Fields() fields: string[]
  ): Promise<Market[]> {
    return this.service.find<MarketWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Market, { nullable: true })
  async marketByUniqueInput(
    @Arg('where') where: MarketWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Market | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => MarketConnection)
  async marketsConnection(
    @Args() { where, orderBy, ...pageOptions }: MarketConnectionWhereArgs,
    @Info() info: any
  ): Promise<MarketConnection> {
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
      result = await this.service.findConnection<MarketWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<MarketConnection>;
  }

  @FieldResolver(() => MarketHistory)
  async marketHistory(@Root() r: Market, @Ctx() ctx: BaseContext): Promise<MarketHistory[] | null> {
    return ctx.dataLoader.loaders.Market.marketHistory.load(r);
  }
}
