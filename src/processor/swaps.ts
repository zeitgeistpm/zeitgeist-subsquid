import { EventHandlerContext } from "@subsquid/substrate-processor"
import { Asset, HistoricalAccountBalance, HistoricalAsset, HistoricalPool, Market, HistoricalMarket, Weight, Pool} from '../model'
import { CommonPoolEventParams as t_CPEP, Pool as t_Pool, PoolAssetsEvent as t_PAE, SwapEvent as t_SE } from '@zeitgeistpm/typesV1/dist/interfaces'

export async function swapPoolCreated(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {cpep, pool} = getCreatedEvent(ctx)

    const hab = await store.get(HistoricalAccountBalance, { where: 
        { assetId: "Ztg", event: "NewAccount", blockNumber: block.height } })

    const newPool = new Pool()
    newPool.id = event.id + '-' + cpep.pool_id 
    newPool.poolId = +cpep.pool_id.toString()
    newPool.accountId = hab?.accountId
    newPool.marketId = +pool.market_id.toString()
    newPool.poolStatus = pool.pool_status.toString()
    newPool.scoringRule = pool.scoring_rule.toString()
    newPool.swapFee = pool.swap_fee.toString()
    newPool.totalSubsidy = pool.total_subsidy ? pool.total_subsidy.toString() : ""
    newPool.totalWeight = pool.total_weight.toString()
    newPool.weights = []
    newPool.ztgQty = BigInt(1000000000000)
    newPool.volume = BigInt(0)

    const base = pool.base_asset as any
    newPool.baseAsset = base.ztg !== undefined ? "Ztg" : JSON.stringify(base)

    const savedMarket = await store.get(Market, { where: { marketId: newPool.marketId } })
    if (savedMarket) {
        savedMarket.poolId = newPool.poolId
        console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
        await store.save<Market>(savedMarket)

        const hm = new HistoricalMarket()
        hm.id = event.id + '-' + savedMarket.marketId
        hm.marketId = savedMarket.marketId
        hm.event = event.method
        hm.poolId = savedMarket.poolId
        hm.blockNumber = block.height
        hm.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
        await store.save<HistoricalMarket>(hm)
    }

    const weights = JSON.parse(JSON.stringify(pool.weights))
    Object.entries(weights).map(async (entry, idx) => {
        const weight = new Weight()
        weight.assetId = entry[0]
        weight.len = BigInt(entry[1] as string)
        newPool.weights.push(weight)
        
        if (entry[0].length > 5) {
            const asset = await store.get(Asset, { where: { assetId: entry[0] } })
            if (!asset) { return }

            const spotPrice = await calcSpotPrice(+newPool.ztgQty.toString(),weights.Ztg,1000000000000,+weight.len.toString(), +pool.swap_fee.toString())
            asset.poolId = newPool.poolId
            asset.price = +spotPrice.toString()
            asset.qty = BigInt(1000000000000)
            console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
            await store.save<Asset>(asset)

            const hap = new HistoricalAsset()
            hap.id = event.id + '-' + savedMarket!.marketId + (idx - 1)
            hap.assetId = asset.assetId
            hap.price = asset.price
            hap.qty = asset.qty
            hap.dPrice = hap.price
            hap.dQty = hap.qty
            hap.event = event.method
            hap.blockNumber = block.height
            hap.timestamp = new Date(block.timestamp)
            console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(hap, null, 2)}`)
            await store.save<HistoricalAsset>(hap)
        }
    });
    console.log(`[${event.name}] Saving pool: ${JSON.stringify(newPool, null, 2)}`)
    await store.save<Pool>(newPool)

    const newHP = new HistoricalPool()
    newHP.id = event.id + '-' + newPool.poolId
    newHP.poolId = newPool.poolId
    newHP.event = event.method
    newHP.ztgQty = newPool.ztgQty
    newHP.volume = newPool.volume
    newHP.blockNumber = block.height
    newHP.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)
}

export async function swapPoolExited(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {pae} = getExitedEvent(ctx)

    const savedPool = await store.get(Pool, { where: { poolId: +pae.cpep.pool_id.toString() } })
    if (!savedPool) return

    const ztgWt = +savedPool.weights[0]!.len.toString()
    const oldZtgQty = savedPool.ztgQty
    const newZtgQty = oldZtgQty - BigInt(pae.transferred[pae.transferred.length - 1].toString()) 
    savedPool.ztgQty = newZtgQty
    console.log(`[${event.name}] Saving pool: ${JSON.stringify(savedPool, null, 2)}`)
    await store.save<Pool>(savedPool)

    const newHP = new HistoricalPool()
    newHP.id = event.id + '-' + savedPool.poolId
    newHP.poolId = savedPool.poolId
    newHP.event = event.method
    newHP.ztgQty = savedPool.ztgQty
    newHP.blockNumber = block.height
    newHP.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)

    savedPool.weights.forEach(async (wt, idx) => {
        const asset = await store.get(Asset, { where: { assetId: wt!.assetId } })
        if (!asset) return

        const assetWt = +wt!.len.toString()
        const oldAssetQty = asset.qty!
        const newAssetQty = oldAssetQty - BigInt(pae.transferred[idx].toString())
        const oldPrice = asset.price!
        const newPrice = await calcSpotPrice(+newZtgQty.toString(),ztgWt,+newAssetQty.toString(),assetWt,+savedPool.swapFee)

        asset.price = newPrice
        asset.qty = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        const hap = new HistoricalAsset()
        hap.id = event.id + '-' + savedPool.marketId + (idx - 1)
        hap.assetId = asset.assetId
        hap.price = asset.price
        hap.qty = asset.qty
        hap.dPrice = newPrice - oldPrice
        hap.dQty = newAssetQty - oldAssetQty 
        hap.event = event.method
        hap.blockNumber = block.height
        hap.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(hap, null, 2)}`)
        await store.save<HistoricalAsset>(hap)
    });
}

