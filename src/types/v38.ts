import type {Result} from './support'

export type AccountId32 = Uint8Array

export interface Market {
  creator: AccountId32
  creation: MarketCreation
  creatorFee: number
  oracle: AccountId32
  metadata: Uint8Array
  marketType: MarketType
  period: MarketPeriod
  scoringRule: ScoringRule
  status: MarketStatus
  report: (Report | undefined)
  resolvedOutcome: (OutcomeReport | undefined)
  disputeMechanism: MarketDisputeMechanism
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
  value: Range_93
}

export interface MarketPeriod_Timestamp {
  __kind: 'Timestamp'
  value: Range_93
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
  by: AccountId32
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
  value: AccountId32
}

export interface MarketDisputeMechanism_Court {
  __kind: 'Court'
}

export interface MarketDisputeMechanism_SimpleDisputes {
  __kind: 'SimpleDisputes'
}

export interface RangeInclusive {
  start: bigint
  end: bigint
}

export interface Range_93 {
  start: bigint
  end: bigint
}
