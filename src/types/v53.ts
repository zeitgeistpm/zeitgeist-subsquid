import {sts, Result, Option, Bytes, BitSequence} from './support'

export interface Market {
    baseAsset: Asset
    creator: AccountId32
    creation: MarketCreation
    creatorFee: Perbill
    oracle: AccountId32
    metadata: Bytes
    marketType: MarketType
    period: MarketPeriod
    deadlines: Deadlines
    scoringRule: ScoringRule
    status: MarketStatus
    report?: (Report | undefined)
    resolvedOutcome?: (OutcomeReport | undefined)
    disputeMechanism?: (MarketDisputeMechanism | undefined)
    bonds: MarketBonds
    earlyClose?: (EarlyClose | undefined)
}

export interface EarlyClose {
    old: MarketPeriod
    new: MarketPeriod
    state: EarlyCloseState
}

export type EarlyCloseState = EarlyCloseState_Disputed | EarlyCloseState_Rejected | EarlyCloseState_ScheduledAsMarketCreator | EarlyCloseState_ScheduledAsOther

export interface EarlyCloseState_Disputed {
    __kind: 'Disputed'
}

export interface EarlyCloseState_Rejected {
    __kind: 'Rejected'
}

export interface EarlyCloseState_ScheduledAsMarketCreator {
    __kind: 'ScheduledAsMarketCreator'
}

export interface EarlyCloseState_ScheduledAsOther {
    __kind: 'ScheduledAsOther'
}

export interface MarketBonds {
    creation?: (Bond | undefined)
    oracle?: (Bond | undefined)
    outsider?: (Bond | undefined)
    dispute?: (Bond | undefined)
    closeRequest?: (Bond | undefined)
    closeDispute?: (Bond | undefined)
}

export interface Bond {
    who: AccountId32
    value: bigint
    isSettled: boolean
}

export type MarketDisputeMechanism = MarketDisputeMechanism_Authorized | MarketDisputeMechanism_Court | MarketDisputeMechanism_SimpleDisputes

export interface MarketDisputeMechanism_Authorized {
    __kind: 'Authorized'
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

export type MarketStatus = MarketStatus_Active | MarketStatus_Closed | MarketStatus_Disputed | MarketStatus_Proposed | MarketStatus_Reported | MarketStatus_Resolved

export interface MarketStatus_Active {
    __kind: 'Active'
}

export interface MarketStatus_Closed {
    __kind: 'Closed'
}

export interface MarketStatus_Disputed {
    __kind: 'Disputed'
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

export type ScoringRule = ScoringRule_Lmsr | ScoringRule_Orderbook | ScoringRule_Parimutuel

export interface ScoringRule_Lmsr {
    __kind: 'Lmsr'
}

export interface ScoringRule_Orderbook {
    __kind: 'Orderbook'
}

export interface ScoringRule_Parimutuel {
    __kind: 'Parimutuel'
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

export type Perbill = number

export type MarketCreation = MarketCreation_Advised | MarketCreation_Permissionless

export interface MarketCreation_Advised {
    __kind: 'Advised'
}

export interface MarketCreation_Permissionless {
    __kind: 'Permissionless'
}

export type AccountId32 = Bytes

export type Asset = Asset_CategoricalOutcome | Asset_CombinatorialOutcome | Asset_ForeignAsset | Asset_ParimutuelShare | Asset_PoolShare | Asset_ScalarOutcome | Asset_Ztg

export interface Asset_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [bigint, number]
}

export interface Asset_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface Asset_ForeignAsset {
    __kind: 'ForeignAsset'
    value: number
}

export interface Asset_ParimutuelShare {
    __kind: 'ParimutuelShare'
    value: [bigint, number]
}

export interface Asset_PoolShare {
    __kind: 'PoolShare'
    value: SerdeWrapper
}

export interface Asset_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [bigint, ScalarPosition]
}

export interface Asset_Ztg {
    __kind: 'Ztg'
}

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
    __kind: 'Long'
}

export interface ScalarPosition_Short {
    __kind: 'Short'
}

export type SerdeWrapper = bigint

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

