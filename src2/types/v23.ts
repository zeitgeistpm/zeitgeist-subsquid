import {sts, Result, Option, Bytes, BitSequence} from './support'

export const BalanceOf = sts.bigint()

export const Currency: sts.Type<Currency> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [MarketId, CategoryIndex]),
        CombinatorialOutcome: sts.unit(),
        PoolShare: sts.bigint(),
        ScalarOutcome: sts.tuple(() => [MarketId, ScalarPosition]),
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

export const CategoryIndex = sts.number()

export const MarketId = sts.bigint()

export type Currency = Currency_CategoricalOutcome | Currency_CombinatorialOutcome | Currency_PoolShare | Currency_ScalarOutcome | Currency_Ztg

export interface Currency_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [MarketId, CategoryIndex]
}

export interface Currency_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface Currency_PoolShare {
    __kind: 'PoolShare'
    value: bigint
}

export interface Currency_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [MarketId, ScalarPosition]
}

export interface Currency_Ztg {
    __kind: 'Ztg'
}

export type CategoryIndex = number

export type MarketId = bigint

export const BalanceStatus: sts.Type<BalanceStatus> = sts.closedEnum(() => {
    return  {
        Free: sts.unit(),
        Reserved: sts.unit(),
    }
})

export type BalanceStatus = BalanceStatus_Free | BalanceStatus_Reserved

export interface BalanceStatus_Free {
    __kind: 'Free'
}

export interface BalanceStatus_Reserved {
    __kind: 'Reserved'
}

export const Balance = sts.bigint()

export const AccountId = sts.bytes()
