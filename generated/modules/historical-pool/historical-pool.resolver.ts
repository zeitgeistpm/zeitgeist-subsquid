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
  HistoricalPoolCreateInput,
  HistoricalPoolCreateManyArgs,
  HistoricalPoolUpdateArgs,
  HistoricalPoolWhereArgs,
  HistoricalPoolWhereInput,
  HistoricalPoolWhereUniqueInput,
  HistoricalPoolOrderByEnum,
} from '../../warthog';

import { HistoricalPool } from './historical-pool.model';
import { HistoricalPoolService } from './historical-pool.service';

@ObjectType()
export class HistoricalPoolEdge {
  @Field(() => HistoricalPool, { nullable: false })
  node!: HistoricalPool;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalPoolConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalPoolEdge], { nullable: false })
  edges!: HistoricalPoolEdge[];

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
export class HistoricalPoolConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalPoolWhereInput, { nullable: true })
  where?: HistoricalPoolWhereInput;

  @Field(() => HistoricalPoolOrderByEnum, { nullable: true })
  orderBy?: [HistoricalPoolOrderByEnum];
}

@Resolver(HistoricalPool)
export class HistoricalPoolResolver {
  constructor(@Inject('HistoricalPoolService') public readonly service: HistoricalPoolService) {}

  @Query(() => [HistoricalPool])
  async historicalPools(
    @Args() { where, orderBy, limit, offset }: HistoricalPoolWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalPool[]> {
    return this.service.find<HistoricalPoolWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalPool, { nullable: true })
  async historicalPoolByUniqueInput(
    @Arg('where') where: HistoricalPoolWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalPool | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalPoolConnection)
  async historicalPoolsConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalPoolConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalPoolConnection> {
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
      result = await this.service.findConnection<HistoricalPoolWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<HistoricalPoolConnection>;
  }
}
