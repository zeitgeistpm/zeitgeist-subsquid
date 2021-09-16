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
  CategoricalMarketCreateInput,
  CategoricalMarketCreateManyArgs,
  CategoricalMarketUpdateArgs,
  CategoricalMarketWhereArgs,
  CategoricalMarketWhereInput,
  CategoricalMarketWhereUniqueInput,
  CategoricalMarketOrderByEnum,
} from '../../warthog';

import { CategoricalMarket } from './categorical-market.model';
import { CategoricalMarketService } from './categorical-market.service';

@ObjectType()
export class CategoricalMarketEdge {
  @Field(() => CategoricalMarket, { nullable: false })
  node!: CategoricalMarket;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class CategoricalMarketConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [CategoricalMarketEdge], { nullable: false })
  edges!: CategoricalMarketEdge[];

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
export class CategoricalMarketConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => CategoricalMarketWhereInput, { nullable: true })
  where?: CategoricalMarketWhereInput;

  @Field(() => CategoricalMarketOrderByEnum, { nullable: true })
  orderBy?: [CategoricalMarketOrderByEnum];
}

@Resolver(CategoricalMarket)
export class CategoricalMarketResolver {
  constructor(@Inject('CategoricalMarketService') public readonly service: CategoricalMarketService) {}

  @Query(() => [CategoricalMarket])
  async categoricalMarkets(
    @Args() { where, orderBy, limit, offset }: CategoricalMarketWhereArgs,
    @Fields() fields: string[]
  ): Promise<CategoricalMarket[]> {
    return this.service.find<CategoricalMarketWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => CategoricalMarket, { nullable: true })
  async categoricalMarketByUniqueInput(
    @Arg('where') where: CategoricalMarketWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<CategoricalMarket | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => CategoricalMarketConnection)
  async categoricalMarketsConnection(
    @Args() { where, orderBy, ...pageOptions }: CategoricalMarketConnectionWhereArgs,
    @Info() info: any
  ): Promise<CategoricalMarketConnection> {
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
      result = await this.service.findConnection<CategoricalMarketWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<CategoricalMarketConnection>;
  }
}
