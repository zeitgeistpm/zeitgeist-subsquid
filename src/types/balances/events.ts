import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v26 from '../v26'
import * as v33 from '../v33'
import * as v34 from '../v34'
import * as v56 from '../v56'

export const dustLost =  {
    name: 'Balances.DustLost',
    /**
     *  An account was removed whose balance was non-zero but below ExistentialDeposit,
     *  resulting in an outright loss. \[account, balance\]
     */
    v26: new EventType(
        'Balances.DustLost',
        sts.tuple([v26.AccountId, v26.Balance])
    ),
    /**
     * An account was removed whose balance was non-zero but below ExistentialDeposit,
     * resulting in an outright loss.
     */
    v34: new EventType(
        'Balances.DustLost',
        sts.struct({
            account: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const transfer =  {
    name: 'Balances.Transfer',
    /**
     *  Transfer succeeded. \[from, to, value\]
     */
    v26: new EventType(
        'Balances.Transfer',
        sts.tuple([v26.AccountId, v26.AccountId, v26.Balance])
    ),
    /**
     * Transfer succeeded.
     */
    v34: new EventType(
        'Balances.Transfer',
        sts.struct({
            from: v34.AccountId32,
            to: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const balanceSet =  {
    name: 'Balances.BalanceSet',
    /**
     *  A balance was set by root. \[who, free, reserved\]
     */
    v26: new EventType(
        'Balances.BalanceSet',
        sts.tuple([v26.AccountId, v26.Balance, v26.Balance])
    ),
    /**
     * A balance was set by root.
     */
    v34: new EventType(
        'Balances.BalanceSet',
        sts.struct({
            who: v34.AccountId32,
            free: sts.bigint(),
            reserved: sts.bigint(),
        })
    ),
    /**
     * A balance was set by root.
     */
    v56: new EventType(
        'Balances.BalanceSet',
        sts.struct({
            who: v56.AccountId32,
            free: sts.bigint(),
        })
    ),
}

export const deposit =  {
    name: 'Balances.Deposit',
    /**
     *  Some amount was deposited (e.g. for transaction fees). \[who, deposit\]
     */
    v26: new EventType(
        'Balances.Deposit',
        sts.tuple([v26.AccountId, v26.Balance])
    ),
    /**
     * Some amount was deposited (e.g. for transaction fees).
     */
    v34: new EventType(
        'Balances.Deposit',
        sts.struct({
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const reserved =  {
    name: 'Balances.Reserved',
    /**
     *  Some balance was reserved (moved from free to reserved). \[who, value\]
     */
    v26: new EventType(
        'Balances.Reserved',
        sts.tuple([v26.AccountId, v26.Balance])
    ),
    /**
     * Some balance was reserved (moved from free to reserved).
     */
    v34: new EventType(
        'Balances.Reserved',
        sts.struct({
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const unreserved =  {
    name: 'Balances.Unreserved',
    /**
     *  Some balance was unreserved (moved from reserved to free). \[who, value\]
     */
    v26: new EventType(
        'Balances.Unreserved',
        sts.tuple([v26.AccountId, v26.Balance])
    ),
    /**
     * Some balance was unreserved (moved from reserved to free).
     */
    v34: new EventType(
        'Balances.Unreserved',
        sts.struct({
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const reserveRepatriated =  {
    name: 'Balances.ReserveRepatriated',
    /**
     *  Some balance was moved from the reserve of the first account to the second account.
     *  Final argument indicates the destination balance type.
     *  \[from, to, balance, destination_status\]
     */
    v26: new EventType(
        'Balances.ReserveRepatriated',
        sts.tuple([v26.AccountId, v26.AccountId, v26.Balance, v26.BalanceStatus])
    ),
    /**
     * Some balance was moved from the reserve of the first account to the second account.
     * Final argument indicates the destination balance type.
     */
    v34: new EventType(
        'Balances.ReserveRepatriated',
        sts.struct({
            from: v34.AccountId32,
            to: v34.AccountId32,
            amount: sts.bigint(),
            destinationStatus: v34.BalanceStatus,
        })
    ),
}

export const withdraw =  {
    name: 'Balances.Withdraw',
    /**
     * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
     */
    v33: new EventType(
        'Balances.Withdraw',
        sts.tuple([v33.AccountId32, sts.bigint()])
    ),
    /**
     * Some amount was withdrawn from the account (e.g. for transaction fees).
     */
    v34: new EventType(
        'Balances.Withdraw',
        sts.struct({
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const slashed =  {
    name: 'Balances.Slashed',
    /**
     * Some amount was removed from the account (e.g. for misbehavior). \[who,
     * amount_slashed\]
     */
    v33: new EventType(
        'Balances.Slashed',
        sts.tuple([v33.AccountId32, sts.bigint()])
    ),
    /**
     * Some amount was removed from the account (e.g. for misbehavior).
     */
    v34: new EventType(
        'Balances.Slashed',
        sts.struct({
            who: v34.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
