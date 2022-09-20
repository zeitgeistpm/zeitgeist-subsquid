import { encodeAddress } from '@polkadot/keyring'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import * as ss58 from '@subsquid/ss58'
import { util } from '@zeitgeistpm/sdk'
import { Like } from 'typeorm'
import { Account, AccountBalance, Asset, CategoryMetadata, HistoricalAccountBalance, HistoricalAsset, HistoricalMarket, 
  Market, MarketDisputeMechanism, MarketPeriod, MarketReport, MarketType, OutcomeReport } from '../../model'
import { createAssetsForMarket, decodeMarketMetadata } from '../helper'
import { Tools } from '../util'
import { getBoughtCompleteSetEvent, getMarketApprovedEvent, getMarketClosedEvent, getMarketCreatedEvent, 
  getMarketDisputedEvent, getMarketExpiredEvent, getMarketInsufficientSubsidyEvent, getMarketRejectedEvent, 
  getMarketReportedEvent, getMarketResolvedEvent, getMarketStartedWithSubsidyEvent, getSoldCompleteSetEvent, 
  getTokensRedeemedEvent } from './types'


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
      } else if (event.extrinsic) {
        if (event.extrinsic.call.args.amount) {
          const amount = event.extrinsic.call.args.amount.toString()
          amt = BigInt(amount)
        } else if (event.extrinsic.call.args.calls) {
          for (let ext of event.extrinsic.call.args.calls as 
            Array<{ __kind: string, value: { __kind: string, amount: string, marketId: string} }> ) {
            const { __kind: extrinsic, value: { __kind: method, amount: amount, marketId: id} } = ext;
            if (extrinsic == "PredictionMarkets" && method == "buy_complete_set" && +id == marketId) {
              amt = BigInt(amount)
              break
            }
          }
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

export async function marketClosed(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId} = getMarketClosedEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  savedMarket.status = "Closed"
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
    if (type.value.start) {
      marketType.scalar = type.value.start.toString() + "," + type.value.end.toString()
    } else {
      marketType.scalar = type.value.toString()
    }
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

export async function marketDisputed(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId, status, report} = getMarketDisputedEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId:  marketId } })
  if (!savedMarket) return

  let ocr = new OutcomeReport()
  if (report.outcome.__kind == 'Categorical') {
    ocr.categorical = report.outcome.value
  } else if (report.outcome.__kind == 'Scalar') {
    ocr.scalar = report.outcome.value
  }

  let mr = new MarketReport()
  if (report.at) {
    mr.at = +report.at.toString()
  }
  if (report.by) {
    mr.by = ss58.codec('zeitgeist').encode(report.by)
  }
  mr.outcome = ocr

  if (status.length < 2) {
    savedMarket.status = 'Disputed'
  } else {
    savedMarket.status = status
  }
  savedMarket.report = mr
  console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
  await store.save<Market>(savedMarket)

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + savedMarket.marketId
  hm.marketId = savedMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.status = savedMarket.status
  hm.report = savedMarket.report
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)
}

export async function marketExpired(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, event, block} = ctx
  const {marketId} = getMarketExpiredEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  savedMarket.status = "Expired"
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

export async function marketInsufficientSubsidy(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId, status} = getMarketInsufficientSubsidyEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  if (status.length < 2) {
    savedMarket.status = "Insufficient Subsidy"
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

export async function marketReported(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId, status, report} = getMarketReportedEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId} })
  if (!savedMarket) return

  let ocr = new OutcomeReport()
  if (report.outcome.__kind == 'Categorical') {
    ocr.categorical = report.outcome.value
  } else if (report.outcome.__kind == 'Scalar') {
    ocr.scalar = report.outcome.value
  }

  let mr = new MarketReport()
  if (report.at) {
    mr.at = +report.at.toString()
  }
  if (report.by) {
    mr.by = ss58.codec('zeitgeist').encode(report.by)
  }
  mr.outcome = ocr

  if (status.length < 2) {
    savedMarket.status = 'Reported'
  } else {
    savedMarket.status = status
  }
  savedMarket.report = mr
  console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
  await store.save<Market>(savedMarket)

  let hm = new HistoricalMarket()
  hm.id = event.id + '-' + savedMarket.marketId
  hm.marketId = savedMarket.marketId
  hm.event = event.name.split('.')[1]
  hm.status = savedMarket.status
  hm.report = savedMarket.report
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)
}

