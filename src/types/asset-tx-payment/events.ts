import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v47 from '../v47'
import * as v48 from '../v48'

export const assetTxFeePaid =  {
    name: 'AssetTxPayment.AssetTxFeePaid',
    /**
     * A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,
     * has been paid by `who` in an asset `asset_id`.
     */
    v47: new EventType(
        'AssetTxPayment.AssetTxFeePaid',
        sts.struct({
            who: v47.AccountId32,
            actualFee: sts.bigint(),
            tip: sts.bigint(),
            assetId: sts.option(() => v47.Asset),
        })
    ),
    /**
     * A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,
     * has been paid by `who` in an asset `asset_id`.
     */
    v48: new EventType(
        'AssetTxPayment.AssetTxFeePaid',
        sts.struct({
            who: v48.AccountId32,
            actualFee: sts.bigint(),
            tip: sts.bigint(),
            assetId: sts.option(() => sts.number()),
        })
    ),
}
