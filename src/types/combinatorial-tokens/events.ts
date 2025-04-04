import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v60 from '../v60'

export const tokenSplit =  {
    name: 'CombinatorialTokens.TokenSplit',
    /**
     * User `who` has split `amount` units of token `asset_in` into the same amount of each
     * token in `assets_out` using `partition`. The ith element of `partition` matches the ith
     * element of `assets_out`, so `assets_out[i]` is the outcome represented by the specified
     * `parent_collection_id` when split using `partition[i]` in `market_id`. The same goes for
     * the `collection_ids` vector, the ith element of which specifies the collection ID of
     * `assets_out[i]`.
     */
    v60: new EventType(
        'CombinatorialTokens.TokenSplit',
        sts.struct({
            who: v60.AccountId32,
            parentCollectionId: sts.option(() => sts.bytes()),
            marketId: sts.bigint(),
            partition: sts.array(() => sts.array(() => sts.boolean())),
            assetIn: v60.Asset,
            assetsOut: sts.array(() => v60.Asset),
            collectionIds: sts.array(() => sts.bytes()),
            amount: sts.bigint(),
        })
    ),
}

export const tokenMerged =  {
    name: 'CombinatorialTokens.TokenMerged',
    /**
     * User `who` has merged `amount` units of each of the tokens in `assets_in` into the same
     * amount of `asset_out`. The ith element of the `partition` matches the ith element of
     * `assets_in`, so `assets_in[i]` is the outcome represented by the specified
     * `parent_collection_id` when split using `partition[i]` in `market_id`. Note that the
     * `parent_collection_id` is equal to the collection ID of the position `asset_out`; if
     * `asset_out` is the collateral token, then `parent_collection_id` is `None`.
     */
    v60: new EventType(
        'CombinatorialTokens.TokenMerged',
        sts.struct({
            who: v60.AccountId32,
            parentCollectionId: sts.option(() => sts.bytes()),
            marketId: sts.bigint(),
            partition: sts.array(() => sts.array(() => sts.boolean())),
            assetOut: v60.Asset,
            assetsIn: sts.array(() => v60.Asset),
            amount: sts.bigint(),
        })
    ),
}

export const tokenRedeemed =  {
    name: 'CombinatorialTokens.TokenRedeemed',
    /**
     * User `who` has redeemed `amount_in` units of `asset_in` for `amount_out` units of
     * `asset_out` using the report for the market specified by `market_id`. The
     * `parent_collection_id` specifies the collection ID of the `asset_out`; it is `None` if
     * the `asset_out` is the collateral token.
     */
    v60: new EventType(
        'CombinatorialTokens.TokenRedeemed',
        sts.struct({
            who: v60.AccountId32,
            parentCollectionId: sts.option(() => sts.bytes()),
            marketId: sts.bigint(),
            indexSet: sts.array(() => sts.boolean()),
            assetIn: v60.Asset,
            amountIn: sts.bigint(),
            assetOut: v60.Asset,
            amountOut: sts.bigint(),
        })
    ),
}