export async function swapPoolJoined(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {pae} = getJoinedEvent(ctx)

    const savedPool = await store.get(Pool, { where: { poolId: +pae.cpep.pool_id.toString() } })
    if (!savedPool) return

    const ztgWt = +savedPool.weights[0]!.len.toString()
    const oldZtgQty = savedPool.ztgQty
    const newZtgQty = oldZtgQty + BigInt(pae.transferred[pae.transferred.length - 1].toString())
    savedPool.ztgQty = newZtgQty
    console.log(`[${event.name}] Saving pool: ${JSON.stringify(savedPool, null, 2)}`)
    await store.save<Pool>(savedPool)

    const newHP = new HistoricalPool()
    newHP.id = event.id + '-' + savedPool.poolId
    newHP.poolId = savedPool.poolId
    newHP.event = event.method
    newHP.ztgQty = savedPool.ztgQty
    newHP.blockNumber = block.height
    newHP.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)

    savedPool.weights.forEach(async (wt, idx) => {
        const asset = await store.get(Asset, { where: { assetId: wt!.assetId } })
        if (!asset) return

        const assetWt = +wt!.len.toString()
        const oldAssetQty = asset.qty!
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString())
        const oldPrice = asset.price!
        const newPrice = await calcSpotPrice(+newZtgQty.toString(),ztgWt,+newAssetQty.toString(),assetWt,+savedPool.swapFee)

        asset.price = newPrice
        asset.qty = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        const hap = new HistoricalAsset()
        hap.id = event.id + '-' + savedPool.marketId + (idx - 1)
        hap.assetId = asset.assetId
        hap.price = asset.price
        hap.qty = asset.qty
        hap.dPrice = newPrice - oldPrice
        hap.dQty = newAssetQty - oldAssetQty
        hap.event = event.method
        hap.blockNumber = block.height
        hap.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(hap, null, 2)}`)
        await store.save<HistoricalAsset>(hap)
    });
}

export async function swapExactAmountIn(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {swapEvent} = getSwapInEvent(ctx)
    
    const savedPool = await store.get(Pool, { where: { poolId: +swapEvent.cpep.pool_id.toString() } })
    if (!savedPool) return

    const ztgWt = +savedPool.weights[0]!.len.toString()
    const oldZtgQty = savedPool.ztgQty
    const newZtgQty = oldZtgQty - BigInt(swapEvent.asset_amount_out.toString()) 
    savedPool.ztgQty = newZtgQty
    savedPool.volume = savedPool.volume + BigInt(swapEvent.asset_amount_out.toString())
    console.log(`[${event.name}] Saving pool: ${JSON.stringify(savedPool, null, 2)}`)
    await store.save<Pool>(savedPool)

    const newHP = new HistoricalPool()
    newHP.id = event.id + '-' + savedPool.poolId
    newHP.poolId = savedPool.poolId
    newHP.event = event.method
    newHP.ztgQty = savedPool.ztgQty
    newHP.volume = savedPool.volume
    newHP.blockNumber = block.height
    newHP.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)

    savedPool.weights.forEach(async (wt, idx) => {
        const asset = await store.get(Asset, { where: { assetId: wt!.assetId } })
        if (!asset) return

        const assetWt = +wt!.len.toString()
        const oldAssetQty = asset.qty!
        const oldPrice = asset.price!
        var newAssetQty = BigInt(0)

        if (extrinsic?.args[1] && wt!.assetId === JSON.stringify(extrinsic?.args[1].value)) {
            newAssetQty = oldAssetQty + BigInt(swapEvent.asset_amount_in.toString())
        } else if (extrinsic?.args[0].name === "calls") {
            for (var ext of extrinsic.args[0].value as Array<{ args: { pool_id: number, asset_in: string, max_price: number }}> ) {
                const { args: { asset_in, pool_id, max_price } } = ext;
                if (pool_id == +swapEvent.cpep.pool_id.toString() && wt!.assetId == JSON.stringify(asset_in)
                    && max_price == +swapEvent.max_price.toString()) {
                    newAssetQty = oldAssetQty + BigInt(swapEvent.asset_amount_in.toString())
                    break
                }
            }
        }
        if (newAssetQty == BigInt(0)) newAssetQty = oldAssetQty
        const newPrice = await calcSpotPrice(+newZtgQty.toString(),ztgWt,+newAssetQty.toString(),assetWt,+savedPool.swapFee)

        asset.price = newPrice
        asset.qty = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        const hap = new HistoricalAsset()
        hap.id = event.id + '-' + savedPool.marketId + (idx - 1)
        hap.assetId = asset.assetId
        hap.price = asset.price
        hap.qty = asset.qty
        hap.dPrice = newPrice - oldPrice
        hap.dQty = newAssetQty - oldAssetQty
        hap.event = event.method
        hap.blockNumber = block.height
        hap.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(hap, null, 2)}`)
        await store.save<HistoricalAsset>(hap)
    });
}

