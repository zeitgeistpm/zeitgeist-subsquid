import {sts, Result, Option, Bytes, BitSequence} from './support'

export interface Market {
    creator: AccountId32
    creation: MarketCreation
    creatorFee: number
    oracle: AccountId32
    metadata: Bytes
    marketType: MarketType
    period: MarketPeriod
    scoringRule: ScoringRule
    status: MarketStatus
    report?: (Report | undefined)
    resolvedOutcome?: (OutcomeReport | undefined)
    mdm: MarketDisputeMechanism
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
        scoringRule: ScoringRule,
        status: MarketStatus,
        report: sts.option(() => Report),
        resolvedOutcome: sts.option(() => OutcomeReport),
        mdm: MarketDisputeMechanism,
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

export const SwapEvent: sts.Type<SwapEvent> = sts.struct(() => {
    return  {
        assetAmountIn: sts.bigint(),
        assetAmountOut: sts.bigint(),
        assetBound: sts.bigint(),
        assetIn: Asset,
        assetOut: Asset,
        cpep: CommonPoolEventParams,
        maxPrice: sts.bigint(),
    }
})

export interface SwapEvent {
    assetAmountIn: bigint
    assetAmountOut: bigint
    assetBound: bigint
    assetIn: Asset
    assetOut: Asset
    cpep: CommonPoolEventParams
    maxPrice: bigint
}

export interface CommonPoolEventParams {
    poolId: bigint
    who: AccountId32
}

export type Asset = Asset_CategoricalOutcome | Asset_CombinatorialOutcome | Asset_PoolShare | Asset_ScalarOutcome | Asset_Ztg

export interface Asset_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [bigint, number]
}

export interface Asset_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
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

export const PoolAssetEvent: sts.Type<PoolAssetEvent> = sts.struct(() => {
    return  {
        asset: Asset,
        bound: sts.bigint(),
        cpep: CommonPoolEventParams,
        transferred: sts.bigint(),
    }
})

export interface PoolAssetEvent {
    asset: Asset
    bound: bigint
    cpep: CommonPoolEventParams
    transferred: bigint
}

export const PoolAssetsEvent: sts.Type<PoolAssetsEvent> = sts.struct(() => {
    return  {
        assets: sts.array(() => Asset),
        bounds: sts.array(() => sts.bigint()),
        cpep: CommonPoolEventParams,
        transferred: sts.array(() => sts.bigint()),
    }
})

export interface PoolAssetsEvent {
    assets: Asset[]
    bounds: bigint[]
    cpep: CommonPoolEventParams
    transferred: bigint[]
}

export const Pool: sts.Type<Pool> = sts.struct(() => {
    return  {
        assets: sts.array(() => Asset),
        baseAsset: sts.option(() => Asset),
        marketId: sts.bigint(),
        poolStatus: PoolStatus,
        scoringRule: ScoringRule,
        swapFee: sts.option(() => sts.bigint()),
        totalSubsidy: sts.option(() => sts.bigint()),
        totalWeight: sts.option(() => sts.bigint()),
        weights: sts.option(() => sts.array(() => sts.tuple(() => [Asset, sts.bigint()]))),
    }
})

export const PoolStatus: sts.Type<PoolStatus> = sts.closedEnum(() => {
    return  {
        Active: sts.unit(),
        CollectingSubsidy: sts.unit(),
        Stale: sts.unit(),
    }
})

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

export interface Pool {
    assets: Asset[]
    baseAsset?: (Asset | undefined)
    marketId: bigint
    poolStatus: PoolStatus
    scoringRule: ScoringRule
    swapFee?: (bigint | undefined)
    totalSubsidy?: (bigint | undefined)
    totalWeight?: (bigint | undefined)
    weights?: ([Asset, bigint][] | undefined)
}

export const CommonPoolEventParams: sts.Type<CommonPoolEventParams> = sts.struct(() => {
    return  {
        poolId: sts.bigint(),
        who: AccountId32,
    }
})

export const AccountId32 = sts.bytes()

export const Asset: sts.Type<Asset> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [sts.bigint(), sts.number()]),
        CombinatorialOutcome: sts.unit(),
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

export const DispatchInfo: sts.Type<DispatchInfo> = sts.struct(() => {
    return  {
        weight: sts.bigint(),
        class: DispatchClass,
        paysFee: Pays,
    }
})