export const Market: sts.Type<Market> = sts.struct(() => {
    return  {
        baseAsset: Asset,
        creator: AccountId32,
        creation: MarketCreation,
        creatorFee: Perbill,
        oracle: AccountId32,
        metadata: sts.bytes(),
        marketType: MarketType,
        period: MarketPeriod,
        deadlines: Deadlines,
        scoringRule: ScoringRule,
        status: MarketStatus,
        report: sts.option(() => Report),
        resolvedOutcome: sts.option(() => OutcomeReport),
        disputeMechanism: sts.option(() => MarketDisputeMechanism),
        bonds: MarketBonds,
        earlyClose: sts.option(() => EarlyClose),
    }
})

export const EarlyClose: sts.Type<EarlyClose> = sts.struct(() => {
    return  {
        old: MarketPeriod,
        new: MarketPeriod,
        state: EarlyCloseState,
    }
})

export const EarlyCloseState: sts.Type<EarlyCloseState> = sts.closedEnum(() => {
    return  {
        Disputed: sts.unit(),
        Rejected: sts.unit(),
        ScheduledAsMarketCreator: sts.unit(),
        ScheduledAsOther: sts.unit(),
    }
})

export const MarketBonds: sts.Type<MarketBonds> = sts.struct(() => {
    return  {
        creation: sts.option(() => Bond),
        oracle: sts.option(() => Bond),
        outsider: sts.option(() => Bond),
        dispute: sts.option(() => Bond),
        closeRequest: sts.option(() => Bond),
        closeDispute: sts.option(() => Bond),
    }
})

export const Bond: sts.Type<Bond> = sts.struct(() => {
    return  {
        who: AccountId32,
        value: sts.bigint(),
        isSettled: sts.boolean(),
    }
})

export const MarketDisputeMechanism: sts.Type<MarketDisputeMechanism> = sts.closedEnum(() => {
    return  {
        Authorized: sts.unit(),
        Court: sts.unit(),
        SimpleDisputes: sts.unit(),
    }
})

export const ScoringRule: sts.Type<ScoringRule> = sts.closedEnum(() => {
    return  {
        Lmsr: sts.unit(),
        Orderbook: sts.unit(),
        Parimutuel: sts.unit(),
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

export const Perbill = sts.number()

export const MarketCreation: sts.Type<MarketCreation> = sts.closedEnum(() => {
    return  {
        Advised: sts.unit(),
        Permissionless: sts.unit(),
    }
})

export const Asset: sts.Type<Asset> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [sts.bigint(), sts.number()]),
        CombinatorialOutcome: sts.unit(),
        ForeignAsset: sts.number(),
        ParimutuelShare: sts.tuple(() => [sts.bigint(), sts.number()]),
        PoolShare: SerdeWrapper,
        ScalarOutcome: sts.tuple(() => [sts.bigint(), ScalarPosition]),
        Ztg: sts.unit(),
    }
})

export const ScalarPosition: sts.Type<ScalarPosition> = sts.closedEnum(() => {
    return  {
        Long: sts.unit(),
        Short: sts.unit(),
    }
})

export const SerdeWrapper = sts.bigint()

export const MarketStatus: sts.Type<MarketStatus> = sts.closedEnum(() => {
    return  {
        Active: sts.unit(),
        Closed: sts.unit(),
        Disputed: sts.unit(),
        Proposed: sts.unit(),
        Reported: sts.unit(),
        Resolved: sts.unit(),
    }
})

export const AccountId32 = sts.bytes()

export const Pool: sts.Type<Pool> = sts.struct(() => {
    return  {
        assets: sts.array(() => Asset),
        status: PoolStatus,
        swapFee: sts.bigint(),
        totalWeight: sts.bigint(),
        weights: sts.array(() => sts.tuple(() => [Asset, sts.bigint()])),
    }
})

export const PoolStatus: sts.Type<PoolStatus> = sts.closedEnum(() => {
    return  {
        Closed: sts.unit(),
        Open: sts.unit(),
    }
})

export type PoolStatus = PoolStatus_Closed | PoolStatus_Open

export interface PoolStatus_Closed {
    __kind: 'Closed'
}

export interface PoolStatus_Open {
    __kind: 'Open'
}

export interface Pool {
    assets: Asset[]
    status: PoolStatus
    swapFee: bigint
    totalWeight: bigint
    weights: [Asset, bigint][]
}

export const CommonPoolEventParams: sts.Type<CommonPoolEventParams> = sts.struct(() => {
    return  {
        poolId: sts.bigint(),
        who: AccountId32,
    }
})

export interface CommonPoolEventParams {
    poolId: bigint
    who: AccountId32
}
