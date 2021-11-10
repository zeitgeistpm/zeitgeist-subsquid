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
  MarketHistoryCreateInput,
  MarketHistoryCreateManyArgs,
  MarketHistoryUpdateArgs,
  MarketHistoryWhereArgs,
  MarketHistoryWhereInput,
  MarketHistoryWhereUniqueInput,
  MarketHistoryOrderByEnum,
} from '../../warthog';

import { MarketHistory } from './market-history.model';
import { MarketHistoryService } from './market-history.service';

import { Market } from '../market/market.model';
import { MarketService } from '../market/market.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class MarketHistoryEdge {
  @Field(() => MarketHistory, { nullable: false })
  node!: MarketHistory;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class MarketHistoryConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [MarketHistoryEdge], { nullable: false })
  edges!: MarketHistoryEdge[];

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
export class MarketHistoryConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => MarketHistoryWhereInput, { nullable: true })
  where?: MarketHistoryWhereInput;

  @Field(() => MarketHistoryOrderByEnum, { nullable: true })
  orderBy?: [MarketHistoryOrderByEnum];
}

@Resolver(MarketHistory)
export class MarketHistoryResolver {
  constructor(@Inject('MarketHistoryService') public readonly service: MarketHistoryService) {}

  @Query(() => [MarketHistory])
  async marketHistories(
    @Args() { where, orderBy, limit, offset }: MarketHistoryWhereArgs,
    @Fields() fields: string[]
  ): Promise<MarketHistory[]> {
    return this.service.find<MarketHistoryWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => MarketHistory, { nullable: true })
  async marketHistoryByUniqueInput(
    @Arg('where') where: MarketHistoryWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<MarketHistory | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => MarketHistoryConnection)
  async marketHistoriesConnection(
    @Args() { where, orderBy, ...pageOptions }: MarketHistoryConnectionWhereArgs,
    @Info() info: any
  ): Promise<MarketHistoryConnection> {
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
      result = await this.service.findConnection<MarketHistoryWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<MarketHistoryConnection>;
  }

  @FieldResolver(() => Market)
  async market(@Root() r: MarketHistory, @Ctx() ctx: BaseContext): Promise<Market | null> {
    return ctx.dataLoader.loaders.MarketHistory.market.load(r);
  }
}
