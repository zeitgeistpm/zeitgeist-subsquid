import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v26 from '../v26'
import * as v32 from '../v32'
import * as v34 from '../v34'
import * as v36 from '../v36'
import * as v41 from '../v41'
import * as v51 from '../v51'
import * as v54 from '../v54'
import * as v56 from '../v56'
import * as v60 from '../v60'

export const transfer =  {
    name: 'Tokens.Transfer',
    /**
     *  Transfer succeeded. \[currency_id, from, to, value\]
     */
    v26: new EventType(
        'Tokens.Transfer',
        sts.tuple([v26.CurrencyId, v26.AccountId, v26.AccountId, v26.Balance])
    ),
    /**
     * Transfer succeeded. \[currency_id, from, to, value\]
     */
    v32: new EventType(
        'Tokens.Transfer',
        sts.tuple([v32.Asset, v32.AccountId32, v32.AccountId32, sts.bigint()])
    ),
    /**
     * Transfer succeeded.
     */
    v34: new EventType(
        'Tokens.Transfer',
        sts.struct({
            currencyId: v34.Asset,
            from: v34.AccountId32,
            to: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Transfer succeeded.
     */
    v41: new EventType(
        'Tokens.Transfer',
        sts.struct({
            currencyId: v41.Asset,
            from: v41.AccountId32,
            to: v41.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Transfer succeeded.
     */
    v51: new EventType(
        'Tokens.Transfer',
        sts.struct({
            currencyId: v51.Asset,
            from: v51.AccountId32,
            to: v51.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Transfer succeeded.
     */
    v54: new EventType(
        'Tokens.Transfer',
        sts.struct({
            currencyId: v54.CurrencyClass,
            from: v54.AccountId32,
            to: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Transfer succeeded.
     */
    v56: new EventType(
        'Tokens.Transfer',
        sts.struct({
            currencyId: v56.Asset,
            from: v56.AccountId32,
            to: v56.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Transfer succeeded.
     */
    v60: new EventType(
        'Tokens.Transfer',
        sts.struct({
            currencyId: v60.Asset,
            from: v60.AccountId32,
            to: v60.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const reserved =  {
    name: 'Tokens.Reserved',
    /**
     *  Some balance was reserved (moved from free to reserved).
     *  \[currency_id, who, value\]
     */
    v26: new EventType(
        'Tokens.Reserved',
        sts.tuple([v26.CurrencyId, v26.AccountId, v26.Balance])
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     * \[currency_id, who, value\]
     */
    v32: new EventType(
        'Tokens.Reserved',
        sts.tuple([v32.Asset, v32.AccountId32, sts.bigint()])
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v34: new EventType(
        'Tokens.Reserved',
        sts.struct({
            currencyId: v34.Asset,
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v41: new EventType(
        'Tokens.Reserved',
        sts.struct({
            currencyId: v41.Asset,
            who: v41.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v51: new EventType(
        'Tokens.Reserved',
        sts.struct({
            currencyId: v51.Asset,
            who: v51.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v54: new EventType(
        'Tokens.Reserved',
        sts.struct({
            currencyId: v54.CurrencyClass,
            who: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v56: new EventType(
        'Tokens.Reserved',
        sts.struct({
            currencyId: v56.Asset,
            who: v56.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v60: new EventType(
        'Tokens.Reserved',
        sts.struct({
            currencyId: v60.Asset,
            who: v60.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const unreserved =  {
    name: 'Tokens.Unreserved',
    /**
     *  Some balance was unreserved (moved from reserved to free).
     *  \[currency_id, who, value\]
     */
    v26: new EventType(
        'Tokens.Unreserved',
        sts.tuple([v26.CurrencyId, v26.AccountId, v26.Balance])
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     * \[currency_id, who, value\]
     */
    v32: new EventType(
        'Tokens.Unreserved',
        sts.tuple([v32.Asset, v32.AccountId32, sts.bigint()])
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v34: new EventType(
        'Tokens.Unreserved',
        sts.struct({
            currencyId: v34.Asset,
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v41: new EventType(
        'Tokens.Unreserved',
        sts.struct({
            currencyId: v41.Asset,
            who: v41.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v51: new EventType(
        'Tokens.Unreserved',
        sts.struct({
            currencyId: v51.Asset,
            who: v51.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v54: new EventType(
        'Tokens.Unreserved',
        sts.struct({
            currencyId: v54.CurrencyClass,
            who: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v56: new EventType(
        'Tokens.Unreserved',
        sts.struct({
            currencyId: v56.Asset,
            who: v56.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v60: new EventType(
        'Tokens.Unreserved',
        sts.struct({
            currencyId: v60.Asset,
            who: v60.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const balanceSet =  {
    name: 'Tokens.BalanceSet',
    /**
     *  A balance was set by root. \[who, free, reserved\]
     */
    v26: new EventType(
        'Tokens.BalanceSet',
        sts.tuple([v26.CurrencyId, v26.AccountId, v26.Balance, v26.Balance])
    ),
    /**
     * A balance was set by root. \[who, free, reserved\]
     */
    v32: new EventType(
        'Tokens.BalanceSet',
        sts.tuple([v32.Asset, v32.AccountId32, sts.bigint(), sts.bigint()])
    ),
    /**
     * A balance was set by root.
     */
    v34: new EventType(
        'Tokens.BalanceSet',
        sts.struct({
            currencyId: v34.Asset,
            who: v34.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
    /**
     * A balance was set by root.
     */
    v41: new EventType(
        'Tokens.BalanceSet',
        sts.struct({
            currencyId: v41.Asset,
            who: v41.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
    /**
     * A balance was set by root.
     */
    v51: new EventType(
        'Tokens.BalanceSet',
        sts.struct({
            currencyId: v51.Asset,
            who: v51.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
    /**
     * A balance was set by root.
     */
    v54: new EventType(
        'Tokens.BalanceSet',
        sts.struct({
            currencyId: v54.CurrencyClass,
            who: v54.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
    /**
     * A balance was set by root.
     */
    v56: new EventType(
        'Tokens.BalanceSet',
        sts.struct({
            currencyId: v56.Asset,
            who: v56.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
    /**
     * A balance was set by root.
     */
    v60: new EventType(
        'Tokens.BalanceSet',
        sts.struct({
            currencyId: v60.Asset,
            who: v60.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
}

export const withdrawn =  {
    name: 'Tokens.Withdrawn',
    /**
     * Some balances were withdrawn (e.g. pay for transaction fee)
     */
    v36: new EventType(
        'Tokens.Withdrawn',
        sts.struct({
            currencyId: v36.Asset,
            who: v36.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balances were withdrawn (e.g. pay for transaction fee)
     */
    v41: new EventType(
        'Tokens.Withdrawn',
        sts.struct({
            currencyId: v41.Asset,
            who: v41.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balances were withdrawn (e.g. pay for transaction fee)
     */
    v51: new EventType(
        'Tokens.Withdrawn',
        sts.struct({
            currencyId: v51.Asset,
            who: v51.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balances were withdrawn (e.g. pay for transaction fee)
     */
    v54: new EventType(
        'Tokens.Withdrawn',
        sts.struct({
            currencyId: v54.CurrencyClass,
            who: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balances were withdrawn (e.g. pay for transaction fee)
     */
    v56: new EventType(
        'Tokens.Withdrawn',
        sts.struct({
            currencyId: v56.Asset,
            who: v56.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some balances were withdrawn (e.g. pay for transaction fee)
     */
    v60: new EventType(
        'Tokens.Withdrawn',
        sts.struct({
            currencyId: v60.Asset,
            who: v60.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const deposited =  {
    name: 'Tokens.Deposited',
    /**
     * Deposited some balance into an account
     */
    v36: new EventType(
        'Tokens.Deposited',
        sts.struct({
            currencyId: v36.Asset,
            who: v36.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Deposited some balance into an account
     */
    v41: new EventType(
        'Tokens.Deposited',
        sts.struct({
            currencyId: v41.Asset,
            who: v41.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Deposited some balance into an account
     */
    v51: new EventType(
        'Tokens.Deposited',
        sts.struct({
            currencyId: v51.Asset,
            who: v51.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Deposited some balance into an account
     */
    v54: new EventType(
        'Tokens.Deposited',
        sts.struct({
            currencyId: v54.CurrencyClass,
            who: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Deposited some balance into an account
     */
    v56: new EventType(
        'Tokens.Deposited',
        sts.struct({
            currencyId: v56.Asset,
            who: v56.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Deposited some balance into an account
     */
    v60: new EventType(
        'Tokens.Deposited',
        sts.struct({
            currencyId: v60.Asset,
            who: v60.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
