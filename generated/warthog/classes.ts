// This file has been auto-generated by Warthog.  Do not update directly as it
// will be re-written.  If you need to change this file, update models or add
// new TypeGraphQL objects
// prettier-ignore
// @ts-ignore
import { DateResolver as Date } from 'graphql-scalars';
// prettier-ignore
// @ts-ignore
import { GraphQLID as ID } from 'graphql';
// prettier-ignore
// @ts-ignore
import { ArgsType, Field as TypeGraphQLField, Float, InputType as TypeGraphQLInputType, Int } from 'type-graphql';
// prettier-ignore
// @ts-ignore
import { registerEnumType, GraphQLISODateTime as DateTime } from "type-graphql";

import * as BN from "bn.js";

// prettier-ignore
// @ts-ignore eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLJSONObject } = require('graphql-type-json');
// prettier-ignore
// @ts-ignore
import { BaseWhereInput, JsonObject, PaginationArgs, DateOnlyString, DateTimeString, BigInt, Bytes } from '@subsquid/warthog';

// @ts-ignore
import { BlockTimestamp } from "../modules/block-timestamp/block-timestamp.model";
// @ts-ignore
import { Market } from "../modules/market/market.model";
// @ts-ignore
import { MarketData } from "../modules/market-data/market-data.model";
// @ts-ignore
import { Pool } from "../modules/pool/pool.model";
// @ts-ignore
import { Transfer } from "../modules/transfer/transfer.model";

export enum BlockTimestampOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  blockNumber_ASC = "blockNumber_ASC",
  blockNumber_DESC = "blockNumber_DESC",

  timestamp_ASC = "timestamp_ASC",
  timestamp_DESC = "timestamp_DESC",
}

registerEnumType(BlockTimestampOrderByEnum, {
  name: "BlockTimestampOrderByInput",
});

@TypeGraphQLInputType()
export class BlockTimestampWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  blockNumber_in?: number[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  timestamp_in?: string[];

  @TypeGraphQLField(() => BlockTimestampWhereInput, { nullable: true })
  AND?: [BlockTimestampWhereInput];

  @TypeGraphQLField(() => BlockTimestampWhereInput, { nullable: true })
  OR?: [BlockTimestampWhereInput];
}

@TypeGraphQLInputType()
export class BlockTimestampWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class BlockTimestampCreateInput {
  @TypeGraphQLField()
  blockNumber!: number;

  @TypeGraphQLField()
  timestamp!: string;
}

@TypeGraphQLInputType()
export class BlockTimestampUpdateInput {
  @TypeGraphQLField({ nullable: true })
  blockNumber?: number;

  @TypeGraphQLField({ nullable: true })
  timestamp?: string;
}

@ArgsType()
export class BlockTimestampWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => BlockTimestampWhereInput, { nullable: true })
  where?: BlockTimestampWhereInput;

  @TypeGraphQLField(() => BlockTimestampOrderByEnum, { nullable: true })
  orderBy?: BlockTimestampOrderByEnum[];
}

@ArgsType()
export class BlockTimestampCreateManyArgs {
  @TypeGraphQLField(() => [BlockTimestampCreateInput])
  data!: BlockTimestampCreateInput[];
}

@ArgsType()
export class BlockTimestampUpdateArgs {
  @TypeGraphQLField() data!: BlockTimestampUpdateInput;
  @TypeGraphQLField() where!: BlockTimestampWhereUniqueInput;
}

export enum MarketOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  marketId_ASC = "marketId_ASC",
  marketId_DESC = "marketId_DESC",

  creator_ASC = "creator_ASC",
  creator_DESC = "creator_DESC",

  creation_ASC = "creation_ASC",
  creation_DESC = "creation_DESC",

  oracle_ASC = "oracle_ASC",
  oracle_DESC = "oracle_DESC",

  slug_ASC = "slug_ASC",
  slug_DESC = "slug_DESC",

  question_ASC = "question_ASC",
  question_DESC = "question_DESC",

  description_ASC = "description_ASC",
  description_DESC = "description_DESC",

  marketData_ASC = "marketData_ASC",
  marketData_DESC = "marketData_DESC",
}

registerEnumType(MarketOrderByEnum, {
  name: "MarketOrderByInput",
});

