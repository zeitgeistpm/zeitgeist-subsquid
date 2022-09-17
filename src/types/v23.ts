import type {Result} from './support'

export type Currency = Currency_CategoricalOutcome | Currency_ScalarOutcome | Currency_CombinatorialOutcome | Currency_PoolShare | Currency_Ztg

export interface Currency_CategoricalOutcome {
  __kind: 'CategoricalOutcome'
  value: [bigint, number]
}

export interface Currency_ScalarOutcome {
  __kind: 'ScalarOutcome'
  value: [bigint, ScalarPosition]
}

export interface Currency_CombinatorialOutcome {
  __kind: 'CombinatorialOutcome'
}

export interface Currency_PoolShare {
  __kind: 'PoolShare'
  value: bigint
}

export interface Currency_Ztg {
  __kind: 'Ztg'
}

export type DispatchError = DispatchError_Other | DispatchError_CannotLookup | DispatchError_BadOrigin | DispatchError_Module | DispatchError_ConsumerRemaining | DispatchError_NoProviders | DispatchError_Token | DispatchError_Arithmetic

export interface DispatchError_Other {
  __kind: 'Other'
  value: null
}

export interface DispatchError_CannotLookup {
  __kind: 'CannotLookup'
  value: null
}

export interface DispatchError_BadOrigin {
  __kind: 'BadOrigin'
  value: null
}

export interface DispatchError_Module {
  __kind: 'Module'
  value: DispatchErrorModule
}

export interface DispatchError_ConsumerRemaining {
  __kind: 'ConsumerRemaining'
  value: null
}

export interface DispatchError_NoProviders {
  __kind: 'NoProviders'
  value: null
}

export interface DispatchError_Token {
  __kind: 'Token'
  value: TokenError
}

export interface DispatchError_Arithmetic {
  __kind: 'Arithmetic'
  value: ArithmeticError
}

export interface DispatchInfo {
  weight: bigint
  class: DispatchClass
  paysFee: Pays
}

export type CurrencyId = CurrencyId_CategoricalOutcome | CurrencyId_ScalarOutcome | CurrencyId_CombinatorialOutcome | CurrencyId_PoolShare | CurrencyId_Ztg

export interface CurrencyId_CategoricalOutcome {
  __kind: 'CategoricalOutcome'
  value: [bigint, number]
}

export interface CurrencyId_ScalarOutcome {
  __kind: 'ScalarOutcome'
  value: [bigint, ScalarPosition]
}

export interface CurrencyId_CombinatorialOutcome {
  __kind: 'CombinatorialOutcome'
}

export interface CurrencyId_PoolShare {
  __kind: 'PoolShare'
  value: bigint
}

export interface CurrencyId_Ztg {
  __kind: 'Ztg'
}

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
  __kind: 'Long'
}

export interface ScalarPosition_Short {
  __kind: 'Short'
}

export interface DispatchErrorModule {
  index: number
  error: number
}

export type TokenError = TokenError_NoFunds | TokenError_WouldDie | TokenError_BelowMinimum | TokenError_CannotCreate | TokenError_UnknownAsset | TokenError_Frozen | TokenError_Underflow | TokenError_Overflow

export interface TokenError_NoFunds {
  __kind: 'NoFunds'
}

export interface TokenError_WouldDie {
  __kind: 'WouldDie'
}

export interface TokenError_BelowMinimum {
  __kind: 'BelowMinimum'
}

export interface TokenError_CannotCreate {
  __kind: 'CannotCreate'
}

export interface TokenError_UnknownAsset {
  __kind: 'UnknownAsset'
}

export interface TokenError_Frozen {
  __kind: 'Frozen'
}

export interface TokenError_Underflow {
  __kind: 'Underflow'
}

export interface TokenError_Overflow {
  __kind: 'Overflow'
}

export type ArithmeticError = ArithmeticError_Underflow | ArithmeticError_Overflow | ArithmeticError_DivisionByZero

export interface ArithmeticError_Underflow {
  __kind: 'Underflow'
}

export interface ArithmeticError_Overflow {
  __kind: 'Overflow'
}

export interface ArithmeticError_DivisionByZero {
  __kind: 'DivisionByZero'
}

export type DispatchClass = DispatchClass_Normal | DispatchClass_Operational | DispatchClass_Mandatory

export interface DispatchClass_Normal {
  __kind: 'Normal'
}

export interface DispatchClass_Operational {
  __kind: 'Operational'
}

export interface DispatchClass_Mandatory {
  __kind: 'Mandatory'
}

export type Pays = Pays_Yes | Pays_No

export interface Pays_Yes {
  __kind: 'Yes'
}

export interface Pays_No {
  __kind: 'No'
}
