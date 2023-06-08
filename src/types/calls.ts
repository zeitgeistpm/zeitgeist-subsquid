import assert from 'assert'
import {Chain, ChainContext, CallContext, Call, Result, Option} from './support'

export class PredictionMarketsRedeemSharesCall {
    private readonly _chain: Chain
    private readonly call: Call

    constructor(ctx: CallContext)
    constructor(ctx: ChainContext, call: Call)
    constructor(ctx: CallContext, call?: Call) {
        call = call || ctx.call
        assert(call.name === 'PredictionMarkets.redeem_shares')
        this._chain = ctx._chain
        this.call = call
    }

    /**
     *  Redeems the winning shares of a prediction market.
     * 
     */
    get isV23(): boolean {
        return this._chain.getCallHash('PredictionMarkets.redeem_shares') === '2d8fec72d3e36c29cd347083d3311cbd62a17f1318b1377488dc738d486872af'
    }

    /**
     *  Redeems the winning shares of a prediction market.
     * 
     */
    get asV23(): {marketId: bigint} {
        assert(this.isV23)
        return this._chain.decodeCall(this.call)
    }

    /**
     * Redeems the winning shares of a prediction market.
     * 
     */
    get isV36(): boolean {
        return this._chain.getCallHash('PredictionMarkets.redeem_shares') === 'b56842a00d00b24c300d8cd4359235b469945c309694d455d2ba2bd1de5d0d4e'
    }

    /**
     * Redeems the winning shares of a prediction market.
     * 
     */
    get asV36(): {marketId: bigint} {
        assert(this.isV36)
        return this._chain.decodeCall(this.call)
    }
}

export class SwapsPoolExitCall {
    private readonly _chain: Chain
    private readonly call: Call

    constructor(ctx: CallContext)
    constructor(ctx: ChainContext, call: Call)
    constructor(ctx: CallContext, call?: Call) {
        call = call || ctx.call
        assert(call.name === 'Swaps.pool_exit')
        this._chain = ctx._chain
        this.call = call
    }

    /**
     *  Pool - Exit
     * 
     *  Retrieves a given set of assets from `pool_id` to `origin`.
     * 
     *  # Arguments
     * 
     *  * `origin`: Liquidity Provider (LP). The account whose assets should be received.
     *  * `pool_id`: Unique pool identifier.
     *  * `pool_amount`: The amount of LP shares of this pool being burned based on the
     *  retrieved assets.
     *  * `min_assets_out`: List of asset lower bounds. No asset should be lower than the
     *  provided values.
     */
    get isV23(): boolean {
        return this._chain.getCallHash('Swaps.pool_exit') === '932b79e581da3c25c616e735945c39464d16ef8cde6b653730abab659258bcb0'
    }

    /**
     *  Pool - Exit
     * 
     *  Retrieves a given set of assets from `pool_id` to `origin`.
     * 
     *  # Arguments
     * 
     *  * `origin`: Liquidity Provider (LP). The account whose assets should be received.
     *  * `pool_id`: Unique pool identifier.
     *  * `pool_amount`: The amount of LP shares of this pool being burned based on the
     *  retrieved assets.
     *  * `min_assets_out`: List of asset lower bounds. No asset should be lower than the
     *  provided values.
     */
    get asV23(): {poolId: bigint, poolAmount: bigint, minAssetsOut: bigint[]} {
        assert(this.isV23)
        return this._chain.decodeCall(this.call)
    }

    /**
     * Pool - Exit
     * 
     * Retrieves a given set of assets from `pool_id` to `origin`.
     * 
     * # Arguments
     * 
     * * `origin`: Liquidity Provider (LP). The account whose assets should be received.
     * * `pool_id`: Unique pool identifier.
     * * `pool_amount`: The amount of LP shares of this pool being burned based on the
     * retrieved assets.
     * * `min_assets_out`: List of asset lower bounds. No asset should be lower than the
     * provided values.
     */
    get isV36(): boolean {
        return this._chain.getCallHash('Swaps.pool_exit') === '077be92978cb72796fb586f6ddaeab5782d73931f6b89513a7819b24f021e489'
    }

    /**
     * Pool - Exit
     * 
     * Retrieves a given set of assets from `pool_id` to `origin`.
     * 
     * # Arguments
     * 
     * * `origin`: Liquidity Provider (LP). The account whose assets should be received.
     * * `pool_id`: Unique pool identifier.
     * * `pool_amount`: The amount of LP shares of this pool being burned based on the
     * retrieved assets.
     * * `min_assets_out`: List of asset lower bounds. No asset should be lower than the
     * provided values.
     */
    get asV36(): {poolId: bigint, poolAmount: bigint, minAssetsOut: bigint[]} {
        assert(this.isV36)
        return this._chain.decodeCall(this.call)
    }
}
