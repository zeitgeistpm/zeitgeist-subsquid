import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v54 from '../v54'

export const issued =  {
    name: 'CampaignAssets.Issued',
    /**
     * Some assets were issued.
     */
    v54: new EventType(
        'CampaignAssets.Issued',
        sts.struct({
            assetId: v54.CampaignAssetClass,
            owner: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const transferred =  {
    name: 'CampaignAssets.Transferred',
    /**
     * Some assets were transferred.
     */
    v54: new EventType(
        'CampaignAssets.Transferred',
        sts.struct({
            assetId: v54.CampaignAssetClass,
            from: v54.AccountId32,
            to: v54.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
