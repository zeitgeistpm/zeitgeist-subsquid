import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Asset, HistoricalAssetPrice, Market, MarketHistory, Pool, PoolInfo, Weight} from '../generated/model'
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
    newPool.weights = []
    newPool.ztgQty = ''+1000000000000

    const savedMarket = await store.get(Market, { where: { marketId: newPool.marketId } })
    if (savedMarket) {
        savedMarket.poolId = newPool.poolId

        const mh = new MarketHistory()
        mh.event = event.method
        mh.poolId = savedMarket.poolId
        mh.blockNumber = block.height
        mh.timestamp = block.timestamp.toString()
        savedMarket.marketHistory?.push(mh)
        console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
        await store.save<Market>(savedMarket)
    }

    const weights = JSON.parse(pool.weights.toString())
    Object.entries(weights).map(async entry => {
        const weight = new Weight()
        weight.assetId = entry[0]
        weight.len = entry[1] as string
        newPool.weights.push(weight)
        
        if (entry[0].length > 5) {
            const asset = await store.get(Asset, { where: { assetId: entry[0] } })
            if (!asset) { return }

            const spotPrice = await calcSpotPrice(+newPool.ztgQty,weights.Ztg,1000000000000,+weight.len, +pool.swap_fee.toString())
            const poolInfo = new PoolInfo()
            poolInfo.price = spotPrice
            poolInfo.qty = ''+1000000000000
            asset.poolInfo = poolInfo
            console.log(`[${event.method}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
            await store.save<Asset>(asset)

            const hap = new HistoricalAssetPrice()
            hap.assetId = asset.assetId
            hap.price = poolInfo.price
            hap.qty = poolInfo.qty
            hap.dPrice = hap.price
            hap.dQty = hap.qty
            hap.event = event.method
            hap.blockNumber = block.height
            hap.timestamp = new BN(block.timestamp)
            console.log(`[${event.method}] Saving historical asset price: ${JSON.stringify(hap, null, 2)}`)
            await store.save<HistoricalAssetPrice>(hap)
        }
    });
    console.log(`[${event.method}] Saving pool: ${JSON.stringify(newPool, null, 2)}`)
    await store.save<Pool>(newPool)

    const newHP = new HistoricalPool()
    newHP.pool = newPool
    newHP.event = event.method
    newHP.ztgQty = newPool.ztgQty
    newHP.blockNumber = block.height
    newHP.timestamp = new BN(block.timestamp)
    console.log(`[${event.method}] Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)
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

async function calcSpotPrice(tokenBalanceIn: number, tokenWeightIn: number, tokenBalanceOut: number, tokenWeightOut: number, swapFee: number): Promise<number> {
    const numer = tokenBalanceIn/tokenWeightIn
    const denom = tokenBalanceOut/tokenWeightOut
    const ratio = numer/denom
    const scale = 1/(1-swapFee)
    const spotPrice = ratio*scale
    return spotPrice
}