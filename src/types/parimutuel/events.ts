import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v51 from '../v51'
import * as v54 from '../v54'

export const outcomeBought =  {
    name: 'Parimutuel.OutcomeBought',
    /**
     * An outcome was bought.
     */
    v51: new EventType(
        'Parimutuel.OutcomeBought',
        sts.struct({
            marketId: sts.bigint(),
            buyer: v51.AccountId32,
            asset: v51.Asset,
            amountMinusFees: sts.bigint(),
            fees: sts.bigint(),
        })
    ),
    /**
     * An outcome was bought.
     */
    v54: new EventType(
        'Parimutuel.OutcomeBought',
        sts.struct({
            marketId: sts.bigint(),
            buyer: v54.AccountId32,
            asset: v54.Asset,
            amountMinusFees: sts.bigint(),
            fees: sts.bigint(),
        })
    ),
}
