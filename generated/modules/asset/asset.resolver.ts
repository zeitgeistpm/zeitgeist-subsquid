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
  AssetCreateInput,
  AssetCreateManyArgs,
  AssetUpdateArgs,
  AssetWhereArgs,
  AssetWhereInput,
  AssetWhereUniqueInput,
  AssetOrderByEnum,
} from '../../warthog';

import { Asset } from './asset.model';
import { AssetService } from './asset.service';

@ObjectType()
export class AssetEdge {
  @Field(() => Asset, { nullable: false })
  node!: Asset;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class AssetConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [AssetEdge], { nullable: false })
  edges!: AssetEdge[];

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
export class AssetConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => AssetWhereInput, { nullable: true })
  where?: AssetWhereInput;

  @Field(() => AssetOrderByEnum, { nullable: true })
  orderBy?: [AssetOrderByEnum];
}

@Resolver(Asset)
export class AssetResolver {
  constructor(@Inject('AssetService') public readonly service: AssetService) {}

  @Query(() => [Asset])
  async assets(
    @Args() { where, orderBy, limit, offset }: AssetWhereArgs,
    @Fields() fields: string[]
  ): Promise<Asset[]> {
    return this.service.find<AssetWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Asset, { nullable: true })
  async assetByUniqueInput(
    @Arg('where') where: AssetWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Asset | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => AssetConnection)
  async assetsConnection(
    @Args() { where, orderBy, ...pageOptions }: AssetConnectionWhereArgs,
    @Info() info: any
  ): Promise<AssetConnection> {
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
      result = await this.service.findConnection<AssetWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<AssetConnection>;
  }
}
