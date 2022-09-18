import { encodeAddress } from '@polkadot/keyring'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { util } from '@zeitgeistpm/sdk'
import { Account, AccountBalance, Asset, CategoryMetadata, HistoricalAccountBalance, HistoricalMarket, 
  Market, MarketDisputeMechanism, MarketPeriod, MarketType } from '../../model'
import { createAssetsForMarket, decodeMarketMetadata } from '../helper'
import { Tools } from '../../processor/util'
import { getBoughtCompleteSetEvent, getMarketApprovedEvent, getMarketCreatedEvent, getMarketRejectedEvent, getSoldCompleteSetEvent } from './types'


export async function boughtCompleteSet(ctx: EventHandlerContext<Store>) {
  const {store, block, event} = ctx
  const {marketId, amount, walletId} = getBoughtCompleteSetEvent(ctx)

  const savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + savedMarket.marketId
  hm.marketId = savedMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)

  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) { return }

  const len = +savedMarket.marketType.categorical!
  for (let i = 0; i < len; i++) {
    const currencyId = JSON.stringify(util.AssetIdFromString(`[${marketId},${i}]`))
    let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: currencyId })
    if (!ab) { return }

    let hab = await store.get(HistoricalAccountBalance, { where: 
      { accountId: acc.accountId, assetId: currencyId, event: "Endowed", blockNumber: block.height } })
    if (hab) {
      hab.event = hab.event.concat(event.name.split('.')[1])
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(hab)
    } else {
      const asset = await store.get(Asset, { where: { assetId: currencyId } })
      
      let amt = BigInt(0)
      if (amount !== BigInt(0)) {
        amt = amount
      } else {
        if (event.extrinsic && event.extrinsic.call) {
          const amount = event.extrinsic.call.args.amount as any
          amt = BigInt(amount.toString())
        }
      }
      ab.balance = ab.balance + amt
      const oldValue = ab.value!
      ab.value = asset ? asset.price ? asset.price * Number(ab.balance) : 0 : null
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
      await store.save<AccountBalance>(ab)

      acc.pvalue = ab.value ? acc.pvalue! - oldValue + ab.value! : acc.pvalue
      console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
      await store.save<Account>(acc)

      hab = new HistoricalAccountBalance()
      hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
      hab.accountId = acc.accountId
      hab.event = event.name.split('.')[1]
      hab.assetId = ab.assetId
      hab.dBalance = amt
      hab.balance = ab.balance
      hab.dValue = ab.value ? ab.value - oldValue : 0
      hab.value = ab.value
      hab.pvalue = acc.pvalue
      hab.blockNumber = block.height
      hab.timestamp = new Date(block.timestamp)
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(hab)
    }
  }
}

export async function marketApproved(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId, status} = getMarketApprovedEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  if (status.length < 2) {
    savedMarket.status = savedMarket.scoringRule === "CPMM" ? "Active" : "CollectingSubsidy"
  } else {
    savedMarket.status = status
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
  await store.save<Market>(savedMarket)

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + savedMarket.marketId
  hm.marketId = savedMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.status = savedMarket.status
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)
}

