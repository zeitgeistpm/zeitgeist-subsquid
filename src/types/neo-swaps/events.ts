import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v50 from '../v50'
import * as v51 from '../v51'

export const buyExecuted =  {
    name: 'NeoSwaps.BuyExecuted',
    /**
     * Informant bought a position.
     */
    v50: new EventType(
        'NeoSwaps.BuyExecuted',
        sts.struct({
            who: v50.AccountId32,
            marketId: sts.bigint(),
            assetOut: v50.Asset,
            amountIn: sts.bigint(),
            amountOut: sts.bigint(),
            swapFeeAmount: sts.bigint(),
            externalFeeAmount: sts.bigint(),
        })
    ),
    /**
     * Informant bought a position. `amount_in` is the amount of collateral paid by `who`,
     * including swap and external fees.
     */
    v51: new EventType(
        'NeoSwaps.BuyExecuted',
        sts.struct({
            who: v51.AccountId32,
            marketId: sts.bigint(),
            assetOut: v51.Asset,
            amountIn: sts.bigint(),
            amountOut: sts.bigint(),
            swapFeeAmount: sts.bigint(),
            externalFeeAmount: sts.bigint(),
        })
    ),
}

export const sellExecuted =  {
    name: 'NeoSwaps.SellExecuted',
    /**
     * Informant sold a position.
     */
    v50: new EventType(
        'NeoSwaps.SellExecuted',
        sts.struct({
            who: v50.AccountId32,
            marketId: sts.bigint(),
            assetIn: v50.Asset,
            amountIn: sts.bigint(),
            amountOut: sts.bigint(),
            swapFeeAmount: sts.bigint(),
            externalFeeAmount: sts.bigint(),
        })
    ),
    /**
     * Informant sold a position. `amount_out` is the amount of collateral received by `who`,
     * including swap and external fees.
     */
    v51: new EventType(
        'NeoSwaps.SellExecuted',
        sts.struct({
            who: v51.AccountId32,
            marketId: sts.bigint(),
            assetIn: v51.Asset,
            amountIn: sts.bigint(),
            amountOut: sts.bigint(),
            swapFeeAmount: sts.bigint(),
            externalFeeAmount: sts.bigint(),
        })
    ),
}

export const feesWithdrawn =  {
    name: 'NeoSwaps.FeesWithdrawn',
    /**
     * Liquidity provider withdrew fees.
     */
    v50: new EventType(
        'NeoSwaps.FeesWithdrawn',
        sts.struct({
            who: v50.AccountId32,
            marketId: sts.bigint(),
            amount: sts.bigint(),
        })
    ),
}

export const joinExecuted =  {
    name: 'NeoSwaps.JoinExecuted',
    /**
     * Liquidity provider joined the pool.
     */
    v50: new EventType(
        'NeoSwaps.JoinExecuted',
        sts.struct({
            who: v50.AccountId32,
            marketId: sts.bigint(),
            poolSharesAmount: sts.bigint(),
            amountsIn: sts.array(() => sts.bigint()),
            newLiquidityParameter: sts.bigint(),
        })
    ),
}

export const exitExecuted =  {
    name: 'NeoSwaps.ExitExecuted',
    /**
     * Liquidity provider left the pool.
     */
    v50: new EventType(
        'NeoSwaps.ExitExecuted',
        sts.struct({
            who: v50.AccountId32,
            marketId: sts.bigint(),
            poolSharesAmount: sts.bigint(),
            amountsOut: sts.array(() => sts.bigint()),
            newLiquidityParameter: sts.bigint(),
        })
    ),
}

export const poolDeployed =  {
    name: 'NeoSwaps.PoolDeployed',
    /**
     * Pool was createed.
     */
    v50: new EventType(
        'NeoSwaps.PoolDeployed',
        sts.struct({
            who: v50.AccountId32,
            marketId: sts.bigint(),
            poolSharesAmount: sts.bigint(),
            amountsIn: sts.array(() => sts.bigint()),
            liquidityParameter: sts.bigint(),
        })
    ),
    /**
     * Pool was createed.
     */
    v51: new EventType(
        'NeoSwaps.PoolDeployed',
        sts.struct({
            who: v51.AccountId32,
            marketId: sts.bigint(),
            accountId: v51.AccountId32,
            reserves: sts.array(() => sts.tuple(() => [v51.Asset, sts.bigint()])),
            collateral: v51.Asset,
            liquidityParameter: sts.bigint(),
            poolSharesAmount: sts.bigint(),
            swapFee: sts.bigint(),
        })
    ),
}