@TypeGraphQLInputType()
export class MarketWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  marketId_in?: number[];

  @TypeGraphQLField({ nullable: true })
  creator_eq?: string;

  @TypeGraphQLField({ nullable: true })
  creator_contains?: string;

  @TypeGraphQLField({ nullable: true })
  creator_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  creator_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  creator_in?: string[];

  @TypeGraphQLField({ nullable: true })
  creation_eq?: string;

  @TypeGraphQLField({ nullable: true })
  creation_contains?: string;

  @TypeGraphQLField({ nullable: true })
  creation_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  creation_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  creation_in?: string[];

  @TypeGraphQLField({ nullable: true })
  oracle_eq?: string;

  @TypeGraphQLField({ nullable: true })
  oracle_contains?: string;

  @TypeGraphQLField({ nullable: true })
  oracle_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  oracle_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  oracle_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  marketType_json?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  slug_eq?: string;

  @TypeGraphQLField({ nullable: true })
  slug_contains?: string;

  @TypeGraphQLField({ nullable: true })
  slug_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  slug_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  slug_in?: string[];

  @TypeGraphQLField({ nullable: true })
  question_eq?: string;

  @TypeGraphQLField({ nullable: true })
  question_contains?: string;

  @TypeGraphQLField({ nullable: true })
  question_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  question_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  question_in?: string[];

  @TypeGraphQLField({ nullable: true })
  description_eq?: string;

  @TypeGraphQLField({ nullable: true })
  description_contains?: string;

  @TypeGraphQLField({ nullable: true })
  description_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  description_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  description_in?: string[];

  @TypeGraphQLField(() => MarketDataWhereInput, { nullable: true })
  marketData?: MarketDataWhereInput;

  @TypeGraphQLField(() => MarketWhereInput, { nullable: true })
  AND?: [MarketWhereInput];

  @TypeGraphQLField(() => MarketWhereInput, { nullable: true })
  OR?: [MarketWhereInput];
}

@TypeGraphQLInputType()
export class MarketWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class MarketCreateInput {
  @TypeGraphQLField()
  marketId!: number;

  @TypeGraphQLField()
  creator!: string;

  @TypeGraphQLField()
  creation!: string;

  @TypeGraphQLField()
  oracle!: string;

  @TypeGraphQLField(() => GraphQLJSONObject)
  marketType!: JsonObject;

  @TypeGraphQLField({ nullable: true })
  slug?: string;

  @TypeGraphQLField({ nullable: true })
  question?: string;

  @TypeGraphQLField({ nullable: true })
  description?: string;

  @TypeGraphQLField(() => ID)
  marketData!: string;
}

@TypeGraphQLInputType()
export class MarketUpdateInput {
  @TypeGraphQLField({ nullable: true })
  marketId?: number;

  @TypeGraphQLField({ nullable: true })
  creator?: string;

  @TypeGraphQLField({ nullable: true })
  creation?: string;

  @TypeGraphQLField({ nullable: true })
  oracle?: string;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  marketType?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  slug?: string;

  @TypeGraphQLField({ nullable: true })
  question?: string;

  @TypeGraphQLField({ nullable: true })
  description?: string;

  @TypeGraphQLField(() => ID, { nullable: true })
  marketData?: string;
}

@ArgsType()
export class MarketWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => MarketWhereInput, { nullable: true })
  where?: MarketWhereInput;

  @TypeGraphQLField(() => MarketOrderByEnum, { nullable: true })
  orderBy?: MarketOrderByEnum[];
}

@ArgsType()
export class MarketCreateManyArgs {
  @TypeGraphQLField(() => [MarketCreateInput])
  data!: MarketCreateInput[];
}

@ArgsType()
export class MarketUpdateArgs {
  @TypeGraphQLField() data!: MarketUpdateInput;
  @TypeGraphQLField() where!: MarketWhereUniqueInput;
}

export enum MarketDataOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  status_ASC = "status_ASC",
  status_DESC = "status_DESC",

  report_ASC = "report_ASC",
  report_DESC = "report_DESC",

  resolvedOutcome_ASC = "resolvedOutcome_ASC",
  resolvedOutcome_DESC = "resolvedOutcome_DESC",

  blockNumber_ASC = "blockNumber_ASC",
  blockNumber_DESC = "blockNumber_DESC",

  timestamp_ASC = "timestamp_ASC",
  timestamp_DESC = "timestamp_DESC",
}

registerEnumType(MarketDataOrderByEnum, {
  name: "MarketDataOrderByInput",
});

