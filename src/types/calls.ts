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
