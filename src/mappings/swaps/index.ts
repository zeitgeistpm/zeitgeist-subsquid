import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import * as ss58 from '@subsquid/ss58'
import { Account, AccountBalance, Asset, HistoricalAccountBalance, HistoricalAsset, 
  HistoricalMarket, HistoricalPool, Market, Pool, Weight } from '../../model'
import { calcSpotPrice, getAssetId, whetherBuyOrSell } from '../helper'
import { getPoolActiveEvent, getPoolClosedEvent, getPoolCreateEvent, getPoolExitEvent, getPoolJoinEvent, 
  getSwapExactAmountInEvent, getSwapExactAmountOutEvent} from './types'


export async function poolActive(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {poolId} = getPoolActiveEvent(ctx)

  let pool = await store.get(Pool, { where: { poolId: +poolId.toString() } })
  if (!pool) return

  pool.poolStatus = 'Active'
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.poolStatus = pool.poolStatus
  hp.event = event.name.split('.')[1]
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)
}

export async function poolClosed(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {poolId} = getPoolClosedEvent(ctx)

  let pool = await store.get(Pool, { where: { poolId: +poolId.toString() } })
  if (!pool) return

  pool.poolStatus = 'Closed'
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.poolStatus = pool.poolStatus
  hp.event = event.name.split('.')[1]
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)
}

export async function poolCreate(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {cpep, swapPool, amount} = getPoolCreateEvent(ctx)

  const hab = await store.get(HistoricalAccountBalance, { where: { assetId: 'Ztg', event: 'NewAccount', 
    blockNumber: block.height } })

  let pool = new Pool()
  pool.id = event.id + '-' + cpep.poolId 
  pool.poolId = +cpep.poolId.toString()
  pool.accountId = hab ? hab.accountId : null
  pool.marketId = +swapPool.marketId.toString()
  pool.poolStatus = swapPool.poolStatus.__kind
  pool.scoringRule = swapPool.scoringRule.__kind
  pool.swapFee = swapPool.swapFee ? swapPool.swapFee.toString() : ''
  pool.totalSubsidy = swapPool.totalSubsidy ? swapPool.totalSubsidy.toString() : ''
  pool.totalWeight = swapPool.totalWeight ? swapPool.totalWeight.toString() : ''
  pool.weights = []
  pool.ztgQty = amount !== BigInt(0) ? amount : BigInt(1000000000000)
  pool.volume = BigInt(0)
  pool.createdAt = new Date(block.timestamp)
  pool.baseAsset = swapPool.baseAsset.__kind

  let acc = await store.get(Account, { where: { accountId: hab?.accountId } })
  if (acc) {
    acc.poolId = pool.poolId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
  }

  let market = await store.get(Market, { where: { marketId: pool.marketId } })
  if (market) {
    market.poolId = pool.poolId
    console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`)
    await store.save<Market>(market)

    let hm = new HistoricalMarket()
    hm.id = event.id + '-' + market.marketId
    hm.marketId = market.marketId
    hm.event = event.name.split('.')[1]
    hm.poolId = market.poolId
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
  }

  if (swapPool.weights && swapPool.weights[swapPool.weights.length - 1][0].__kind == 'Ztg') {
    const tokenWeightIn = +swapPool.weights[swapPool.weights.length - 1][1].toString()
    await Promise.all(
      swapPool.weights.map(async wt => {
        let weight = new Weight()
        weight.assetId = getAssetId(wt[0])
        weight.len = wt[1]
        pool.weights.push(weight)
      
        if (weight.assetId.length > 5) {
          let asset = await store.get(Asset, { where: { assetId: weight.assetId } })
          if (!asset) { return }
      
          let ab = await store.findOneBy(AccountBalance, { account: { accountId: acc?.accountId }, assetId: asset.assetId })
          const tokenBalanceOut = ab ? +ab.balance.toString() : 1000000000000
      
          const spotPrice = calcSpotPrice(+pool.ztgQty.toString(),tokenWeightIn,tokenBalanceOut,+weight.len.toString())
          asset.poolId = pool.poolId
          asset.price = +spotPrice.toString()
          asset.amountInPool = BigInt(tokenBalanceOut)
          console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
          await store.save<Asset>(asset)

          let ha = new HistoricalAsset()
          ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-')+1)
          ha.accountId = ss58.codec('zeitgeist').encode(cpep.who)
          ha.assetId = asset.assetId
          ha.newPrice = asset.price
          ha.newAmountInPool = asset.amountInPool
          ha.dPrice = ha.newPrice
          ha.dAmountInPool = ha.newAmountInPool
          ha.event = event.name.split('.')[1]
          ha.blockNumber = block.height
          ha.timestamp = new Date(block.timestamp)
          console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`)
          await store.save<HistoricalAsset>(ha)
        }
      })
    )
  }
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.event = event.name.split('.')[1]
  hp.ztgQty = pool.ztgQty
  hp.volume = pool.volume
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)
}

