import type {Result} from './support'

export interface Market {
  creator: Uint8Array
  creation: MarketCreation
  creatorFee: number
  oracle: Uint8Array
  metadata: Uint8Array
  marketType: MarketType
  period: MarketPeriod
  scoringRule: ScoringRule
  status: MarketStatus
  report: (Report | undefined)
  resolvedOutcome: (OutcomeReport | undefined)
  mdm: MarketDisputeMechanism
}

export interface CommonPoolEventParams {
  poolId: bigint
  who: Uint8Array
}

export interface Pool {
  assets: Asset[]
  baseAsset: Asset
  marketId: bigint
  poolStatus: PoolStatus
  scoringRule: ScoringRule
  swapFee: (bigint | undefined)
  totalSubsidy: (bigint | undefined)
  totalWeight: (bigint | undefined)
  weights: ([Asset, bigint][] | undefined)
}

export type DispatchError = DispatchError_Other | DispatchError_CannotLookup | DispatchError_BadOrigin | DispatchError_Module | DispatchError_ConsumerRemaining | DispatchError_NoProviders | DispatchError_TooManyConsumers | DispatchError_Token | DispatchError_Arithmetic | DispatchError_Transactional

export interface DispatchError_Other {
  __kind: 'Other'
}

export interface DispatchError_CannotLookup {
  __kind: 'CannotLookup'
}

export interface DispatchError_BadOrigin {
  __kind: 'BadOrigin'
}

export interface DispatchError_Module {
  __kind: 'Module'
  value: ModuleError
}

export interface DispatchError_ConsumerRemaining {
  __kind: 'ConsumerRemaining'
}

export interface DispatchError_NoProviders {
  __kind: 'NoProviders'
}

export interface DispatchError_TooManyConsumers {
  __kind: 'TooManyConsumers'
}

export interface DispatchError_Token {
  __kind: 'Token'
  value: TokenError
}

export interface DispatchError_Arithmetic {
  __kind: 'Arithmetic'
  value: ArithmeticError
}

export interface DispatchError_Transactional {
  __kind: 'Transactional'
  value: TransactionalError
}

export interface DispatchInfo {
  weight: bigint
  class: DispatchClass
  paysFee: Pays
}

export type MarketCreation = MarketCreation_Permissionless | MarketCreation_Advised

export interface MarketCreation_Permissionless {
  __kind: 'Permissionless'
}

export interface MarketCreation_Advised {
  __kind: 'Advised'
}

export type MarketType = MarketType_Categorical | MarketType_Scalar

export interface MarketType_Categorical {
  __kind: 'Categorical'
  value: number
}

export interface MarketType_Scalar {
  __kind: 'Scalar'
  value: RangeInclusive
}

export type MarketPeriod = MarketPeriod_Block | MarketPeriod_Timestamp

export interface MarketPeriod_Block {
  __kind: 'Block'
  value: Range
}

export interface MarketPeriod_Timestamp {
  __kind: 'Timestamp'
  value: Range
}

export type ScoringRule = ScoringRule_CPMM | ScoringRule_RikiddoSigmoidFeeMarketEma

export interface ScoringRule_CPMM {
  __kind: 'CPMM'
}

export interface ScoringRule_RikiddoSigmoidFeeMarketEma {
  __kind: 'RikiddoSigmoidFeeMarketEma'
}

export type MarketStatus = MarketStatus_Proposed | MarketStatus_Active | MarketStatus_Suspended | MarketStatus_Closed | MarketStatus_CollectingSubsidy | MarketStatus_InsufficientSubsidy | MarketStatus_Reported | MarketStatus_Disputed | MarketStatus_Resolved

export interface MarketStatus_Proposed {
  __kind: 'Proposed'
}

export interface MarketStatus_Active {
  __kind: 'Active'
}

export interface MarketStatus_Suspended {
  __kind: 'Suspended'
}

export interface MarketStatus_Closed {
  __kind: 'Closed'
}

export interface MarketStatus_CollectingSubsidy {
  __kind: 'CollectingSubsidy'
}

export interface MarketStatus_InsufficientSubsidy {
  __kind: 'InsufficientSubsidy'
}

export interface MarketStatus_Reported {
  __kind: 'Reported'
}

export interface MarketStatus_Disputed {
  __kind: 'Disputed'
}