export async function swapExactAmountOut(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {swapEvent} = getSwapOutEvent(ctx)
    
    const savedPool = await store.get(Pool, { where: { poolId: +swapEvent.cpep.pool_id.toString() } })
    if (!savedPool) return

    const ztgWt = +savedPool.weights[0]!.len.toString()
    const oldZtgQty = savedPool.ztgQty
    const newZtgQty = oldZtgQty + BigInt(swapEvent.asset_amount_in.toString())
    savedPool.ztgQty = newZtgQty
    savedPool.volume = savedPool.volume + BigInt(swapEvent.asset_amount_in.toString())
    console.log(`[${event.name}] Saving pool: ${JSON.stringify(savedPool, null, 2)}`)
    await store.save<Pool>(savedPool)

    const newHP = new HistoricalPool()
    newHP.id = event.id + '-' + savedPool.poolId
    newHP.poolId = savedPool.poolId
    newHP.event = event.method
    newHP.ztgQty = savedPool.ztgQty
    newHP.volume = savedPool.volume
    newHP.blockNumber = block.height
    newHP.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(newHP, null, 2)}`)
    await store.save<HistoricalPool>(newHP)

    savedPool.weights.forEach(async (wt, idx) => {
        const asset = await store.get(Asset, { where: { assetId: wt!.assetId } })
        if (!asset) return

        const assetWt = +wt!.len.toString()
        const oldAssetQty = asset.qty!
        const oldPrice = asset.price!
        var newAssetQty = BigInt(0)

        if (extrinsic?.args[1] && wt!.assetId === JSON.stringify(extrinsic?.args[3].value)) {
            newAssetQty = oldAssetQty - BigInt(swapEvent.asset_amount_out.toString())
        } else if (extrinsic?.args[0].name === "calls") {
            for (var ext of extrinsic.args[0].value as Array<{ args: { pool_id: number, asset_out: string, max_price: number }}> ) {
                const { args: { asset_out, pool_id, max_price } } = ext;
                if (pool_id == +swapEvent.cpep.pool_id.toString() && wt!.assetId == JSON.stringify(asset_out)
                    && max_price == +swapEvent.max_price.toString()) {
                    newAssetQty = oldAssetQty - BigInt(swapEvent.asset_amount_out.toString())
                    break
                }
            }
        }
        if (newAssetQty == BigInt(0)) newAssetQty = oldAssetQty
        const newPrice = await calcSpotPrice(+newZtgQty.toString(),ztgWt,+newAssetQty.toString(),assetWt,+savedPool.swapFee)

        asset.price = newPrice
        asset.qty = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        const hap = new HistoricalAsset()
        hap.id = event.id + '-' + savedPool.marketId + (idx - 1)
        hap.assetId = asset.assetId
        hap.price = asset.price
        hap.qty = asset.qty
        hap.dPrice = newPrice - oldPrice
        hap.dQty = newAssetQty - oldAssetQty
        hap.event = event.method
        hap.blockNumber = block.height
        hap.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(hap, null, 2)}`)
        await store.save<HistoricalAsset>(hap)
    });
}