export async function poolExit(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {pae, walletId} = getPoolExitEvent(ctx)

  let pool = await store.get(Pool, { where: { poolId: +pae.cpep.poolId.toString() } })
  if (!pool) return

  const oldZtgQty = pool.ztgQty
  const newZtgQty = oldZtgQty - BigInt(pae.transferred[pae.transferred.length - 1].toString()) 
  pool.ztgQty = newZtgQty
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.event = event.name.split('.')[1]
  hp.ztgQty = pool.ztgQty
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)

  const numOfPoolWts = pool.weights.length
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts-1]!.assetId == 'Ztg') {
    const tokenWeightIn = +pool.weights[numOfPoolWts-1]!.len.toString()
    await Promise.all(
      pool.weights.map(async (wt, idx) => {
        if (idx >= pae.transferred.length - 1) return
        let asset = await store.get(Asset, { where: { assetId: wt!.assetId } })
        if (!asset || !asset.amountInPool || !asset.price) return

        const assetWt = +wt!.len.toString()
        const oldAssetQty = asset.amountInPool
        const newAssetQty = oldAssetQty - BigInt(pae.transferred[idx].toString())
        const oldPrice = asset.price
        const newPrice = calcSpotPrice(+newZtgQty.toString(), tokenWeightIn, +newAssetQty.toString(), assetWt)

        asset.price = newPrice
        asset.amountInPool = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        let ha = new HistoricalAsset()
        ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-')+1)
        ha.accountId = walletId
        ha.assetId = asset.assetId
        ha.newPrice = asset.price
        ha.newAmountInPool = asset.amountInPool
        ha.dPrice = newPrice - oldPrice
        ha.dAmountInPool = newAssetQty - oldAssetQty 
        ha.event = event.name.split('.')[1]
        ha.blockNumber = block.height
        ha.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`)
        await store.save<HistoricalAsset>(ha)
      })
    );
  }
}

export async function poolJoin(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {pae, walletId} = getPoolJoinEvent(ctx)

  let pool = await store.get(Pool, { where: { poolId: +pae.cpep.poolId.toString() } })
  if (!pool) return

  const oldZtgQty = pool.ztgQty
  const newZtgQty = oldZtgQty + BigInt(pae.transferred[pae.transferred.length - 1].toString())
  pool.ztgQty = newZtgQty
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.event = event.name.split('.')[1]
  hp.ztgQty = pool.ztgQty
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)

  const numOfPoolWts = pool.weights.length
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts-1]!.assetId == 'Ztg') {
    const tokenWeightIn = +pool.weights[numOfPoolWts-1]!.len.toString()
    await Promise.all(
      pool.weights.map(async (wt, idx) => {
        if (idx >= pae.transferred.length - 1) return
        let asset = await store.get(Asset, { where: { assetId: wt!.assetId } })
        if (!asset || !asset.amountInPool || !asset.price) return
  
        const assetWt = +wt!.len.toString()
        const oldAssetQty = asset.amountInPool
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString())
        const oldPrice = asset.price
        const newPrice = calcSpotPrice(+newZtgQty.toString(), tokenWeightIn, +newAssetQty.toString(), assetWt)
  
        asset.price = newPrice
        asset.amountInPool = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)
  
        let ha = new HistoricalAsset()
        ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-')+1)
        ha.accountId = walletId
        ha.assetId = asset.assetId
        ha.newPrice = asset.price
        ha.newAmountInPool = asset.amountInPool
        ha.dPrice = newPrice - oldPrice
        ha.dAmountInPool = newAssetQty - oldAssetQty
        ha.event = event.name.split('.')[1]
        ha.blockNumber = block.height
        ha.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`)
        await store.save<HistoricalAsset>(ha)
      })
    );
  }
}

