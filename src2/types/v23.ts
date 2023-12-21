import {sts, Result, Option, Bytes, BitSequence} from './support'

export const BalanceOf = sts.bigint()

export const CurrencyId: sts.Type<CurrencyId> = sts.closedEnum(() => {
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

export type CurrencyId = CurrencyId_CategoricalOutcome | CurrencyId_CombinatorialOutcome | CurrencyId_PoolShare | CurrencyId_ScalarOutcome | CurrencyId_Ztg

export interface CurrencyId_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [MarketId, CategoryIndex]
}

export interface CurrencyId_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface CurrencyId_PoolShare {
    __kind: 'PoolShare'
    value: bigint
}

export interface CurrencyId_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [MarketId, ScalarPosition]
}

export interface CurrencyId_Ztg {
    __kind: 'Ztg'
}

export type CategoryIndex = number

export type MarketId = bigint

export const Currency: sts.Type<Currency> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [MarketId, CategoryIndex]),
        CombinatorialOutcome: sts.unit(),
        PoolShare: sts.bigint(),
        ScalarOutcome: sts.tuple(() => [MarketId, ScalarPosition]),
        Ztg: sts.unit(),
    }
})

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

export const DispatchError: sts.Type<DispatchError> = sts.closedEnum(() => {
    return  {
        Arithmetic: ArithmeticError,
        BadOrigin: sts.unit(),
        CannotLookup: sts.unit(),
        ConsumerRemaining: sts.unit(),
        Module: DispatchErrorModule,
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
        Overflow: sts.unit(),
        Underflow: sts.unit(),
        UnknownAsset: sts.unit(),
        WouldDie: sts.unit(),
    }
})

export type TokenError = TokenError_BelowMinimum | TokenError_CannotCreate | TokenError_Frozen | TokenError_NoFunds | TokenError_Overflow | TokenError_Underflow | TokenError_UnknownAsset | TokenError_WouldDie

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

export interface TokenError_Overflow {
    __kind: 'Overflow'
}

export interface TokenError_Underflow {
    __kind: 'Underflow'
}

export interface TokenError_UnknownAsset {
    __kind: 'UnknownAsset'
}

export interface TokenError_WouldDie {
    __kind: 'WouldDie'
}

export const DispatchErrorModule: sts.Type<DispatchErrorModule> = sts.struct(() => {
    return  {
        index: sts.number(),
        error: sts.number(),
    }
})

export interface DispatchErrorModule {
    index: number
    error: number
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
    value: DispatchErrorModule
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

export const DispatchInfo: sts.Type<DispatchInfo> = sts.struct(() => {
    return  {
        weight: Weight,
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

export const Weight = sts.bigint()

export interface DispatchInfo {
    weight: Weight
    class: DispatchClass
    paysFee: Pays
}

export type Weight = bigint
