import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v23 from '../v23'
import * as v26 from '../v26'
import * as v32 from '../v32'
import * as v35 from '../v35'
import * as v36 from '../v36'
import * as v37 from '../v37'
import * as v39 from '../v39'
import * as v41 from '../v41'
import * as v49 from '../v49'
import * as v50 from '../v50'
import * as v51 from '../v51'

export const poolCreate =  {
    name: 'Swaps.PoolCreate',
    /**
     *  A new pool has been created. \[CommonPoolEventParams, pool\]
     */
    v23: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v23.CommonPoolEventParams, v23.Pool])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool\]
     */
    v32: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v32.CommonPoolEventParams, v32.Pool])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount\]
     */
    v35: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v35.CommonPoolEventParams, v35.Pool, sts.bigint()])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
     */
    v36: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v36.CommonPoolEventParams, v36.Pool, sts.bigint(), v36.AccountId32])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
     */
    v37: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v37.CommonPoolEventParams, v37.Pool, sts.bigint(), v37.AccountId32])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
     */
    v39: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v39.CommonPoolEventParams, v39.Pool, sts.bigint(), v39.AccountId32])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
     */
    v41: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v41.CommonPoolEventParams, v41.Pool, sts.bigint(), v41.AccountId32])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
     */
    v50: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v50.CommonPoolEventParams, v50.Pool, sts.bigint(), v50.AccountId32])
    ),
    /**
     * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
     */
    v51: new EventType(
        'Swaps.PoolCreate',
        sts.tuple([v51.CommonPoolEventParams, v51.Pool, sts.bigint(), v51.AccountId32])
    ),
}

export const poolExit =  {
    name: 'Swaps.PoolExit',
    /**
     *  Someone has exited a pool. \[PoolAssetsEvent\]
     */
    v23: new EventType(
        'Swaps.PoolExit',
        v23.PoolAssetsEvent
    ),
    /**
     *  Someone has exited a pool. \[PoolAssetsEvent\]
     */
    v26: new EventType(
        'Swaps.PoolExit',
        v26.PoolAssetsEvent
    ),
    /**
     * Someone has exited a pool. \[PoolAssetsEvent\]
     */
    v32: new EventType(
        'Swaps.PoolExit',
        v32.PoolAssetsEvent
    ),
    /**
     * Someone has exited a pool. \[PoolAssetsEvent\]
     */
    v35: new EventType(
        'Swaps.PoolExit',
        v35.PoolAssetsEvent
    ),
    /**
     * Someone has exited a pool. \[PoolAssetsEvent\]
     */
    v41: new EventType(
        'Swaps.PoolExit',
        v41.PoolAssetsEvent
    ),
    /**
     * Someone has exited a pool. \[PoolAssetsEvent\]
     */
    v51: new EventType(
        'Swaps.PoolExit',
        v51.PoolAssetsEvent
    ),
}

export const poolExitWithExactAssetAmount =  {
    name: 'Swaps.PoolExitWithExactAssetAmount',
    /**
     *  Exits a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v23: new EventType(
        'Swaps.PoolExitWithExactAssetAmount',
        v23.PoolAssetEvent
    ),
    /**
     *  Exits a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v26: new EventType(
        'Swaps.PoolExitWithExactAssetAmount',
        v26.PoolAssetEvent
    ),
    /**
     * Exits a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v32: new EventType(
        'Swaps.PoolExitWithExactAssetAmount',
        v32.PoolAssetEvent
    ),
    /**
     * Exits a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v35: new EventType(
        'Swaps.PoolExitWithExactAssetAmount',
        v35.PoolAssetEvent
    ),
    /**
     * Exits a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v41: new EventType(
        'Swaps.PoolExitWithExactAssetAmount',
        v41.PoolAssetEvent
    ),
    /**
     * Exits a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v51: new EventType(
        'Swaps.PoolExitWithExactAssetAmount',
        v51.PoolAssetEvent
    ),
}

export const poolJoin =  {
    name: 'Swaps.PoolJoin',
    /**
     *  Someone has joined a pool. \[PoolAssetsEvent\]
     */
    v23: new EventType(
        'Swaps.PoolJoin',
        v23.PoolAssetsEvent
    ),
    /**
     *  Someone has joined a pool. \[PoolAssetsEvent\]
     */
    v26: new EventType(
        'Swaps.PoolJoin',
        v26.PoolAssetsEvent
    ),
    /**
     * Someone has joined a pool. \[PoolAssetsEvent\]
     */
    v32: new EventType(
        'Swaps.PoolJoin',
        v32.PoolAssetsEvent
    ),
    /**
     * Someone has joined a pool. \[PoolAssetsEvent\]
     */
    v35: new EventType(
        'Swaps.PoolJoin',
        v35.PoolAssetsEvent
    ),
    /**
     * Someone has joined a pool. \[PoolAssetsEvent\]
     */
    v41: new EventType(
        'Swaps.PoolJoin',
        v41.PoolAssetsEvent
    ),
    /**
     * Someone has joined a pool. \[PoolAssetsEvent\]
     */
    v51: new EventType(
        'Swaps.PoolJoin',
        v51.PoolAssetsEvent
    ),
}

