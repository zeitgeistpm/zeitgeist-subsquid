import {sts, Block, Bytes, Option, Result, CallType, RuntimeCtx} from '../support'
import * as v26 from '../v26'

export const redeemShares =  {
    name: 'PredictionMarkets.redeem_shares',
    /**
     *  Redeems the winning shares of a prediction market.
     * 
     */
    v26: new CallType(
        'PredictionMarkets.redeem_shares',
        sts.struct({
            marketId: v26.MarketIdOf,
        })
    ),
}
