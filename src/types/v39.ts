import type {Result, Option} from './support'

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

export type PoolStatus = PoolStatus_Active | PoolStatus_CollectingSubsidy | PoolStatus_Closed | PoolStatus_Clean | PoolStatus_Initialized

export interface PoolStatus_Active {
    __kind: 'Active'
}

export interface PoolStatus_CollectingSubsidy {
    __kind: 'CollectingSubsidy'
}

export interface PoolStatus_Closed {
    __kind: 'Closed'
}

export interface PoolStatus_Clean {
    __kind: 'Clean'
}

export interface PoolStatus_Initialized {
    __kind: 'Initialized'
}

export type ScoringRule = ScoringRule_CPMM | ScoringRule_RikiddoSigmoidFeeMarketEma

export interface ScoringRule_CPMM {
    __kind: 'CPMM'
}

export interface ScoringRule_RikiddoSigmoidFeeMarketEma {
    __kind: 'RikiddoSigmoidFeeMarketEma'
}

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
    __kind: 'Long'
}

export interface ScalarPosition_Short {
    __kind: 'Short'
}
