import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Market, MarketHistory, Pool } from '../generated/model'
import { Swaps } from '../chain'
import { HistoricalPool } from '../generated/modules/historical-pool/historical-pool.model'

export async function swapPoolCreated({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [cpep, pool] = new Swaps.PoolCreateEvent(event).params
    
    const newPool = new Pool()
    newPool.poolId = cpep.pool_id.toNumber();
    newPool.baseAsset = pool.base_asset.toString();
    newPool.marketId = pool.market_id;
    newPool.poolStatus = pool.pool_status.toString();
    newPool.scoringRule = pool.scoring_rule;
    newPool.swapFee = pool.swap_fee.toString();
    newPool.totalSubsidy = pool.total_subsidy.toString();
    newPool.totalWeight = pool.total_weight.toString();

    console.log(`Saving pool: ${JSON.stringify(newPool, null, 2)}`)
    await store.save<Pool>(newPool)

    const newHP = new HistoricalPool()
    newHP.pool = newPool
    newHP.event = event.method
    newHP.blockNumber = block.height
    newHP.timestamp = new BN(block.timestamp)

    console.log(`Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)

    const savedMarket = await store.get(Market, { where: { marketId: newPool.marketId } })
    if (savedMarket) {
        savedMarket.poolId = newPool.poolId

        const mh = new MarketHistory()
        mh.event = event.method
        mh.poolId = savedMarket.poolId
        mh.blockNumber = block.height
        mh.timestamp = block.timestamp.toString()
        savedMarket.marketHistory?.push(mh)

        console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
        await store.save<Market>(savedMarket)
    }
    
}

export async function swapExactAmountIn({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [swapEvent] = new Swaps.SwapExactAmountInEvent(event).params
    
    const savedPool = await store.get(Pool, { where: { poolId: swapEvent.cpep.pool_id.toNumber() } })
    if (!savedPool) return

    const newHP = new HistoricalPool()
    newHP.pool = savedPool
    newHP.event = event.method
    newHP.blockNumber = block.height
    newHP.timestamp = new BN(block.timestamp)

    console.log(`Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)
}

export async function swapExactAmountOut({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [swapEvent] = new Swaps.SwapExactAmountOutEvent(event).params
    
    const savedPool = await store.get(Pool, { where: { poolId: swapEvent.cpep.pool_id.toNumber() } })
    if (!savedPool) return

    const newHP = new HistoricalPool()
    newHP.pool = savedPool
    newHP.event = event.method
    newHP.blockNumber = block.height
    newHP.timestamp = new BN(block.timestamp)

    console.log(`Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)
}