import {sts, Block, Bytes, Option, Result, CallType, RuntimeCtx} from '../support'
import * as v26 from '../v26'

export const poolExit =  {
    name: 'Swaps.pool_exit',
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
    v26: new CallType(
        'Swaps.pool_exit',
        sts.struct({
            poolId: v26.PoolId,
            poolAmount: v26.BalanceOf,
            minAssetsOut: sts.array(() => v26.BalanceOf),
        })
    ),
}
