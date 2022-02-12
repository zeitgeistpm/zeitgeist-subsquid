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
  HistoricalAssetCreateInput,
  HistoricalAssetCreateManyArgs,
  HistoricalAssetUpdateArgs,
  HistoricalAssetWhereArgs,
  HistoricalAssetWhereInput,
  HistoricalAssetWhereUniqueInput,
  HistoricalAssetOrderByEnum,
} from '../../warthog';

import { HistoricalAsset } from './historical-asset.model';
import { HistoricalAssetService } from './historical-asset.service';

@ObjectType()
export class HistoricalAssetEdge {
  @Field(() => HistoricalAsset, { nullable: false })
  node!: HistoricalAsset;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalAssetConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalAssetEdge], { nullable: false })
  edges!: HistoricalAssetEdge[];

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
export class HistoricalAssetConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalAssetWhereInput, { nullable: true })
  where?: HistoricalAssetWhereInput;

  @Field(() => HistoricalAssetOrderByEnum, { nullable: true })
  orderBy?: [HistoricalAssetOrderByEnum];
}

@Resolver(HistoricalAsset)
export class HistoricalAssetResolver {
  constructor(@Inject('HistoricalAssetService') public readonly service: HistoricalAssetService) {}

  @Query(() => [HistoricalAsset])
  async historicalAssets(
    @Args() { where, orderBy, limit, offset }: HistoricalAssetWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalAsset[]> {
    return this.service.find<HistoricalAssetWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalAsset, { nullable: true })
  async historicalAssetByUniqueInput(
    @Arg('where') where: HistoricalAssetWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalAsset | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalAssetConnection)
  async historicalAssetsConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalAssetConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalAssetConnection> {
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
      result = await this.service.findConnection<HistoricalAssetWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<HistoricalAssetConnection>;
  }
}