@TypeGraphQLInputType()
export class MarketDataWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  period_json?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  status_eq?: string;

  @TypeGraphQLField({ nullable: true })
  status_contains?: string;

  @TypeGraphQLField({ nullable: true })
  status_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  status_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  status_in?: string[];

  @TypeGraphQLField({ nullable: true })
  report_eq?: string;

  @TypeGraphQLField({ nullable: true })
  report_contains?: string;

  @TypeGraphQLField({ nullable: true })
  report_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  report_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  report_in?: string[];

  @TypeGraphQLField({ nullable: true })
  resolvedOutcome_eq?: string;

  @TypeGraphQLField({ nullable: true })
  resolvedOutcome_contains?: string;

  @TypeGraphQLField({ nullable: true })
  resolvedOutcome_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  resolvedOutcome_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  resolvedOutcome_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  mdm_json?: JsonObject;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  blockNumber_in?: number[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  timestamp_in?: string[];

  @TypeGraphQLField(() => MarketWhereInput, { nullable: true })
  marketmarketData_none?: MarketWhereInput;

  @TypeGraphQLField(() => MarketWhereInput, { nullable: true })
  marketmarketData_some?: MarketWhereInput;

  @TypeGraphQLField(() => MarketWhereInput, { nullable: true })
  marketmarketData_every?: MarketWhereInput;

  @TypeGraphQLField(() => MarketDataWhereInput, { nullable: true })
  AND?: [MarketDataWhereInput];

  @TypeGraphQLField(() => MarketDataWhereInput, { nullable: true })
  OR?: [MarketDataWhereInput];
}

@TypeGraphQLInputType()
export class MarketDataWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class MarketDataCreateInput {
  @TypeGraphQLField(() => GraphQLJSONObject)
  period!: JsonObject;

  @TypeGraphQLField()
  status!: string;

  @TypeGraphQLField({ nullable: true })
  report?: string;

  @TypeGraphQLField({ nullable: true })
  resolvedOutcome?: string;

  @TypeGraphQLField(() => GraphQLJSONObject)
  mdm!: JsonObject;

  @TypeGraphQLField()
  blockNumber!: number;

  @TypeGraphQLField()
  timestamp!: string;
}

@TypeGraphQLInputType()
export class MarketDataUpdateInput {
  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  period?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  status?: string;

  @TypeGraphQLField({ nullable: true })
  report?: string;

  @TypeGraphQLField({ nullable: true })
  resolvedOutcome?: string;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  mdm?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  blockNumber?: number;

  @TypeGraphQLField({ nullable: true })
  timestamp?: string;
}

@ArgsType()
export class MarketDataWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => MarketDataWhereInput, { nullable: true })
  where?: MarketDataWhereInput;

  @TypeGraphQLField(() => MarketDataOrderByEnum, { nullable: true })
  orderBy?: MarketDataOrderByEnum[];
}

@ArgsType()
export class MarketDataCreateManyArgs {
  @TypeGraphQLField(() => [MarketDataCreateInput])
  data!: MarketDataCreateInput[];
}

@ArgsType()
export class MarketDataUpdateArgs {
  @TypeGraphQLField() data!: MarketDataUpdateInput;
  @TypeGraphQLField() where!: MarketDataWhereUniqueInput;
}

export enum PoolOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  poolId_ASC = "poolId_ASC",
  poolId_DESC = "poolId_DESC",

  baseAsset_ASC = "baseAsset_ASC",
  baseAsset_DESC = "baseAsset_DESC",

  marketId_ASC = "marketId_ASC",
  marketId_DESC = "marketId_DESC",

  poolStatus_ASC = "poolStatus_ASC",
  poolStatus_DESC = "poolStatus_DESC",

  scoringRule_ASC = "scoringRule_ASC",
  scoringRule_DESC = "scoringRule_DESC",

  swapFee_ASC = "swapFee_ASC",
  swapFee_DESC = "swapFee_DESC",

  totalSubsidy_ASC = "totalSubsidy_ASC",
  totalSubsidy_DESC = "totalSubsidy_DESC",

  totalWeight_ASC = "totalWeight_ASC",
  totalWeight_DESC = "totalWeight_DESC",

  blockNumber_ASC = "blockNumber_ASC",
  blockNumber_DESC = "blockNumber_DESC",

  timestamp_ASC = "timestamp_ASC",
  timestamp_DESC = "timestamp_DESC",
}

