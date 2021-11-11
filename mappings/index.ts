import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Pool } from '../generated/model'
import { Swaps } from '../chain'

export async function swapPoolCreated({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const newPool = new Pool()
  const [cpep, pool] = new Swaps.PoolCreateEvent(event).params
  newPool.poolId = cpep.pool_id.toNumber();
  newPool.baseAsset = pool.base_asset.toString();
  newPool.marketId = pool.market_id;
  newPool.poolStatus = pool.pool_status.toString();
  newPool.scoringRule = pool.scoring_rule;
  newPool.swapFee = pool.swap_fee.toString();
  newPool.totalSubsidy = pool.total_subsidy.toString();
  newPool.totalWeight = pool.total_weight.toString();
  newPool.blockNumber = block.height
  newPool.timestamp = new BN(block.timestamp)

  console.log(`Saving pool: ${JSON.stringify(newPool, null, 2)}`)
  await store.save<Pool>(newPool)
}

export * from './markets'