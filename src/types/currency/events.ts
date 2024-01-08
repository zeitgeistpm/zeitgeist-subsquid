import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v23 from '../v23'
import * as v32 from '../v32'
import * as v34 from '../v34'

export const transferred =  {
    name: 'Currency.Transferred',
    /**
     *  Currency transfer success. \[currency_id, from, to, amount\]
     */
    v23: new EventType(
        'Currency.Transferred',
        sts.tuple([v23.Currency, v23.AccountId, v23.AccountId, v23.Balance])
    ),
    /**
     * Currency transfer success. \[currency_id, from, to, amount\]
     */
    v32: new EventType(
        'Currency.Transferred',
        sts.tuple([v32.Asset, v32.AccountId32, v32.AccountId32, sts.bigint()])
    ),
    /**
     * Currency transfer success.
     */
    v34: new EventType(
        'Currency.Transferred',
        sts.struct({
            currencyId: v34.Asset,
            from: v34.AccountId32,
            to: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const deposited =  {
    name: 'Currency.Deposited',
    /**
     *  Deposit success. \[currency_id, who, amount\]
     */
    v23: new EventType(
        'Currency.Deposited',
        sts.tuple([v23.Currency, v23.AccountId, v23.Balance])
    ),
    /**
     * Deposit success. \[currency_id, who, amount\]
     */
    v32: new EventType(
        'Currency.Deposited',
        sts.tuple([v32.Asset, v32.AccountId32, sts.bigint()])
    ),
    /**
     * Deposit success.
     */
    v34: new EventType(
        'Currency.Deposited',
        sts.struct({
            currencyId: v34.Asset,
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const withdrawn =  {
    name: 'Currency.Withdrawn',
    /**
     *  Withdraw success. \[currency_id, who, amount\]
     */
    v23: new EventType(
        'Currency.Withdrawn',
        sts.tuple([v23.Currency, v23.AccountId, v23.Balance])
    ),
    /**
     * Withdraw success. \[currency_id, who, amount\]
     */
    v32: new EventType(
        'Currency.Withdrawn',
        sts.tuple([v32.Asset, v32.AccountId32, sts.bigint()])
    ),
    /**
     * Withdraw success.
     */
    v34: new EventType(
        'Currency.Withdrawn',
        sts.struct({
            currencyId: v34.Asset,
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