registerEnumType(PoolOrderByEnum, {
  name: "PoolOrderByInput",
});

@TypeGraphQLInputType()
export class PoolWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  poolId_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  poolId_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  poolId_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  poolId_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  poolId_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  poolId_in?: number[];

  @TypeGraphQLField({ nullable: true })
  baseAsset_eq?: string;

  @TypeGraphQLField({ nullable: true })
  baseAsset_contains?: string;

  @TypeGraphQLField({ nullable: true })
  baseAsset_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  baseAsset_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  baseAsset_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  marketId_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  marketId_in?: number[];

  @TypeGraphQLField({ nullable: true })
  poolStatus_eq?: string;

  @TypeGraphQLField({ nullable: true })
  poolStatus_contains?: string;

  @TypeGraphQLField({ nullable: true })
  poolStatus_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  poolStatus_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  poolStatus_in?: string[];

  @TypeGraphQLField({ nullable: true })
  scoringRule_eq?: string;

  @TypeGraphQLField({ nullable: true })
  scoringRule_contains?: string;

  @TypeGraphQLField({ nullable: true })
  scoringRule_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  scoringRule_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  scoringRule_in?: string[];

  @TypeGraphQLField({ nullable: true })
  swapFee_eq?: string;

  @TypeGraphQLField({ nullable: true })
  swapFee_contains?: string;

  @TypeGraphQLField({ nullable: true })
  swapFee_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  swapFee_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  swapFee_in?: string[];

  @TypeGraphQLField({ nullable: true })
  totalSubsidy_eq?: string;

  @TypeGraphQLField({ nullable: true })
  totalSubsidy_contains?: string;

  @TypeGraphQLField({ nullable: true })
  totalSubsidy_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  totalSubsidy_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  totalSubsidy_in?: string[];

  @TypeGraphQLField({ nullable: true })
  totalWeight_eq?: string;

  @TypeGraphQLField({ nullable: true })
  totalWeight_contains?: string;

  @TypeGraphQLField({ nullable: true })
  totalWeight_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  totalWeight_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  totalWeight_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  blockNumber_in?: number[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  timestamp_in?: string[];

  @TypeGraphQLField(() => PoolWhereInput, { nullable: true })
  AND?: [PoolWhereInput];

  @TypeGraphQLField(() => PoolWhereInput, { nullable: true })
  OR?: [PoolWhereInput];
}

@TypeGraphQLInputType()
export class PoolWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class PoolCreateInput {
  @TypeGraphQLField()
  poolId!: number;

  @TypeGraphQLField()
  baseAsset!: string;

  @TypeGraphQLField()
  marketId!: number;

  @TypeGraphQLField()
  poolStatus!: string;

  @TypeGraphQLField()
  scoringRule!: string;

  @TypeGraphQLField()
  swapFee!: string;

  @TypeGraphQLField()
  totalSubsidy!: string;

  @TypeGraphQLField()
  totalWeight!: string;

  @TypeGraphQLField()
  blockNumber!: number;

  @TypeGraphQLField()
  timestamp!: string;
}

@TypeGraphQLInputType()
export class PoolUpdateInput {
  @TypeGraphQLField({ nullable: true })
  poolId?: number;

  @TypeGraphQLField({ nullable: true })
  baseAsset?: string;

  @TypeGraphQLField({ nullable: true })
  marketId?: number;

  @TypeGraphQLField({ nullable: true })
  poolStatus?: string;

  @TypeGraphQLField({ nullable: true })
  scoringRule?: string;

  @TypeGraphQLField({ nullable: true })
  swapFee?: string;

  @TypeGraphQLField({ nullable: true })
  totalSubsidy?: string;

  @TypeGraphQLField({ nullable: true })
  totalWeight?: string;

  @TypeGraphQLField({ nullable: true })
  blockNumber?: number;

  @TypeGraphQLField({ nullable: true })
  timestamp?: string;
}

@ArgsType()
export class PoolWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => PoolWhereInput, { nullable: true })
  where?: PoolWhereInput;

  @TypeGraphQLField(() => PoolOrderByEnum, { nullable: true })
  orderBy?: PoolOrderByEnum[];
}

@ArgsType()
export class PoolCreateManyArgs {
  @TypeGraphQLField(() => [PoolCreateInput])
  data!: PoolCreateInput[];
}