async function calcSpotPrice(tokenBalanceIn: number, tokenWeightIn: number, tokenBalanceOut: number, tokenWeightOut: number, swapFee: number): Promise<number> {
    const numer = tokenBalanceIn/tokenWeightIn
    const denom = tokenBalanceOut/tokenWeightOut
    const ratio = numer/denom
    const scale = 1/(1-swapFee)
    const spotPrice = ratio*scale
    return spotPrice
}

interface CreatedEvent {
    cpep: t_CPEP
    pool: t_Pool
}

interface ExitedEvent {
    pae: t_PAE
}

interface JoinedEvent {
    pae: t_PAE
}

interface SwapInEvent {
    swapEvent: t_SE
}

interface SwapOutEvent {
    swapEvent: t_SE
}

function getCreatedEvent(ctx: EventHandlerContext): CreatedEvent {
    const [param0, param1] = ctx.event.params
    const cpep = param0.value as t_CPEP
    const pool = param1.value as t_Pool
    return {cpep, pool}
}

function getExitedEvent(ctx: EventHandlerContext): ExitedEvent {
    const [param0] = ctx.event.params
    const pae = param0.value as t_PAE
    return {pae}
}

function getJoinedEvent(ctx: EventHandlerContext): JoinedEvent {
    const [param0] = ctx.event.params
    const pae = param0.value as t_PAE
    return {pae}
}

function getSwapInEvent(ctx: EventHandlerContext): SwapInEvent {
    const [param0] = ctx.event.params
    const swapEvent = param0.value as t_SE
    return {swapEvent}
}

function getSwapOutEvent(ctx: EventHandlerContext): SwapOutEvent {
    const [param0] = ctx.event.params
    const swapEvent = param0.value as t_SE
    return {swapEvent}
}