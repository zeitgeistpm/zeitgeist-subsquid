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
  CategoryMetadataCreateInput,
  CategoryMetadataCreateManyArgs,
  CategoryMetadataUpdateArgs,
  CategoryMetadataWhereArgs,
  CategoryMetadataWhereInput,
  CategoryMetadataWhereUniqueInput,
  CategoryMetadataOrderByEnum,
} from '../../warthog';

import { CategoryMetadata } from './category-metadata.model';
import { CategoryMetadataService } from './category-metadata.service';

import { Market } from '../market/market.model';
import { MarketService } from '../market/market.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class CategoryMetadataEdge {
  @Field(() => CategoryMetadata, { nullable: false })
  node!: CategoryMetadata;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class CategoryMetadataConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [CategoryMetadataEdge], { nullable: false })
  edges!: CategoryMetadataEdge[];

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
export class CategoryMetadataConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => CategoryMetadataWhereInput, { nullable: true })
  where?: CategoryMetadataWhereInput;

  @Field(() => CategoryMetadataOrderByEnum, { nullable: true })
  orderBy?: [CategoryMetadataOrderByEnum];
}

@Resolver(CategoryMetadata)
export class CategoryMetadataResolver {
  constructor(@Inject('CategoryMetadataService') public readonly service: CategoryMetadataService) {}

  @Query(() => [CategoryMetadata])
  async categoryMetadata(
    @Args() { where, orderBy, limit, offset }: CategoryMetadataWhereArgs,
    @Fields() fields: string[]
  ): Promise<CategoryMetadata[]> {
    return this.service.find<CategoryMetadataWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => CategoryMetadata, { nullable: true })
  async categoryMetadataByUniqueInput(
    @Arg('where') where: CategoryMetadataWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<CategoryMetadata | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => CategoryMetadataConnection)
  async categoryMetadataConnection(
    @Args() { where, orderBy, ...pageOptions }: CategoryMetadataConnectionWhereArgs,
    @Info() info: any
  ): Promise<CategoryMetadataConnection> {
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
      result = await this.service.findConnection<CategoryMetadataWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<CategoryMetadataConnection>;
  }

  @FieldResolver(() => Market)
  async market(@Root() r: CategoryMetadata, @Ctx() ctx: BaseContext): Promise<Market | null> {
    return ctx.dataLoader.loaders.CategoryMetadata.market.load(r);
  }
}