export async function marketCreated(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, event, block} = ctx
  const {marketId, marketAccountId, market} = getMarketCreatedEvent(ctx)

  if (marketAccountId.length > 2) {
    let acc = await store.findOneBy(Account, { accountId: marketAccountId })
    if (acc) {
      acc.marketId = +marketId.toString()
      console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
      await store.save<Account>(acc)
    } else {
      let newAcc = new Account()
      newAcc.id = event.id + '-' + marketAccountId.substring(marketAccountId.length - 5)
      newAcc.accountId = marketAccountId.toString()
      newAcc.marketId = +marketId.toString()
      newAcc.pvalue = 0
      console.log(`[${event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`)
      await store.save<Account>(newAcc)

      let ab = new AccountBalance()
      ab.id = event.id + '-' + marketAccountId.substring(marketAccountId.length - 5)
      ab.account = newAcc
      ab.assetId = "Ztg"
      ab.balance = BigInt(0)
      ab.value = Number(ab.balance)
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
      await store.save<AccountBalance>(ab)

      let hab = new HistoricalAccountBalance()
      hab.id = event.id + '-' + marketAccountId.substring(marketAccountId.length - 5)
      hab.accountId = newAcc.accountId
      hab.event = event.name.split('.')[1]
      hab.assetId = ab.assetId
      hab.dBalance = BigInt(0)
      hab.balance = ab.balance
      hab.dValue = Number(hab.dBalance)
      hab.value = Number(hab.balance)
      hab.pvalue = 0
      hab.blockNumber = block.height
      hab.timestamp = new Date(block.timestamp)
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(hab)
    }
  }

  let newMarket = new Market()
  newMarket.id = event.id + '-' + marketId
  newMarket.marketId = +marketId
  newMarket.creator = encodeAddress(market.creator, 73)
  newMarket.creation = market.creation.__kind;
  newMarket.creatorFee = +market.creatorFee.toString()
  newMarket.oracle = encodeAddress(market.oracle, 73)
  newMarket.scoringRule = market.scoringRule.__kind
  newMarket.status = market.status.__kind
  newMarket.outcomeAssets = (await createAssetsForMarket(marketId, market.marketType)) as string[]
  newMarket.metadata = market.metadata.toString()

  const metadata = await decodeMarketMetadata(market.metadata.toString())
  if (metadata) {
    newMarket.slug = metadata.slug
    newMarket.question = metadata.question
    newMarket.description = metadata.description
    newMarket.img = metadata.img
    
    if ((market.marketType as any).scalar) {
      newMarket.scalarType = metadata.scalarType;
    }

    if (metadata.categories) {
      newMarket.categories = []

      for (let i = 0; i < metadata.categories.length; i++) {
        let cm = new CategoryMetadata()
        cm.name = metadata.categories[i].name
        cm.ticker = metadata.categories[i].ticker
        cm.img = metadata.categories[i].img
        cm.color = metadata.categories[i].color
        newMarket.categories.push(cm)
      }
    }
    
    if (metadata.tags) {
      newMarket.tags = []
      for (let i = 0; i < metadata.tags.length; i++) {
        newMarket.tags.push(metadata.tags[i])
      }
    }
  }

  let marketType = new MarketType()
  const type = market.marketType
  if (type.__kind == 'Categorical') {
    marketType.categorical = type.value.toString()
  } else if (type.__kind == 'Scalar') {
    marketType.scalar = type.value.toString()
  }
  newMarket.marketType = marketType

  let period = new MarketPeriod()
  const p = market.period
  if (p.__kind == 'Block') {
    period.block = p.start.toString() + "," + p.end.toString()

    const sdk = await Tools.getSDK()
    const now = +(await sdk.api.query.timestamp.now()).toString()
    const head = await sdk.api.rpc.chain.getHeader()
    const blockNum = head.number.toNumber()
    const diffInMs = +(sdk.api.consts.timestamp.minimumPeriod).toString() * (Number(p.end) - blockNum)
    newMarket.end = BigInt(now + diffInMs)
  } else if (p.__kind == 'Timestamp') {
    period.timestamp = p.start.toString() + "," + p.end.toString()
    newMarket.end = BigInt(p.end) 
  }
  newMarket.period = period

  let disputeMechanism = new MarketDisputeMechanism()
  const d = market.disputeMechanism
  if (d.__kind == 'Authorized') {
    disputeMechanism.authorized = encodeAddress(d.value, 73)
  } else if (d.__kind == 'Court') {
    disputeMechanism.court = true
  } else if (d.__kind == 'SimpleDisputes') {
    disputeMechanism.simpleDisputes = true
  }
  newMarket.disputeMechanism = disputeMechanism

  console.log(`[${event.name}] Saving market: ${JSON.stringify(newMarket, null, 2)}`)
  await store.save<Market>(newMarket)

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + newMarket.marketId
  hm.marketId = newMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.status = newMarket.status
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)

  if (newMarket.outcomeAssets && newMarket.outcomeAssets.length) {
    for (let i = 0; i < newMarket.outcomeAssets.length; i++) {
      let asset = new Asset()
      asset.id = event.id + '-' + newMarket.marketId + i
      asset.assetId = newMarket.outcomeAssets[i]!
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
      await store.save<Asset>(asset)
    }
  }
}

export async function marketRejected(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId} = getMarketRejectedEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  savedMarket.status = "Rejected"
  console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
  await store.save<Market>(savedMarket)

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + savedMarket.marketId
  hm.marketId = savedMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.status = savedMarket.status
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)
}

export async function soldCompleteSet(ctx: EventHandlerContext<Store>) {
  const {store, block, event} = ctx
  const {marketId, amount, walletId} = getSoldCompleteSetEvent(ctx)

  const savedMarket = await store.get(Market, { where: { marketId: +marketId.toString() } })
  if (!savedMarket) return

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + savedMarket.marketId
  hm.marketId = savedMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)

  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) { return }

  const len = +savedMarket.marketType.categorical!
  for (let i = 0; i < len; i++) {
    const currencyId = JSON.stringify(util.AssetIdFromString(`[${marketId},${i}]`))
    let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: currencyId })
    if (!ab) { return }

    const asset = await store.get(Asset, { where: { assetId: currencyId } })

    let amt = BigInt(0)
    if (amount !== BigInt(0)) {
      amt = amount
    } else {
      if (event.extrinsic && event.extrinsic.call) {
        const amount = event.extrinsic.call.args.amount as any
        amt = BigInt(amount.toString())
      }
    }
    ab.balance = ab.balance - amt
    const oldValue = ab.value!
    ab.value = asset ? asset.price ? asset.price * Number(ab.balance) : 0 : null
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    acc.pvalue = ab.value ? acc.pvalue! - oldValue + ab.value! : acc.pvalue
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    let hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.name.split('.')[1]
    hab.assetId = ab.assetId
    hab.dBalance = - amt
    hab.balance = ab.balance
    hab.dValue = ab.value ? ab.value - oldValue : 0
    hab.value = ab.value
    hab.pvalue = acc.pvalue
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
  }
}