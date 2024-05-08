import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v54 from '../v54'

export const issued =  {
    name: 'MarketAssets.Issued',
    /**
     * Some assets were issued.
     */
    v54: new EventType(
        'MarketAssets.Issued',
        sts.struct({
            assetId: v54.MarketAssetClass,
            owner: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const transferred =  {
    name: 'MarketAssets.Transferred',
    /**
     * Some assets were transferred.
     */
    v54: new EventType(
        'MarketAssets.Transferred',
        sts.struct({
            assetId: v54.MarketAssetClass,
            from: v54.AccountId32,
            to: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
