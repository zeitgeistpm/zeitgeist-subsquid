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
  MarketDataCreateInput,
  MarketDataCreateManyArgs,
  MarketDataUpdateArgs,
  MarketDataWhereArgs,
  MarketDataWhereInput,
  MarketDataWhereUniqueInput,
  MarketDataOrderByEnum,
} from '../../warthog';

import { MarketData } from './market-data.model';
import { MarketDataService } from './market-data.service';

import { Market } from '../market/market.model';
import { MarketService } from '../market/market.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class MarketDataEdge {
  @Field(() => MarketData, { nullable: false })
  node!: MarketData;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class MarketDataConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [MarketDataEdge], { nullable: false })
  edges!: MarketDataEdge[];

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
export class MarketDataConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => MarketDataWhereInput, { nullable: true })
  where?: MarketDataWhereInput;

  @Field(() => MarketDataOrderByEnum, { nullable: true })
  orderBy?: [MarketDataOrderByEnum];
}

@Resolver(MarketData)
export class MarketDataResolver {
  constructor(@Inject('MarketDataService') public readonly service: MarketDataService) {}

  @Query(() => [MarketData])
  async marketData(
    @Args() { where, orderBy, limit, offset }: MarketDataWhereArgs,
    @Fields() fields: string[]
  ): Promise<MarketData[]> {
    return this.service.find<MarketDataWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => MarketData, { nullable: true })
  async marketDataByUniqueInput(
    @Arg('where') where: MarketDataWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<MarketData | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => MarketDataConnection)
  async marketDataConnection(
    @Args() { where, orderBy, ...pageOptions }: MarketDataConnectionWhereArgs,
    @Info() info: any
  ): Promise<MarketDataConnection> {
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
      result = await this.service.findConnection<MarketDataWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<MarketDataConnection>;
  }

  @FieldResolver(() => Market)
  async marketmarketData(@Root() r: MarketData, @Ctx() ctx: BaseContext): Promise<Market[] | null> {
    return ctx.dataLoader.loaders.MarketData.marketmarketData.load(r);
  }
}
