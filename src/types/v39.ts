import {sts, Result, Option, Bytes, BitSequence} from './support'

export const AccountId32 = sts.bytes()

export const Pool: sts.Type<Pool> = sts.struct(() => {
    return  {
        assets: sts.array(() => Asset),
        baseAsset: Asset,
        marketId: sts.bigint(),
        poolStatus: PoolStatus,
        scoringRule: ScoringRule,
        swapFee: sts.option(() => sts.bigint()),
        totalSubsidy: sts.option(() => sts.bigint()),
        totalWeight: sts.option(() => sts.bigint()),
        weights: sts.option(() => sts.array(() => sts.tuple(() => [Asset, sts.bigint()]))),
    }
})

export const ScoringRule: sts.Type<ScoringRule> = sts.closedEnum(() => {
    return  {
        CPMM: sts.unit(),
        RikiddoSigmoidFeeMarketEma: sts.unit(),
    }
})

export type ScoringRule = ScoringRule_CPMM | ScoringRule_RikiddoSigmoidFeeMarketEma

export interface ScoringRule_CPMM {
    __kind: 'CPMM'
}

export interface ScoringRule_RikiddoSigmoidFeeMarketEma {
    __kind: 'RikiddoSigmoidFeeMarketEma'
}

export const PoolStatus: sts.Type<PoolStatus> = sts.closedEnum(() => {
    return  {
        Active: sts.unit(),
        Clean: sts.unit(),
        Closed: sts.unit(),
        CollectingSubsidy: sts.unit(),
        Initialized: sts.unit(),
    }
})

export type PoolStatus = PoolStatus_Active | PoolStatus_Clean | PoolStatus_Closed | PoolStatus_CollectingSubsidy | PoolStatus_Initialized

export interface PoolStatus_Active {
    __kind: 'Active'
}

export interface PoolStatus_Clean {
    __kind: 'Clean'
}

export interface PoolStatus_Closed {
    __kind: 'Closed'
}

export interface PoolStatus_CollectingSubsidy {
    __kind: 'CollectingSubsidy'
}

export interface PoolStatus_Initialized {
    __kind: 'Initialized'
}

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

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
    __kind: 'Long'
}

export interface ScalarPosition_Short {
    __kind: 'Short'
}

export const SerdeWrapper = sts.bigint()

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

export type SerdeWrapper = bigint

export interface Pool {
    assets: Asset[]
    baseAsset: Asset
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

export interface CommonPoolEventParams {
    poolId: bigint
    who: AccountId32
}

export type AccountId32 = Bytes
