import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import * as ss58 from '@subsquid/ss58'
import { Account, AccountBalance, Asset, HistoricalAccountBalance, HistoricalAsset, 
  HistoricalMarket, HistoricalPool, Market, Pool, Weight } from '../../model'
import { calcSpotPrice, getAssetId } from '../helper'
import { getPoolCreateEvent } from './types'

export async function swapsPoolCreate(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {cpep, pool, amount} = getPoolCreateEvent(ctx)

  const hab = await store.get(HistoricalAccountBalance, { where: { assetId: 'Ztg', event: 'NewAccount', 
    blockNumber: block.height } })

  let newPool = new Pool()
  newPool.id = event.id + '-' + cpep.poolId 
  newPool.poolId = +cpep.poolId.toString()
  newPool.accountId = hab ? hab.accountId : null
  newPool.marketId = +pool.marketId.toString()
  newPool.poolStatus = pool.poolStatus.__kind
  newPool.scoringRule = pool.scoringRule.__kind
  newPool.swapFee = pool.swapFee ? pool.swapFee.toString() : ''
  newPool.totalSubsidy = pool.totalSubsidy ? pool.totalSubsidy.toString() : ''
  newPool.totalWeight = pool.totalWeight ? pool.totalWeight.toString() : ''
  newPool.weights = []
  newPool.ztgQty = amount !== BigInt(0) ? amount : BigInt(1000000000000)
  newPool.volume = BigInt(0)
  newPool.createdAt = new Date(block.timestamp)
  newPool.baseAsset = pool.baseAsset.__kind

  let acc = await store.get(Account, { where: { accountId: hab?.accountId } })
  if (acc) {
    acc.poolId = newPool.poolId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
  }

  let market = await store.get(Market, { where: { marketId: newPool.marketId } })
  if (market) {
    market.poolId = newPool.poolId
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

  if (pool.weights && pool.weights[pool.weights.length - 1][0].__kind == 'Ztg') {
    const tokenWeightIn = +pool.weights[pool.weights.length - 1][1].toString()

    Object.entries(pool.weights).map(async (wt) => {
      let weight = new Weight()
      weight.assetId = getAssetId(wt[1][0])
      weight.len = wt[1][1]
      newPool.weights.push(weight)
      
      if (weight.assetId.length > 5) {
        let asset = await store.get(Asset, { where: { assetId: weight.assetId } })
        if (!asset) { return }
    
        let ab = await store.findOneBy(AccountBalance, { account: { accountId: acc?.accountId }, assetId: asset.assetId })
        const tokenBalanceOut = ab ? +ab.balance.toString() : 1000000000000
    
        const spotPrice = calcSpotPrice(+newPool.ztgQty.toString(),tokenWeightIn,tokenBalanceOut,+weight.len.toString())
        asset.poolId = newPool.poolId
        asset.price = +spotPrice.toString()
        asset.amountInPool = BigInt(tokenBalanceOut)
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)

        let ha = new HistoricalAsset()
        ha.id = event.id + '-' + newPool.marketId + wt[0]
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
    });
  }
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(newPool, null, 2)}`)
  await store.save<Pool>(newPool)

  let hp = new HistoricalPool()
  hp.id = event.id + '-' + newPool.poolId
  hp.poolId = newPool.poolId
  hp.event = event.name.split('.')[1]
  hp.ztgQty = newPool.ztgQty
  hp.volume = newPool.volume
  hp.blockNumber = block.height
  hp.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`)
  await store.save<HistoricalPool>(hp)
}