export async function marketResolved(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId, status, report} = getMarketResolvedEvent(ctx)

  const savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  let ocr = new OutcomeReport()
  if (report.__kind && savedMarket.report) {
    if (report.__kind == 'Categorical') {
      ocr.categorical = report.value
    } else if (report.__kind == 'Scalar') {
      ocr.scalar = report.value
    }
    savedMarket.report.outcome = ocr
  }
  savedMarket.resolvedOutcome = report.value.toString()

  const numOfOutcomeAssets = savedMarket.outcomeAssets.length;
  if (savedMarket.resolvedOutcome && numOfOutcomeAssets > 0) {
    for (let i = 0; i < numOfOutcomeAssets; i++) {
      const assetId = savedMarket.outcomeAssets[i]!
      let asset = await store.get(Asset, { where: { assetId: assetId } })
      if (!asset) return
      const oldPrice = asset.price
      const oldAssetQty = asset.amountInPool
      asset.price = (i == +savedMarket.resolvedOutcome) ? 1 : 0
      asset.amountInPool = (i == +savedMarket.resolvedOutcome) ? oldAssetQty : BigInt(0)
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
      await store.save<Asset>(asset)

      let ha = new HistoricalAsset()
      ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-')+1)
      ha.assetId = asset.assetId
      ha.newPrice = asset.price
      ha.newAmountInPool = asset.amountInPool
      ha.dPrice = oldPrice ? asset.price - oldPrice : null
      ha.dAmountInPool = oldAssetQty && asset.amountInPool ? asset.amountInPool - oldAssetQty : null
      ha.event = event.name.split('.')[1]
      ha.blockNumber = block.height
      ha.timestamp = new Date(block.timestamp)
      console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`)
      await store.save<HistoricalAsset>(ha)

      const abs = await store.find(AccountBalance, { where: { assetId: assetId } })
      await Promise.all(
        abs.map(async ab => {
          const keyword = ab.id.substring(ab.id.lastIndexOf('-')+1, ab.id.length)
          let acc = await store.get(Account, { where: { id: Like(`%${keyword}%`), poolId: undefined}})
          if (acc != null && ab.balance > BigInt(0)) {
            const oldBalance = ab.balance
            const oldValue = ab.value
            ab.balance = (i == +savedMarket.resolvedOutcome!) ? ab.balance : BigInt(0)
            ab.value = asset!.price ? Number(ab.balance) * asset!.price : null
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AccountBalance>(ab)

            acc.pvalue = oldValue && ab.value ? acc.pvalue - oldValue + ab.value : acc.pvalue
            console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
            await store.save<Account>(acc)

            let hab = new HistoricalAccountBalance()
            hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5)
            hab.accountId = acc.accountId
            hab.event = event.name.split('.')[1]
            hab.assetId = ab.assetId
            hab.dBalance = ab.balance - oldBalance
            hab.balance = ab.balance
            hab.dValue = oldValue && ab.value ? ab.value - oldValue : null
            hab.value = ab.value
            hab.pvalue = acc.pvalue
            hab.blockNumber = block.height
            hab.timestamp = new Date(block.timestamp)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab)
          }
        })
      );
    }
  }

  if (status.length < 2) {
    savedMarket.status = 'Resolved'
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
  hm.report = savedMarket.report
  hm.resolvedOutcome = savedMarket.resolvedOutcome
  hm.blockNumber = block.height
  hm.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
  await store.save<HistoricalMarket>(hm)
}

export async function marketStartedWithSubsidy(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {marketId, status} = getMarketStartedWithSubsidyEvent(ctx)

  let savedMarket = await store.get(Market, { where: { marketId: marketId } })
  if (!savedMarket) return

  if (status.length < 2) {
    savedMarket.status = "Active"
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
    } else if (event.extrinsic) {
      if (event.extrinsic.call.args.amount) {
        const amount = event.extrinsic.call.args.amount.toString()
        amt = BigInt(amount)
      } else if (event.extrinsic.call.args.calls) {
        for (let ext of event.extrinsic.call.args.calls as 
          Array<{ __kind: string, value: { __kind: string, amount: string, marketId: string} }> ) {
          const { __kind: extrinsic, value: { __kind: method, amount: amount, marketId: id} } = ext;
          if (extrinsic == "PredictionMarkets" && method == "sell_complete_set" && +id == marketId) {
            amt = BigInt(amount)
            break
          }
        }
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

export async function tokensRedeemed(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {assetId, amtRedeemed, walletId} = getTokensRedeemedEvent(ctx)

  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) { return }

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: assetId })
  if (!ab) { return }

  let thab = await store.get(HistoricalAccountBalance, { where: 
    { accountId: walletId, assetId: "Ztg", event: "Transfer", blockNumber: block.height } })
  if (thab) {
    thab.event = event.name.split('.')[1]
    console.log(`[${event.name}] Updating historical account balance: ${JSON.stringify(thab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(thab)
  }

  const oldBalance = ab.balance
  const oldValue = ab.value ? ab.value : null
  ab.balance = ab.balance - amtRedeemed
  ab.value = Number(ab.balance)
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  acc.pvalue = oldValue ? acc.pvalue - oldValue + ab.value : acc.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await store.save<Account>(acc)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = ab.balance - oldBalance
  hab.balance = ab.balance
  hab.dValue = oldValue ? ab.value - oldValue : null
  hab.value = ab.value
  hab.pvalue = acc.pvalue
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}