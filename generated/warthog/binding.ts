import 'graphql-import-node'; // Needed so you can import *.graphql files 

import { makeBindingClass, Options } from 'graphql-binding'
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import * as schema from  './schema.graphql'

export interface Query {
    blockTimestamps: <T = Array<BlockTimestamp>>(args: { offset?: Int | null, limit?: Int | null, where?: BlockTimestampWhereInput | null, orderBy?: Array<BlockTimestampOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    blockTimestampByUniqueInput: <T = BlockTimestamp | null>(args: { where: BlockTimestampWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    blockTimestampsConnection: <T = BlockTimestampConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: BlockTimestampWhereInput | null, orderBy?: Array<BlockTimestampOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    categoricalMarkets: <T = Array<CategoricalMarket>>(args: { offset?: Int | null, limit?: Int | null, where?: CategoricalMarketWhereInput | null, orderBy?: Array<CategoricalMarketOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    categoricalMarketByUniqueInput: <T = CategoricalMarket | null>(args: { where: CategoricalMarketWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    categoricalMarketsConnection: <T = CategoricalMarketConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: CategoricalMarketWhereInput | null, orderBy?: Array<CategoricalMarketOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    markets: <T = Array<Market>>(args: { offset?: Int | null, limit?: Int | null, where?: MarketWhereInput | null, orderBy?: Array<MarketOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    marketByUniqueInput: <T = Market | null>(args: { where: MarketWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    marketsConnection: <T = MarketConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: MarketWhereInput | null, orderBy?: Array<MarketOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    commentSearch: <T = Array<CommentSearchFTSOutput>>(args: { whereTransfer?: TransferWhereInput | null, skip?: Int | null, limit?: Int | null, text: String }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    scalarMarkets: <T = Array<ScalarMarket>>(args: { offset?: Int | null, limit?: Int | null, where?: ScalarMarketWhereInput | null, orderBy?: Array<ScalarMarketOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    scalarMarketByUniqueInput: <T = ScalarMarket | null>(args: { where: ScalarMarketWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    scalarMarketsConnection: <T = ScalarMarketConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: ScalarMarketWhereInput | null, orderBy?: Array<ScalarMarketOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    transfers: <T = Array<Transfer>>(args: { offset?: Int | null, limit?: Int | null, where?: TransferWhereInput | null, orderBy?: Array<TransferOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    transferByUniqueInput: <T = Transfer | null>(args: { where: TransferWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    transfersConnection: <T = TransferConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: TransferWhereInput | null, orderBy?: Array<TransferOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    hello: <T = Hello>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Mutation {}

export interface Subscription {
    stateSubscription: <T = ProcessorState>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T>> 
  }

export interface Binding {
  query: Query
  mutation: Mutation
  subscription: Subscription
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
  delegateSubscription(fieldName: string, args?: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
  getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(...args: any[]): T
}

export const Binding = makeBindingClass<BindingConstructor<Binding>>({ schema: schema as any })

/**
 * Types
*/

export type BlockTimestampOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'blockNumber_ASC' |
  'blockNumber_DESC' |
  'timestamp_ASC' |
  'timestamp_DESC'

export type CategoricalMarketOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'oracle_ASC' |
  'oracle_DESC' |
  'creation_ASC' |
  'creation_DESC' |
  'categories_ASC' |
  'categories_DESC' |
  'block_ASC' |
  'block_DESC'

export type MarketOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'marketId_ASC' |
  'marketId_DESC' |
  'creator_ASC' |
  'creator_DESC' |
  'creation_ASC' |
  'creation_DESC' |
  'oracle_ASC' |
  'oracle_DESC' |
  'status_ASC' |
  'status_DESC' |
  'report_ASC' |
  'report_DESC' |
  'resolvedOutcome_ASC' |
  'resolvedOutcome_DESC' |
  'block_ASC' |
  'block_DESC'

export type ScalarMarketOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'oracle_ASC' |
  'oracle_DESC' |
  'end_ASC' |
  'end_DESC' |
  'creation_ASC' |
  'creation_DESC' |
  'block_ASC' |
  'block_DESC'

export type TransferOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'from_ASC' |
  'from_DESC' |
  'to_ASC' |
  'to_DESC' |
  'value_ASC' |
  'value_DESC' |
  'comment_ASC' |
  'comment_DESC' |
  'block_ASC' |
  'block_DESC' |
  'tip_ASC' |
  'tip_DESC' |
  'timestamp_ASC' |
  'timestamp_DESC' |
  'insertedAt_ASC' |
  'insertedAt_DESC'

export interface BaseWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
}

export interface BlockTimestampCreateInput {
  blockNumber: Float
  timestamp: String
}

export interface BlockTimestampUpdateInput {
  blockNumber?: Float | null
  timestamp?: String | null
}

export interface BlockTimestampWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  blockNumber_eq?: Int | null
  blockNumber_gt?: Int | null
  blockNumber_gte?: Int | null
  blockNumber_lt?: Int | null
  blockNumber_lte?: Int | null
  blockNumber_in?: Int[] | Int | null
  timestamp_eq?: BigInt | null
  timestamp_gt?: BigInt | null
  timestamp_gte?: BigInt | null
  timestamp_lt?: BigInt | null
  timestamp_lte?: BigInt | null
  timestamp_in?: BigInt[] | BigInt | null
  AND?: BlockTimestampWhereInput[] | BlockTimestampWhereInput | null
  OR?: BlockTimestampWhereInput[] | BlockTimestampWhereInput | null
}

export interface BlockTimestampWhereUniqueInput {
  id: ID_Output
}

export interface CategoricalMarketCreateInput {
  oracle: String
  creation: String
  categories: String
  block: Float
}

export interface CategoricalMarketUpdateInput {
  oracle?: String | null
  creation?: String | null
  categories?: String | null
  block?: Float | null
}

export interface CategoricalMarketWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  oracle_eq?: String | null
  oracle_contains?: String | null
  oracle_startsWith?: String | null
  oracle_endsWith?: String | null
  oracle_in?: String[] | String | null
  creation_eq?: String | null
  creation_contains?: String | null
  creation_startsWith?: String | null
  creation_endsWith?: String | null
  creation_in?: String[] | String | null
  categories_eq?: BigInt | null
  categories_gt?: BigInt | null
  categories_gte?: BigInt | null
  categories_lt?: BigInt | null
  categories_lte?: BigInt | null
  categories_in?: BigInt[] | BigInt | null
  block_eq?: Int | null
  block_gt?: Int | null
  block_gte?: Int | null
  block_lt?: Int | null
  block_lte?: Int | null
  block_in?: Int[] | Int | null
  AND?: CategoricalMarketWhereInput[] | CategoricalMarketWhereInput | null
  OR?: CategoricalMarketWhereInput[] | CategoricalMarketWhereInput | null
}

export interface CategoricalMarketWhereUniqueInput {
  id: ID_Output
}

export interface MarketCreateInput {
  marketId: Float
  creator: String
  creation: String
  oracle: String
  marketType: JSONObject
  period: JSONObject
  status: String
  report?: String | null
  resolvedOutcome?: String | null
  mdm: JSONObject
  block: Float
}

export interface MarketUpdateInput {
  marketId?: Float | null
  creator?: String | null
  creation?: String | null
  oracle?: String | null
  marketType?: JSONObject | null
  period?: JSONObject | null
  status?: String | null
  report?: String | null
  resolvedOutcome?: String | null
  mdm?: JSONObject | null
  block?: Float | null
}

export interface MarketWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  marketId_eq?: Int | null
  marketId_gt?: Int | null
  marketId_gte?: Int | null
  marketId_lt?: Int | null
  marketId_lte?: Int | null
  marketId_in?: Int[] | Int | null
  creator_eq?: String | null
  creator_contains?: String | null
  creator_startsWith?: String | null
  creator_endsWith?: String | null
  creator_in?: String[] | String | null
  creation_eq?: String | null
  creation_contains?: String | null
  creation_startsWith?: String | null
  creation_endsWith?: String | null
  creation_in?: String[] | String | null
  oracle_eq?: String | null
  oracle_contains?: String | null
  oracle_startsWith?: String | null
  oracle_endsWith?: String | null
  oracle_in?: String[] | String | null
  marketType_json?: JSONObject | null
  period_json?: JSONObject | null
  status_eq?: String | null
  status_contains?: String | null
  status_startsWith?: String | null
  status_endsWith?: String | null
  status_in?: String[] | String | null
  report_eq?: String | null
  report_contains?: String | null
  report_startsWith?: String | null
  report_endsWith?: String | null
  report_in?: String[] | String | null
  resolvedOutcome_eq?: String | null
  resolvedOutcome_contains?: String | null
  resolvedOutcome_startsWith?: String | null
  resolvedOutcome_endsWith?: String | null
  resolvedOutcome_in?: String[] | String | null
  mdm_json?: JSONObject | null
  block_eq?: Int | null
  block_gt?: Int | null
  block_gte?: Int | null
  block_lt?: Int | null
  block_lte?: Int | null
  block_in?: Int[] | Int | null
  AND?: MarketWhereInput[] | MarketWhereInput | null
  OR?: MarketWhereInput[] | MarketWhereInput | null
}

export interface MarketWhereUniqueInput {
  id: ID_Output
}

export interface ScalarMarketCreateInput {
  oracle: String
  end: String
  creation: String
  outcomeRange: Array<BigInt>
  block: Float
}

export interface ScalarMarketUpdateInput {
  oracle?: String | null
  end?: String | null
  creation?: String | null
  outcomeRange?: BigInt[] | BigInt | null
  block?: Float | null
}

export interface ScalarMarketWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  oracle_eq?: String | null
  oracle_contains?: String | null
  oracle_startsWith?: String | null
  oracle_endsWith?: String | null
  oracle_in?: String[] | String | null
  end_eq?: BigInt | null
  end_gt?: BigInt | null
  end_gte?: BigInt | null
  end_lt?: BigInt | null
  end_lte?: BigInt | null
  end_in?: BigInt[] | BigInt | null
  creation_eq?: String | null
  creation_contains?: String | null
  creation_startsWith?: String | null
  creation_endsWith?: String | null
  creation_in?: String[] | String | null
  outcomeRange_containsAll?: BigInt[] | BigInt | null
  outcomeRange_containsNone?: BigInt[] | BigInt | null
  outcomeRange_containsAny?: BigInt[] | BigInt | null
  block_eq?: Int | null
  block_gt?: Int | null
  block_gte?: Int | null
  block_lt?: Int | null
  block_lte?: Int | null
  block_in?: Int[] | Int | null
  AND?: ScalarMarketWhereInput[] | ScalarMarketWhereInput | null
  OR?: ScalarMarketWhereInput[] | ScalarMarketWhereInput | null
}

export interface ScalarMarketWhereUniqueInput {
  id: ID_Output
}

export interface TransferCreateInput {
  from: String
  to: String
  value: String
  comment?: String | null
  block: Float
  tip: String
  timestamp: String
  insertedAt: DateTime
}

export interface TransferUpdateInput {
  from?: String | null
  to?: String | null
  value?: String | null
  comment?: String | null
  block?: Float | null
  tip?: String | null
  timestamp?: String | null
  insertedAt?: DateTime | null
}

export interface TransferWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  from_eq?: Bytes | null
  from_in?: Bytes[] | Bytes | null
  to_eq?: Bytes | null
  to_in?: Bytes[] | Bytes | null
  value_eq?: BigInt | null
  value_gt?: BigInt | null
  value_gte?: BigInt | null
  value_lt?: BigInt | null
  value_lte?: BigInt | null
  value_in?: BigInt[] | BigInt | null
  comment_eq?: String | null
  comment_contains?: String | null
  comment_startsWith?: String | null
  comment_endsWith?: String | null
  comment_in?: String[] | String | null
  block_eq?: Int | null
  block_gt?: Int | null
  block_gte?: Int | null
  block_lt?: Int | null
  block_lte?: Int | null
  block_in?: Int[] | Int | null
  tip_eq?: BigInt | null
  tip_gt?: BigInt | null
  tip_gte?: BigInt | null
  tip_lt?: BigInt | null
  tip_lte?: BigInt | null
  tip_in?: BigInt[] | BigInt | null
  timestamp_eq?: BigInt | null
  timestamp_gt?: BigInt | null
  timestamp_gte?: BigInt | null
  timestamp_lt?: BigInt | null
  timestamp_lte?: BigInt | null
  timestamp_in?: BigInt[] | BigInt | null
  insertedAt_eq?: DateTime | null
  insertedAt_lt?: DateTime | null
  insertedAt_lte?: DateTime | null
  insertedAt_gt?: DateTime | null
  insertedAt_gte?: DateTime | null
  AND?: TransferWhereInput[] | TransferWhereInput | null
  OR?: TransferWhereInput[] | TransferWhereInput | null
}

export interface TransferWhereUniqueInput {
  id: ID_Output
}

export interface BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface DeleteResponse {
  id: ID_Output
}

export interface Authorized {
  value?: String | null
}

export interface BaseModel extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface BaseModelUUID extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface Block {
  value: String
}

/*
 *  Tracks block timestamps 

 */
export interface BlockTimestamp extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  blockNumber: Int
  timestamp: BigInt
}

export interface BlockTimestampConnection {
  totalCount: Int
  edges: Array<BlockTimestampEdge>
  pageInfo: PageInfo
}

export interface BlockTimestampEdge {
  node: BlockTimestamp
  cursor: String
}

export interface Categorical {
  value: String
}

export interface CategoricalMarket extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  oracle: String
  creation: String
  categories: BigInt
  block: Int
}

export interface CategoricalMarketConnection {
  totalCount: Int
  edges: Array<CategoricalMarketEdge>
  pageInfo: PageInfo
}

export interface CategoricalMarketEdge {
  node: CategoricalMarket
  cursor: String
}

export interface CommentSearchFTSOutput {
  item: CommentSearchSearchResult
  rank: Float
  isTypeOf: String
  highlight: String
}

export interface Court {
  value?: Boolean | null
}

export interface Hello {
  greeting: String
}

export interface Market extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  marketId: Int
  creator: String
  creation: String
  oracle: String
  marketType: MarketType
  period: MarketPeriod
  status: String
  report?: String | null
  resolvedOutcome?: String | null
  mdm: MarketDisputeMechanism
  block: Int
}

export interface MarketConnection {
  totalCount: Int
  edges: Array<MarketEdge>
  pageInfo: PageInfo
}

export interface MarketCreated {
  lowerBound: Float
  upperBound: Float
}

export interface MarketEdge {
  node: Market
  cursor: String
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface ProcessorState {
  lastCompleteBlock: Float
  lastProcessedEvent: String
  indexerHead: Float
  chainHead: Float
}

export interface Scalar {
  value: String
}

export interface ScalarMarket extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  oracle: String
  end: BigInt
  creation: String
  outcomeRange: Array<BigInt>
  block: Int
}

export interface ScalarMarketConnection {
  totalCount: Int
  edges: Array<ScalarMarketEdge>
  pageInfo: PageInfo
}

export interface ScalarMarketEdge {
  node: ScalarMarket
  cursor: String
}

export interface SimpleDisputes {
  value?: Boolean | null
}

export interface StandardDeleteResponse {
  id: ID_Output
}

export interface Timestamp {
  value: String
}

/*
 *  All transfers 

 */
export interface Transfer extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  from: Bytes
  to: Bytes
  value: BigInt
  comment?: String | null
  block: Int
  tip: BigInt
  timestamp: BigInt
  insertedAt: DateTime
}

export interface TransferConnection {
  totalCount: Int
  edges: Array<TransferEdge>
  pageInfo: PageInfo
}

export interface TransferEdge {
  node: Transfer
  cursor: String
}

/*
GraphQL representation of BigInt
*/
export type BigInt = string

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
GraphQL representation of Bytes
*/
export type Bytes = string

/*
The javascript `Date` as string. Type represents date and time as the ISO Date string.
*/
export type DateTime = Date | string

/*
The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).
*/
export type Float = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.
*/
export type Int = number

/*
The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
*/

    export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

    export type JsonPrimitive = string | number | boolean | null | {};
    
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface JsonArray extends Array<JsonValue> {}
    
    export type JsonObject = { [member: string]: JsonValue };

    export type JSONObject = JsonObject;
  

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string

export type CommentSearchSearchResult = Transfer

export type MarketDisputeMechanism = Authorized | Court | SimpleDisputes

export type MarketPeriod = Block | Timestamp

export type MarketType = Categorical | Scalar