export interface MarketStatus_Resolved {
  __kind: 'Resolved'
}

export interface Report {
  at: bigint
  by: Uint8Array
  outcome: OutcomeReport
}

export type OutcomeReport = OutcomeReport_Categorical | OutcomeReport_Scalar

export interface OutcomeReport_Categorical {
  __kind: 'Categorical'
  value: number
}

export interface OutcomeReport_Scalar {
  __kind: 'Scalar'
  value: bigint
}

export type MarketDisputeMechanism = MarketDisputeMechanism_Authorized | MarketDisputeMechanism_Court | MarketDisputeMechanism_SimpleDisputes

export interface MarketDisputeMechanism_Authorized {
  __kind: 'Authorized'
  value: Uint8Array
}

export interface MarketDisputeMechanism_Court {
  __kind: 'Court'
}

export interface MarketDisputeMechanism_SimpleDisputes {
  __kind: 'SimpleDisputes'
}

export type Asset = Asset_CategoricalOutcome | Asset_ScalarOutcome | Asset_CombinatorialOutcome | Asset_PoolShare | Asset_Ztg

export interface Asset_CategoricalOutcome {
  __kind: 'CategoricalOutcome'
  value: [bigint, number]
}

export interface Asset_ScalarOutcome {
  __kind: 'ScalarOutcome'
  value: [bigint, ScalarPosition]
}

export interface Asset_CombinatorialOutcome {
  __kind: 'CombinatorialOutcome'
}

export interface Asset_PoolShare {
  __kind: 'PoolShare'
  value: bigint
}

export interface Asset_Ztg {
  __kind: 'Ztg'
}

export type PoolStatus = PoolStatus_Active | PoolStatus_CollectingSubsidy | PoolStatus_Stale

export interface PoolStatus_Active {
  __kind: 'Active'
}

export interface PoolStatus_CollectingSubsidy {
  __kind: 'CollectingSubsidy'
}

export interface PoolStatus_Stale {
  __kind: 'Stale'
}

export interface ModuleError {
  index: number
  error: Uint8Array
}

export type TokenError = TokenError_NoFunds | TokenError_WouldDie | TokenError_BelowMinimum | TokenError_CannotCreate | TokenError_UnknownAsset | TokenError_Frozen | TokenError_Unsupported

export interface TokenError_NoFunds {
  __kind: 'NoFunds'
}

export interface TokenError_WouldDie {
  __kind: 'WouldDie'
}

export interface TokenError_BelowMinimum {
  __kind: 'BelowMinimum'
}

export interface TokenError_CannotCreate {
  __kind: 'CannotCreate'
}

export interface TokenError_UnknownAsset {
  __kind: 'UnknownAsset'
}

export interface TokenError_Frozen {
  __kind: 'Frozen'
}

export interface TokenError_Unsupported {
  __kind: 'Unsupported'
}

export type ArithmeticError = ArithmeticError_Underflow | ArithmeticError_Overflow | ArithmeticError_DivisionByZero

export interface ArithmeticError_Underflow {
  __kind: 'Underflow'
}

export interface ArithmeticError_Overflow {
  __kind: 'Overflow'
}

export interface ArithmeticError_DivisionByZero {
  __kind: 'DivisionByZero'
}

export type TransactionalError = TransactionalError_LimitReached | TransactionalError_NoLayer

export interface TransactionalError_LimitReached {
  __kind: 'LimitReached'
}

export interface TransactionalError_NoLayer {
  __kind: 'NoLayer'
}

export type DispatchClass = DispatchClass_Normal | DispatchClass_Operational | DispatchClass_Mandatory

export interface DispatchClass_Normal {
  __kind: 'Normal'
}

export interface DispatchClass_Operational {
  __kind: 'Operational'
}

export interface DispatchClass_Mandatory {
  __kind: 'Mandatory'
}

export type Pays = Pays_Yes | Pays_No

export interface Pays_Yes {
  __kind: 'Yes'
}

export interface Pays_No {
  __kind: 'No'
}

export interface RangeInclusive {
  start: bigint
  end: bigint
}

export interface Range {
  start: bigint
  end: bigint
}

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
  __kind: 'Long'
}

export interface ScalarPosition_Short {
  __kind: 'Short'
}