export async function swapExactAmountIn(ctx: EventHandlerContext<Store>) {
  const {store, block, event} = ctx
  const {swapEvent, walletId} = getSwapExactAmountInEvent(ctx)

  const txn = whetherBuyOrSell(swapEvent, ctx.event)
  if (!txn) return

  let pool = await store.get(Pool, { where: { poolId: +swapEvent.cpep.poolId.toString() } })
  if (!pool) return

  const swappedAsset = txn == 'Sell' ? swapEvent.assetIn : swapEvent.assetOut
  const ztgQty = txn == 'Sell' ? 
    BigInt(swapEvent.assetAmountOut.toString()) : BigInt(swapEvent.assetAmountIn.toString())
  const swappedAssetQty = txn == 'Sell' ? 
    BigInt(swapEvent.assetAmountIn.toString()) : - BigInt(swapEvent.assetAmountOut.toString())

  const oldZtgQty = pool.ztgQty
  const oldVolume = pool.volume
  const newZtgQty = txn == 'Sell' ? oldZtgQty - ztgQty : oldZtgQty + ztgQty
  const newVolume = oldVolume + ztgQty

  pool.ztgQty = newZtgQty
  pool.volume = newVolume
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.event = event.name.split('.')[1]
  hp.ztgQty = pool.ztgQty
  hp.volume = pool.volume
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)
    
  const numOfPoolWts = pool.weights.length
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts-1]!.assetId == 'Ztg') {
    const tokenWeightIn = +pool.weights[numOfPoolWts-1]!.len.toString()
    await Promise.all(
      pool.weights.map(async wt => {
        if (!wt) return
        const asset = await store.get(Asset, { where: { assetId: wt.assetId } })
        if (!asset || !asset.amountInPool || !asset.price) return

        const assetWt = +wt.len.toString()
        const oldAssetQty = asset.amountInPool
        const oldPrice = asset.price
        let newAssetQty = oldAssetQty

        if (swappedAsset) {
          if (wt.assetId == getAssetId(swappedAsset)) {
            newAssetQty = oldAssetQty + swappedAssetQty
          }
        } else if (event.extrinsic) {
          const args = event.extrinsic.call.args
          const swappedAsset = txn == 'Sell' ? args.assetIn : args.assetOut
          if (swappedAsset && wt.assetId == getAssetId(swappedAsset)) {
            newAssetQty = oldAssetQty + swappedAssetQty
          } else if (args.calls) {
            for (let ext of args.calls as 
              Array<{ __kind: string, value: { __kind: string, assetIn: any, assetOut: any, poolId: string} }> ) {
              const { __kind: method, value: { __kind, assetIn, assetOut, poolId} } = ext;
              if (method == 'Swaps' && __kind == 'swap_exact_amount_in' && 
                poolId == swapEvent.cpep.poolId.toString()) {
                if ((txn == 'Sell' && wt.assetId == getAssetId(assetIn)) ||
                  (txn !== 'Sell' && wt.assetId == getAssetId(assetOut))) {
                  newAssetQty = oldAssetQty + swappedAssetQty
                  break
                }
              }
            }
          }
        }
        const newPrice = calcSpotPrice(+newZtgQty.toString(),tokenWeightIn,+newAssetQty.toString(),assetWt)
        asset.price = newPrice
        asset.amountInPool = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        let ha = new HistoricalAsset()
        ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-')+1)
        ha.accountId = newAssetQty == oldAssetQty ? null : walletId
        ha.assetId = asset.assetId
        ha.ztgTraded = newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume
        ha.newPrice = asset.price
        ha.newAmountInPool = asset.amountInPool
        ha.dPrice = newPrice - oldPrice
        ha.dAmountInPool = newAssetQty - oldAssetQty
        ha.event = event.name.split('.')[1]
        ha.blockNumber = block.height
        ha.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`)
        await store.save<HistoricalAsset>(ha)
      })
    )
  }
}

export async function swapExactAmountOut(ctx: EventHandlerContext<Store>) {
  const {store, block, event} = ctx
  const {swapEvent, walletId} = getSwapExactAmountOutEvent(ctx)

  const txn = whetherBuyOrSell(swapEvent, ctx.event)
  if (!txn) return

  let pool = await store.get(Pool, { where: { poolId: +swapEvent.cpep.poolId.toString() } })
  if (!pool) return

  const swappedAsset = txn == 'Sell' ? swapEvent.assetIn : swapEvent.assetOut
  const ztgQty = txn == 'Sell' ? 
    BigInt(swapEvent.assetAmountOut.toString()) : BigInt(swapEvent.assetAmountIn.toString())
  const swappedAssetQty = txn == 'Sell' ? 
    BigInt(swapEvent.assetAmountIn.toString()) : - BigInt(swapEvent.assetAmountOut.toString())

  const oldZtgQty = pool.ztgQty
  const oldVolume = pool.volume
  const newZtgQty = txn == 'Sell' ? oldZtgQty - ztgQty : oldZtgQty + ztgQty
  const newVolume = oldVolume + ztgQty

  pool.ztgQty = newZtgQty
  pool.volume = newVolume
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`)
  await store.save<Pool>(pool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + pool.poolId
  hp.poolId = pool.poolId
  hp.event = event.name.split('.')[1]
  hp.ztgQty = pool.ztgQty
  hp.volume = pool.volume
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)
    
  const numOfPoolWts = pool.weights.length
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts-1]!.assetId == 'Ztg') {
    const tokenWeightIn = +pool.weights[numOfPoolWts-1]!.len.toString()
    await Promise.all(
      pool.weights.map(async wt => {
        if (!wt) return
        const asset = await store.get(Asset, { where: { assetId: wt.assetId } })
        if (!asset || !asset.amountInPool || !asset.price) return

        const assetWt = +wt.len.toString()
        const oldAssetQty = asset.amountInPool
        const oldPrice = asset.price
        let newAssetQty = oldAssetQty

        if (swappedAsset) {
          if (wt.assetId == getAssetId(swappedAsset)) {
            newAssetQty = oldAssetQty + swappedAssetQty
          }
        } else if (event.extrinsic) {
          const args = event.extrinsic.call.args
          const swappedAsset = txn == 'Sell' ? args.assetIn : args.assetOut
          if (swappedAsset && wt.assetId == getAssetId(swappedAsset)) {
            newAssetQty = oldAssetQty + swappedAssetQty
          } else if (args.calls) {
            for (let ext of args.calls as 
              Array<{ __kind: string, value: { __kind: string, assetIn: any, assetOut: any, poolId: string} }> ) {
              const { __kind: method, value: { __kind, assetIn, assetOut, poolId} } = ext;
              if (method == 'Swaps' && __kind == 'swap_exact_amount_out' && 
                poolId == swapEvent.cpep.poolId.toString()) {
                if ((txn == 'Sell' && wt.assetId == getAssetId(assetIn)) ||
                  (txn !== 'Sell' && wt.assetId == getAssetId(assetOut))) {
                  newAssetQty = oldAssetQty + swappedAssetQty
                  break
                }
              }
            }
          }
        }
        const newPrice = calcSpotPrice(+newZtgQty.toString(),tokenWeightIn,+newAssetQty.toString(),assetWt)
        asset.price = newPrice
        asset.amountInPool = newAssetQty
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        let ha = new HistoricalAsset()
        ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-')+1)
        ha.accountId = newAssetQty == oldAssetQty ? null : walletId
        ha.assetId = asset.assetId
        ha.ztgTraded = newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume
        ha.newPrice = asset.price
        ha.newAmountInPool = asset.amountInPool
        ha.dPrice = newPrice - oldPrice
        ha.dAmountInPool = newAssetQty - oldAssetQty
        ha.event = event.name.split('.')[1]
        ha.blockNumber = block.height
        ha.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`)
        await store.save<HistoricalAsset>(ha)
      })
    )
  }
}