export const Pays: sts.Type<Pays> = sts.closedEnum(() => {
    return  {
        No: sts.unit(),
        Yes: sts.unit(),
    }
})

export type Pays = Pays_No | Pays_Yes

export interface Pays_No {
    __kind: 'No'
}

export interface Pays_Yes {
    __kind: 'Yes'
}

export const DispatchClass: sts.Type<DispatchClass> = sts.closedEnum(() => {
    return  {
        Mandatory: sts.unit(),
        Normal: sts.unit(),
        Operational: sts.unit(),
    }
})

export type DispatchClass = DispatchClass_Mandatory | DispatchClass_Normal | DispatchClass_Operational

export interface DispatchClass_Mandatory {
    __kind: 'Mandatory'
}

export interface DispatchClass_Normal {
    __kind: 'Normal'
}

export interface DispatchClass_Operational {
    __kind: 'Operational'
}

export interface DispatchInfo {
    weight: bigint
    class: DispatchClass
    paysFee: Pays
}

export const DispatchError: sts.Type<DispatchError> = sts.closedEnum(() => {
    return  {
        Arithmetic: ArithmeticError,
        BadOrigin: sts.unit(),
        CannotLookup: sts.unit(),
        ConsumerRemaining: sts.unit(),
        Module: sts.enumStruct({
            index: sts.number(),
            error: sts.number(),
        }),
        NoProviders: sts.unit(),
        Other: sts.unit(),
        Token: TokenError,
    }
})

export const TokenError: sts.Type<TokenError> = sts.closedEnum(() => {
    return  {
        BelowMinimum: sts.unit(),
        CannotCreate: sts.unit(),
        Frozen: sts.unit(),
        NoFunds: sts.unit(),
        UnknownAsset: sts.unit(),
        Unsupported: sts.unit(),
        WouldDie: sts.unit(),
    }
})

export type TokenError = TokenError_BelowMinimum | TokenError_CannotCreate | TokenError_Frozen | TokenError_NoFunds | TokenError_UnknownAsset | TokenError_Unsupported | TokenError_WouldDie

export interface TokenError_BelowMinimum {
    __kind: 'BelowMinimum'
}

export interface TokenError_CannotCreate {
    __kind: 'CannotCreate'
}

export interface TokenError_Frozen {
    __kind: 'Frozen'
}

export interface TokenError_NoFunds {
    __kind: 'NoFunds'
}

export interface TokenError_UnknownAsset {
    __kind: 'UnknownAsset'
}

export interface TokenError_Unsupported {
    __kind: 'Unsupported'
}

export interface TokenError_WouldDie {
    __kind: 'WouldDie'
}

export const ArithmeticError: sts.Type<ArithmeticError> = sts.closedEnum(() => {
    return  {
        DivisionByZero: sts.unit(),
        Overflow: sts.unit(),
        Underflow: sts.unit(),
    }
})

export type ArithmeticError = ArithmeticError_DivisionByZero | ArithmeticError_Overflow | ArithmeticError_Underflow

export interface ArithmeticError_DivisionByZero {
    __kind: 'DivisionByZero'
}

export interface ArithmeticError_Overflow {
    __kind: 'Overflow'
}

export interface ArithmeticError_Underflow {
    __kind: 'Underflow'
}

export type DispatchError = DispatchError_Arithmetic | DispatchError_BadOrigin | DispatchError_CannotLookup | DispatchError_ConsumerRemaining | DispatchError_Module | DispatchError_NoProviders | DispatchError_Other | DispatchError_Token

export interface DispatchError_Arithmetic {
    __kind: 'Arithmetic'
    value: ArithmeticError
}

export interface DispatchError_BadOrigin {
    __kind: 'BadOrigin'
}

export interface DispatchError_CannotLookup {
    __kind: 'CannotLookup'
}

export interface DispatchError_ConsumerRemaining {
    __kind: 'ConsumerRemaining'
}

export interface DispatchError_Module {
    __kind: 'Module'
    index: number
    error: number
}

export interface DispatchError_NoProviders {
    __kind: 'NoProviders'
}

export interface DispatchError_Other {
    __kind: 'Other'
}

export interface DispatchError_Token {
    __kind: 'Token'
    value: TokenError
}