export const poolJoinWithExactAssetAmount =  {
    name: 'Swaps.PoolJoinWithExactAssetAmount',
    /**
     *  Joins a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v23: new EventType(
        'Swaps.PoolJoinWithExactAssetAmount',
        v23.PoolAssetEvent
    ),
    /**
     *  Joins a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v26: new EventType(
        'Swaps.PoolJoinWithExactAssetAmount',
        v26.PoolAssetEvent
    ),
    /**
     * Joins a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v32: new EventType(
        'Swaps.PoolJoinWithExactAssetAmount',
        v32.PoolAssetEvent
    ),
    /**
     * Joins a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v35: new EventType(
        'Swaps.PoolJoinWithExactAssetAmount',
        v35.PoolAssetEvent
    ),
    /**
     * Joins a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v41: new EventType(
        'Swaps.PoolJoinWithExactAssetAmount',
        v41.PoolAssetEvent
    ),
    /**
     * Joins a pool given an exact amount of an asset. \[PoolAssetEvent\]
     */
    v51: new EventType(
        'Swaps.PoolJoinWithExactAssetAmount',
        v51.PoolAssetEvent
    ),
}

export const swapExactAmountIn =  {
    name: 'Swaps.SwapExactAmountIn',
    /**
     *  An exact amount of an asset is entering the pool. \[SwapEvent\]
     */
    v23: new EventType(
        'Swaps.SwapExactAmountIn',
        v23.SwapEvent
    ),
    /**
     *  An exact amount of an asset is entering the pool. \[SwapEvent\]
     */
    v26: new EventType(
        'Swaps.SwapExactAmountIn',
        v26.SwapEvent
    ),
    /**
     * An exact amount of an asset is entering the pool. \[SwapEvent\]
     */
    v32: new EventType(
        'Swaps.SwapExactAmountIn',
        v32.SwapEvent
    ),
    /**
     * An exact amount of an asset is entering the pool. \[SwapEvent\]
     */
    v37: new EventType(
        'Swaps.SwapExactAmountIn',
        v37.SwapEvent
    ),
    /**
     * An exact amount of an asset is entering the pool. \[SwapEvent\]
     */
    v41: new EventType(
        'Swaps.SwapExactAmountIn',
        v41.SwapEvent
    ),
    /**
     * An exact amount of an asset is entering the pool. \[SwapEvent\]
     */
    v51: new EventType(
        'Swaps.SwapExactAmountIn',
        v51.SwapEvent
    ),
}

export const swapExactAmountOut =  {
    name: 'Swaps.SwapExactAmountOut',
    /**
     *  An exact amount of an asset is leaving the pool. \[SwapEvent\]
     */
    v23: new EventType(
        'Swaps.SwapExactAmountOut',
        v23.SwapEvent
    ),
    /**
     *  An exact amount of an asset is leaving the pool. \[SwapEvent\]
     */
    v26: new EventType(
        'Swaps.SwapExactAmountOut',
        v26.SwapEvent
    ),
    /**
     * An exact amount of an asset is leaving the pool. \[SwapEvent\]
     */
    v32: new EventType(
        'Swaps.SwapExactAmountOut',
        v32.SwapEvent
    ),
    /**
     * An exact amount of an asset is leaving the pool. \[SwapEvent\]
     */
    v37: new EventType(
        'Swaps.SwapExactAmountOut',
        v37.SwapEvent
    ),
    /**
     * An exact amount of an asset is leaving the pool. \[SwapEvent\]
     */
    v41: new EventType(
        'Swaps.SwapExactAmountOut',
        v41.SwapEvent
    ),
    /**
     * An exact amount of an asset is leaving the pool. \[SwapEvent\]
     */
    v51: new EventType(
        'Swaps.SwapExactAmountOut',
        v51.SwapEvent
    ),
}

export const poolDestroyed =  {
    name: 'Swaps.PoolDestroyed',
    /**
     * Pool was manually destroyed. \[pool_id\]
     */
    v36: new EventType(
        'Swaps.PoolDestroyed',
        sts.bigint()
    ),
}

export const poolClosed =  {
    name: 'Swaps.PoolClosed',
    /**
     * A pool was closed. \[pool_id\]
     */
    v37: new EventType(
        'Swaps.PoolClosed',
        sts.bigint()
    ),
}

export const poolActive =  {
    name: 'Swaps.PoolActive',
    /**
     * A pool was opened. \[pool_id\]
     */
    v39: new EventType(
        'Swaps.PoolActive',
        sts.bigint()
    ),
}

export const arbitrageBuyBurn =  {
    name: 'Swaps.ArbitrageBuyBurn',
    /**
     * Buy-burn arbitrage was executed on a CPMM pool. \[pool_id, amount\]
     */
    v41: new EventType(
        'Swaps.ArbitrageBuyBurn',
        sts.tuple([sts.bigint(), sts.bigint()])
    ),
}

export const arbitrageMintSell =  {
    name: 'Swaps.ArbitrageMintSell',
    /**
     * Mint-sell arbitrage was executed on a CPMM pool. \[pool_id, amount\]
     */
    v41: new EventType(
        'Swaps.ArbitrageMintSell',
        sts.tuple([sts.bigint(), sts.bigint()])
    ),
}

export const marketCreatorFeesPaid =  {
    name: 'Swaps.MarketCreatorFeesPaid',
    /**
     * Fees were paid to the market creators. \[payer, payee, amount, asset\]
     */
    v49: new EventType(
        'Swaps.MarketCreatorFeesPaid',
        sts.tuple([v49.AccountId32, v49.AccountId32, sts.bigint(), v49.Asset])
    ),
    /**
     * Fees were paid to the market creator. \[market_id , payer, payee, amount, asset\]
     */
    v51: new EventType(
        'Swaps.MarketCreatorFeesPaid',
        sts.tuple([sts.bigint(), v51.AccountId32, v51.AccountId32, sts.bigint(), v51.Asset])
    ),
}
