import {sts, Result, Option, Bytes, BitSequence} from './support'

export const AccountId32 = sts.bytes()

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

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
    __kind: 'Long'
}

export interface ScalarPosition_Short {
    __kind: 'Short'
}

export const SerdeWrapper = sts.bigint()

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

export type SerdeWrapper = bigint
