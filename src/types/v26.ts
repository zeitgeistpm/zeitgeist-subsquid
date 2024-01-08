import {sts, Result, Option, Bytes, BitSequence} from './support'

export const SwapEvent: sts.Type<SwapEvent> = sts.struct(() => {
    return  {
        assetAmountIn: Balance,
        assetAmountOut: Balance,
        assetBound: Balance,
        assetIn: Asset,
        assetOut: Asset,
        cpep: CommonPoolEventParams,
        maxPrice: Balance,
    }
})

export const CommonPoolEventParams: sts.Type<CommonPoolEventParams> = sts.struct(() => {
    return  {
        poolId: sts.bigint(),
        who: AccountId,
    }
})

export const AccountId = sts.bytes()

export interface CommonPoolEventParams {
    poolId: bigint
    who: AccountId
}

export type AccountId = Bytes

export const Asset: sts.Type<Asset> = sts.closedEnum(() => {
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

export type Asset = Asset_CategoricalOutcome | Asset_CombinatorialOutcome | Asset_PoolShare | Asset_ScalarOutcome | Asset_Ztg

export interface Asset_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [MarketId, CategoryIndex]
}

export interface Asset_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface Asset_PoolShare {
    __kind: 'PoolShare'
    value: bigint
}

export interface Asset_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [MarketId, ScalarPosition]
}

export interface Asset_Ztg {
    __kind: 'Ztg'
}

export type CategoryIndex = number

export type MarketId = bigint

export const Balance = sts.bigint()

export interface SwapEvent {
    assetAmountIn: Balance
    assetAmountOut: Balance
    assetBound: Balance
    assetIn: Asset
    assetOut: Asset
    cpep: CommonPoolEventParams
    maxPrice: Balance
}

export type Balance = bigint

export const PoolAssetEvent: sts.Type<PoolAssetEvent> = sts.struct(() => {
    return  {
        asset: Asset,
        bound: Balance,
        cpep: CommonPoolEventParams,
        transferred: Balance,
    }
})

export interface PoolAssetEvent {
    asset: Asset
    bound: Balance
    cpep: CommonPoolEventParams
    transferred: Balance
}

export const PoolAssetsEvent: sts.Type<PoolAssetsEvent> = sts.struct(() => {
    return  {
        assets: sts.array(() => Asset),
        bounds: sts.array(() => Balance),
        cpep: CommonPoolEventParams,
        transferred: sts.array(() => Balance),
    }
})

export interface PoolAssetsEvent {
    assets: Asset[]
    bounds: Balance[]
    cpep: CommonPoolEventParams
    transferred: Balance[]
}
