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
  HistoricalAssetPriceCreateInput,
  HistoricalAssetPriceCreateManyArgs,
  HistoricalAssetPriceUpdateArgs,
  HistoricalAssetPriceWhereArgs,
  HistoricalAssetPriceWhereInput,
  HistoricalAssetPriceWhereUniqueInput,
  HistoricalAssetPriceOrderByEnum,
} from '../../warthog';

import { HistoricalAssetPrice } from './historical-asset-price.model';
import { HistoricalAssetPriceService } from './historical-asset-price.service';

@ObjectType()
export class HistoricalAssetPriceEdge {
  @Field(() => HistoricalAssetPrice, { nullable: false })
  node!: HistoricalAssetPrice;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalAssetPriceConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalAssetPriceEdge], { nullable: false })
  edges!: HistoricalAssetPriceEdge[];

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
export class HistoricalAssetPriceConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalAssetPriceWhereInput, { nullable: true })
  where?: HistoricalAssetPriceWhereInput;

  @Field(() => HistoricalAssetPriceOrderByEnum, { nullable: true })
  orderBy?: [HistoricalAssetPriceOrderByEnum];
}

@Resolver(HistoricalAssetPrice)
export class HistoricalAssetPriceResolver {
  constructor(@Inject('HistoricalAssetPriceService') public readonly service: HistoricalAssetPriceService) {}

  @Query(() => [HistoricalAssetPrice])
  async historicalAssetPrices(
    @Args() { where, orderBy, limit, offset }: HistoricalAssetPriceWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalAssetPrice[]> {
    return this.service.find<HistoricalAssetPriceWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalAssetPrice, { nullable: true })
  async historicalAssetPriceByUniqueInput(
    @Arg('where') where: HistoricalAssetPriceWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalAssetPrice | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalAssetPriceConnection)
  async historicalAssetPricesConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalAssetPriceConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalAssetPriceConnection> {
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
      result = await this.service.findConnection<HistoricalAssetPriceWhereInput>(
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

    return result as Promise<HistoricalAssetPriceConnection>;
  }
}
