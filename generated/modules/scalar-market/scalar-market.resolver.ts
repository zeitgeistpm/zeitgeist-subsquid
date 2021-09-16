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
  ScalarMarketCreateInput,
  ScalarMarketCreateManyArgs,
  ScalarMarketUpdateArgs,
  ScalarMarketWhereArgs,
  ScalarMarketWhereInput,
  ScalarMarketWhereUniqueInput,
  ScalarMarketOrderByEnum,
} from '../../warthog';

import { ScalarMarket } from './scalar-market.model';
import { ScalarMarketService } from './scalar-market.service';

@ObjectType()
export class ScalarMarketEdge {
  @Field(() => ScalarMarket, { nullable: false })
  node!: ScalarMarket;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class ScalarMarketConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [ScalarMarketEdge], { nullable: false })
  edges!: ScalarMarketEdge[];

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
export class ScalarMarketConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => ScalarMarketWhereInput, { nullable: true })
  where?: ScalarMarketWhereInput;

  @Field(() => ScalarMarketOrderByEnum, { nullable: true })
  orderBy?: [ScalarMarketOrderByEnum];
}

@Resolver(ScalarMarket)
export class ScalarMarketResolver {
  constructor(@Inject('ScalarMarketService') public readonly service: ScalarMarketService) {}

  @Query(() => [ScalarMarket])
  async scalarMarkets(
    @Args() { where, orderBy, limit, offset }: ScalarMarketWhereArgs,
    @Fields() fields: string[]
  ): Promise<ScalarMarket[]> {
    return this.service.find<ScalarMarketWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => ScalarMarket, { nullable: true })
  async scalarMarketByUniqueInput(
    @Arg('where') where: ScalarMarketWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<ScalarMarket | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => ScalarMarketConnection)
  async scalarMarketsConnection(
    @Args() { where, orderBy, ...pageOptions }: ScalarMarketConnectionWhereArgs,
    @Info() info: any
  ): Promise<ScalarMarketConnection> {
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
      result = await this.service.findConnection<ScalarMarketWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<ScalarMarketConnection>;
  }
}
