import type {Result} from './support'

export interface PoolAssetsEvent {
  assets: Asset[]
  bounds: bigint[]
  cpep: CommonPoolEventParams
  transferred: bigint[]
}

export interface PoolAssetEvent {
  asset: Asset
  bound: bigint
  cpep: CommonPoolEventParams
  transferred: bigint
}

export interface SwapEvent {
  assetAmountIn: bigint
  assetAmountOut: bigint
  assetBound: bigint
  assetIn: Asset
  assetOut: Asset
  cpep: CommonPoolEventParams
  maxPrice: bigint
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

export interface CommonPoolEventParams {
  poolId: bigint
  who: Uint8Array
}

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
  __kind: 'Long'
}

export interface ScalarPosition_Short {
  __kind: 'Short'
}
