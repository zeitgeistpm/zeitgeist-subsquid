import {sts, Block, Bytes, Option, Result, CallType, RuntimeCtx} from '../support'
import * as v23 from '../v23'

export const redeemShares =  {
    name: 'PredictionMarkets.redeem_shares',
    /**
     *  Redeems the winning shares of a prediction market.
     * 
     */
    v23: new CallType(
        'PredictionMarkets.redeem_shares',
        sts.struct({
            marketId: v23.MarketIdOf,
        })
    ),
}
