import {sts, Result, Option, Bytes, BitSequence} from './support'

export interface Market {
    creator: AccountId32
    creation: MarketCreation
    creatorFee: number
    oracle: AccountId32
    metadata: Bytes
    marketType: MarketType
    period: MarketPeriod
    deadlines: Deadlines
    scoringRule: ScoringRule
    status: MarketStatus
    report?: (Report | undefined)
    resolvedOutcome?: (OutcomeReport | undefined)
    disputeMechanism: MarketDisputeMechanism
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

export type OutcomeReport = OutcomeReport_Categorical | OutcomeReport_Scalar

export interface OutcomeReport_Categorical {
    __kind: 'Categorical'
    value: number
}

export interface OutcomeReport_Scalar {
    __kind: 'Scalar'
    value: bigint
}

export interface Report {
    at: bigint
    by: AccountId32
    outcome: OutcomeReport
}

export type MarketStatus = MarketStatus_Active | MarketStatus_Closed | MarketStatus_CollectingSubsidy | MarketStatus_Disputed | MarketStatus_InsufficientSubsidy | MarketStatus_Proposed | MarketStatus_Reported | MarketStatus_Resolved | MarketStatus_Suspended

export interface MarketStatus_Active {
    __kind: 'Active'
}

export interface MarketStatus_Closed {
    __kind: 'Closed'
}

export interface MarketStatus_CollectingSubsidy {
    __kind: 'CollectingSubsidy'
}

export interface MarketStatus_Disputed {
    __kind: 'Disputed'
}

export interface MarketStatus_InsufficientSubsidy {
    __kind: 'InsufficientSubsidy'
}

export interface MarketStatus_Proposed {
    __kind: 'Proposed'
}

export interface MarketStatus_Reported {
    __kind: 'Reported'
}

export interface MarketStatus_Resolved {
    __kind: 'Resolved'
}

export interface MarketStatus_Suspended {
    __kind: 'Suspended'
}

export type ScoringRule = ScoringRule_CPMM | ScoringRule_RikiddoSigmoidFeeMarketEma

export interface ScoringRule_CPMM {
    __kind: 'CPMM'
}

export interface ScoringRule_RikiddoSigmoidFeeMarketEma {
    __kind: 'RikiddoSigmoidFeeMarketEma'
}

export interface Deadlines {
    gracePeriod: bigint
    oracleDuration: bigint
    disputeDuration: bigint
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

export interface Range {
    start: bigint
    end: bigint
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

export interface RangeInclusive {
    start: bigint
    end: bigint
}

export type MarketCreation = MarketCreation_Advised | MarketCreation_Permissionless

export interface MarketCreation_Advised {
    __kind: 'Advised'
}

export interface MarketCreation_Permissionless {
    __kind: 'Permissionless'
}

export type AccountId32 = Bytes

export const Market: sts.Type<Market> = sts.struct(() => {
    return  {
        creator: AccountId32,
        creation: MarketCreation,
        creatorFee: sts.number(),
        oracle: AccountId32,
        metadata: sts.bytes(),
        marketType: MarketType,
        period: MarketPeriod,
        deadlines: Deadlines,
        scoringRule: ScoringRule,
        status: MarketStatus,
        report: sts.option(() => Report),
        resolvedOutcome: sts.option(() => OutcomeReport),
        disputeMechanism: MarketDisputeMechanism,
    }
})

export const MarketDisputeMechanism: sts.Type<MarketDisputeMechanism> = sts.closedEnum(() => {
    return  {
        Authorized: AccountId32,
        Court: sts.unit(),
        SimpleDisputes: sts.unit(),
    }
})

export const OutcomeReport: sts.Type<OutcomeReport> = sts.closedEnum(() => {
    return  {
        Categorical: sts.number(),
        Scalar: sts.bigint(),
    }
})

export const Report: sts.Type<Report> = sts.struct(() => {
    return  {
        at: sts.bigint(),
        by: AccountId32,
        outcome: OutcomeReport,
    }
})

export const MarketStatus: sts.Type<MarketStatus> = sts.closedEnum(() => {
    return  {
        Active: sts.unit(),
        Closed: sts.unit(),
        CollectingSubsidy: sts.unit(),
        Disputed: sts.unit(),
        InsufficientSubsidy: sts.unit(),
        Proposed: sts.unit(),
        Reported: sts.unit(),
        Resolved: sts.unit(),
        Suspended: sts.unit(),
    }
})

export const ScoringRule: sts.Type<ScoringRule> = sts.closedEnum(() => {
    return  {
        CPMM: sts.unit(),
        RikiddoSigmoidFeeMarketEma: sts.unit(),
    }
})

export const Deadlines: sts.Type<Deadlines> = sts.struct(() => {
    return  {
        gracePeriod: sts.bigint(),
        oracleDuration: sts.bigint(),
        disputeDuration: sts.bigint(),
    }
})

export const MarketPeriod: sts.Type<MarketPeriod> = sts.closedEnum(() => {
    return  {
        Block: Range,
        Timestamp: Range,
    }
})

export const Range: sts.Type<Range> = sts.struct(() => {
    return  {
        start: sts.bigint(),
        end: sts.bigint(),
    }
})

export const MarketType: sts.Type<MarketType> = sts.closedEnum(() => {
    return  {
        Categorical: sts.number(),
        Scalar: RangeInclusive,
    }
})

export const RangeInclusive: sts.Type<RangeInclusive> = sts.struct(() => {
    return  {
        start: sts.bigint(),
        end: sts.bigint(),
    }
})

export const MarketCreation: sts.Type<MarketCreation> = sts.closedEnum(() => {
    return  {
        Advised: sts.unit(),
        Permissionless: sts.unit(),
    }
})

export const AccountId32 = sts.bytes()