@ArgsType()
export class PoolUpdateArgs {
  @TypeGraphQLField() data!: PoolUpdateInput;
  @TypeGraphQLField() where!: PoolWhereUniqueInput;
}

export enum TransferOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  from_ASC = "from_ASC",
  from_DESC = "from_DESC",

  to_ASC = "to_ASC",
  to_DESC = "to_DESC",

  value_ASC = "value_ASC",
  value_DESC = "value_DESC",

  comment_ASC = "comment_ASC",
  comment_DESC = "comment_DESC",

  block_ASC = "block_ASC",
  block_DESC = "block_DESC",

  tip_ASC = "tip_ASC",
  tip_DESC = "tip_DESC",

  timestamp_ASC = "timestamp_ASC",
  timestamp_DESC = "timestamp_DESC",

  insertedAt_ASC = "insertedAt_ASC",
  insertedAt_DESC = "insertedAt_DESC",
}

registerEnumType(TransferOrderByEnum, {
  name: "TransferOrderByInput",
});

@TypeGraphQLInputType()
export class TransferWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => Bytes, { nullable: true })
  from_eq?: string;

  @TypeGraphQLField(() => [Bytes], { nullable: true })
  from_in?: string[];

  @TypeGraphQLField(() => Bytes, { nullable: true })
  to_eq?: string;

  @TypeGraphQLField(() => [Bytes], { nullable: true })
  to_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  value_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  value_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  value_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  value_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  value_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  value_in?: string[];

  @TypeGraphQLField({ nullable: true })
  comment_eq?: string;

  @TypeGraphQLField({ nullable: true })
  comment_contains?: string;

  @TypeGraphQLField({ nullable: true })
  comment_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  comment_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  comment_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  block_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  block_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  block_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  block_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  block_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  block_in?: number[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  tip_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  tip_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  tip_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  tip_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  tip_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  tip_in?: string[];

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_eq?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_gte?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lt?: string;

  @TypeGraphQLField(() => BigInt, { nullable: true })
  timestamp_lte?: string;

  @TypeGraphQLField(() => [BigInt], { nullable: true })
  timestamp_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  insertedAt_eq?: DateTimeString;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  insertedAt_lt?: DateTimeString;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  insertedAt_lte?: DateTimeString;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  insertedAt_gt?: DateTimeString;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  insertedAt_gte?: DateTimeString;

  @TypeGraphQLField(() => TransferWhereInput, { nullable: true })
  AND?: [TransferWhereInput];

  @TypeGraphQLField(() => TransferWhereInput, { nullable: true })
  OR?: [TransferWhereInput];
}

@TypeGraphQLInputType()
export class TransferWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class TransferCreateInput {
  @TypeGraphQLField()
  from!: string;

  @TypeGraphQLField()
  to!: string;

  @TypeGraphQLField()
  value!: string;

  @TypeGraphQLField({ nullable: true })
  comment?: string;

  @TypeGraphQLField()
  block!: number;

  @TypeGraphQLField()
  tip!: string;

  @TypeGraphQLField()
  timestamp!: string;

  @TypeGraphQLField(() => DateTime)
  insertedAt!: DateTimeString;
}

@TypeGraphQLInputType()
export class TransferUpdateInput {
  @TypeGraphQLField({ nullable: true })
  from?: string;

  @TypeGraphQLField({ nullable: true })
  to?: string;

  @TypeGraphQLField({ nullable: true })
  value?: string;

  @TypeGraphQLField({ nullable: true })
  comment?: string;

  @TypeGraphQLField({ nullable: true })
  block?: number;

  @TypeGraphQLField({ nullable: true })
  tip?: string;

  @TypeGraphQLField({ nullable: true })
  timestamp?: string;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  insertedAt?: DateTimeString;
}

@ArgsType()
export class TransferWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => TransferWhereInput, { nullable: true })
  where?: TransferWhereInput;

  @TypeGraphQLField(() => TransferOrderByEnum, { nullable: true })
  orderBy?: TransferOrderByEnum[];
}

@ArgsType()
export class TransferCreateManyArgs {
  @TypeGraphQLField(() => [TransferCreateInput])
  data!: TransferCreateInput[];
}

@ArgsType()
export class TransferUpdateArgs {
  @TypeGraphQLField() data!: TransferUpdateInput;
  @TypeGraphQLField() where!: TransferWhereUniqueInput;
}
