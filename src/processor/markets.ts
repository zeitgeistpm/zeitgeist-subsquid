import * as ss58 from "@subsquid/ss58"
import { Cache, IPFS, Tools } from './util'
import { MarketType as MType } from '@zeitgeistpm/typesV1/dist/interfaces'
import { PredictionMarketsBoughtCompleteSetEvent, PredictionMarketsMarketApprovedEvent, PredictionMarketsMarketCancelledEvent, 
    PredictionMarketsMarketCreatedEvent, PredictionMarketsMarketDisputedEvent, PredictionMarketsMarketInsufficientSubsidyEvent, 
    PredictionMarketsMarketRejectedEvent, PredictionMarketsMarketReportedEvent, PredictionMarketsMarketResolvedEvent, 
    PredictionMarketsMarketStartedWithSubsidyEvent, PredictionMarketsSoldCompleteSetEvent } from '../types/events'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Account, AccountBalance, Asset, CategoryMetadata, HistoricalAccountBalance, HistoricalMarket, Market, MarketDisputeMechanism, MarketPeriod, MarketReport, MarketType, OutcomeReport } from '../model'
import { util } from '@zeitgeistpm/sdk'

export async function predictionMarketBoughtCompleteSet(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, accountId} = getBoughtCompleteSetEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) { return }

    const len = +savedMarket.marketType.categorical!
    for (var i = 0; i < len; i++) {
        const currencyId = util.AssetIdFromString(`[${marketId},${i}]`)
        const ab = await store.get(AccountBalance, { where: { account: acc, assetId: currencyId } })
        if (!ab) { return } 

        var hab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: acc.wallet, assetId: currencyId, event: "Endowed", blockNumber: block.height } })
        if (hab) {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab)
        } else {
            var amount = BigInt(0)
            if (extrinsic?.args[1]) {
                const amt = extrinsic.args[1].value as any
                amount = BigInt(amt.toString())
            } else if (extrinsic?.args[0].name === "calls") {
                for (var ext of extrinsic.args[0].value as Array<{ args: { amount: number, market_id: number }}> ) {
                    const { args: { amount: amt, market_id } } = ext;
                    if (BigInt(market_id) == marketId) {
                        amount = BigInt(amt)
                        break
                    }
                }
            }
            if (amount > BigInt(0)) {
                ab.balance = ab.balance + amount
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                hab = new HistoricalAccountBalance()
                hab.accountId = acc.wallet
                hab.event = event.method
                hab.assetId = ab.assetId
                hab.amount = amount
                hab.balance = ab.balance
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab) 
            }
        }
    }
}

export async function predictionMarketApproved(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, status} = getApprovedEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    if (status.length < 2) {
        savedMarket.status = savedMarket.scoringRule === "CPMM" ? "Active" : "CollectingSubsidy"
    } else {
        savedMarket.status = status.__kind
    }
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketCreated(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, market} = getCreatedEvent(ctx)

    const marketCreator = ss58.codec('zeitgeist').encode(market.creator)
    const marketOracle = ss58.codec('zeitgeist').encode(market.oracle)

    const newMarket = new Market()
    newMarket.id = event.id + `-` + Math.floor(Math.random() * 3) + `-m`
    newMarket.marketId = +marketId.toString()
    newMarket.creator = marketCreator
    newMarket.creation = market.creation.toString()
    newMarket.creatorFee = market.creator_fee.toNumber()
    newMarket.oracle = marketOracle
    newMarket.outcomeAssets = (await createAssetsForMarket(marketId, market.market_type)) as string[]

    const metadata = await decodeMarketMetadata(market.metadata.toString())
    if (metadata) {
        newMarket.slug = metadata.slug
        newMarket.question = metadata.question
        newMarket.description = metadata.description
        newMarket.img = metadata.img

        if (metadata.categories) {
            newMarket.categories = []

            for (let i = 0; i < metadata.categories.length; i++) {
                const cm = new CategoryMetadata()
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

    const marketType = new MarketType()
    if (market.market_type.isCategorical) {
        marketType.categorical = market.market_type.asCategorical.toString()
    } else if (market.market_type.isScalar) {
        marketType.scalar = market.market_type.asScalar.toString()
    }
    newMarket.marketType = marketType

    const period = new MarketPeriod()
    if (market.period.isBlock) {
        period.block = market.period.asBlock.toString()

        const sdk = await Tools.getSDK()
        const now = (await sdk.api.query.timestamp.now()).toString();
        const head = await sdk.api.rpc.chain.getHeader();
        const blockNum = head.number.toNumber();
        const diffInMs = +(sdk.api.consts.timestamp.minimumPeriod).toString() * (market.period.asBlock[1].toNumber() - blockNum);
        newMarket.end = BigInt(now + diffInMs)
    } else if (market.period.isTimestamp) {
        period.timestamp = market.period.asTimestamp.toString()
        newMarket.end = BigInt(market.period.asTimestamp[1])
    }
    newMarket.period = period

    newMarket.scoringRule = market.scoring_rule.toString()
    newMarket.status = market.status.toString()

    const mdm = new MarketDisputeMechanism()
    if (market.mdm.isAuthorized) {
        mdm.authorized = market.mdm.asAuthorized.toString()
    } else if (market.mdm.isCourt) {
        mdm.court = true
    } else if (market.mdm.isSimpleDisputes) {
        mdm.simpleDisputes = true
    }
    newMarket.mdm = mdm

    console.log(`[${event.name}] Saving market: ${JSON.stringify(newMarket, null, 2)}`)
    await store.save<Market>(newMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = newMarket.marketId
    hm.event = event.method
    hm.status = newMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)

    const len = +newMarket.marketType.categorical!
    for (var i = 0; i < len; i++) {
        const asset = new Asset()
        asset.assetId = JSON.stringify(util.AssetIdFromString(`[${marketId},${i}]`))
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
        await store.save<Asset>(asset)
    }
}

export async function predictionMarketStartedWithSubsidy(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, status} = getStartedWithSubsidyEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    if (status.length < 2) {
        savedMarket.status = "Active"
    } else {
        savedMarket.status = status.__kind
    }
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketInsufficientSubsidy(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, status} = getInsufficientSubsidyEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    if (status.length < 2) {
        savedMarket.status = "InsufficientSubsidy"
    } else {
        savedMarket.status = status.__kind
    }
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketReported(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, status, report} = getReportedEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId} })
    if (!savedMarket) return

    const ocr = new OutcomeReport()
    if (report.outcome.asCategorical) {
        ocr.categorical = report.outcome.asCategorical.toNumber()
    } else if (report.outcome.asScalar) {
        ocr.scalar = report.outcome.asScalar.toNumber()
    }
    const mr = new MarketReport()
    mr.at = report.at.toNumber()
    mr.by = report.by.toString()
    mr.outcome = ocr

    if (status.length < 2) {
        savedMarket.status = "Reported"
    } else {
        savedMarket.status = status.__kind
    }
    savedMarket.report = mr
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.report = savedMarket.report
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketDisputed(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, status, report} = getDisputedEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId:  marketId } })
    if (!savedMarket) return

    const ocr = new OutcomeReport()
    if (report.outcome.asCategorical) {
        ocr.categorical = report.outcome.asCategorical.toNumber()
    } else if (report.outcome.asScalar) {
        ocr.scalar = report.outcome.asScalar.toNumber()
    }

    const mr = new MarketReport()
    mr.at = report.at ? report.at.toNumber() : block.height
    mr.by = report.by ? report.by.toString() : extrinsic?.signer
    mr.outcome = ocr

    if (status.length < 2) {
        savedMarket.status = "Disputed"
    } else {
        savedMarket.status = status.__kind
    }
    savedMarket.report = mr
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.report = savedMarket.report
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketRejected(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId} = getRejectedEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    savedMarket.status = "Rejected"
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketCancelled(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId} = getCancelledEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    savedMarket.status = "Cancelled"
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketResolved(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, status, report} = getResolvedEvent(ctx)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    const ocr = new OutcomeReport()
    if (report.asCategorical) {
        ocr.categorical = report.asCategorical.toNumber()
    } else if (report.asScalar) {
        ocr.scalar = report.asScalar.toNumber()
    } else if (typeof report == "number") {
        if (savedMarket.marketType.scalar == null) ocr.categorical = report
        else ocr.scalar = report
    }

    if (savedMarket.report) { savedMarket.report.outcome = ocr }
    if (status.length < 2) {
        savedMarket.status = "Resolved"
    } else {
        savedMarket.status = status.__kind
    }
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.report = savedMarket.report
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketSoldCompleteSet(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, accountId} = getSoldCompleteSetEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    const hm = new HistoricalMarket()
    hm.id = event.id + `-` + Math.floor(Math.random() * 3) + `-hm`
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) { return }

    const len = +savedMarket.marketType.categorical!
    for (var i = 0; i < len; i++) {
        const currencyId = util.AssetIdFromString(`[${marketId},${i}]`)
        const ab = await store.get(AccountBalance, { where: { account: acc, assetId: currencyId } })
        if (!ab) { return }

        var amount = BigInt(0)
        if (extrinsic?.args[1]) {
            const amt = extrinsic.args[1].value as any
            amount = BigInt(amt.toString())
        } else if (extrinsic?.args[0].name === "calls") {
            for (var ext of extrinsic.args[0].value as Array<{ args: { amount: number, market_id: number }}> ) {
                const { args: { amount: amt, market_id } } = ext;
                if (BigInt(market_id) == marketId) {
                    amount = BigInt(amt)
                    break
                }
            }
        }
        if (amount > BigInt(0)) {
            ab.balance = ab.balance - amount
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AccountBalance>(ab)

            const hab = new HistoricalAccountBalance()
            hab.accountId = acc.wallet
            hab.event = event.method
            hab.assetId = ab.assetId
            hab.amount = - amount
            hab.balance = ab.balance
            hab.blockNumber = block.height
            hab.timestamp = new Date(block.timestamp)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab) 
        }
    }
}

interface BoughtCompleteSetEvent {
    marketId: bigint
    accountId: Uint8Array
}

interface ApprovedEvent {
    marketId: bigint
    status: any
}

interface CreatedEvent {
    marketId: bigint
    market: any
}

interface StartedWithSubsidyEvent {
    marketId: bigint
    status: any
}

interface InsufficientSubsidyEvent {
    marketId: bigint
    status: any
}

interface ReportedEvent {
    marketId: bigint
    status: any
    report: any
}

interface DisputedEvent {
    marketId: bigint
    status: any
    report: any
}

interface RejectedEvent {
    marketId: bigint
}

interface CancelledEvent {
    marketId: bigint
}

interface ResolvedEvent {
    marketId: bigint
    status: any
    report: any
}

interface SoldCompleteSetEvent {
    marketId: bigint
    accountId: Uint8Array
}

function getBoughtCompleteSetEvent(ctx: EventHandlerContext): BoughtCompleteSetEvent {
    const event = new PredictionMarketsBoughtCompleteSetEvent(ctx)
    const [marketId, accountId] = event.asLatest
    return {marketId, accountId}
}

function getApprovedEvent(ctx: EventHandlerContext): ApprovedEvent {
    const event = new PredictionMarketsMarketApprovedEvent(ctx)
    if (event.isV23) {
        const marketId = event.asV23
        const status = ""
        return {marketId, status}
    } else if (event.isV29) {
        const [marketId, status] = event.asV29
        return {marketId, status}
    } else {
        const [marketId, status] = event.asLatest
        return {marketId, status}
    }
}

function getCreatedEvent(ctx: EventHandlerContext): CreatedEvent {
    const event = new PredictionMarketsMarketCreatedEvent(ctx)
    if (event.isV23) {
        const [marketId, market] = event.asV23
        return {marketId, market}
    } else if (event.isV29) {
        const [marketId, market] = event.asV29
        return {marketId, market}
    } else if (event.isV32) {
        const [marketId, market] = event.asV32
        return {marketId, market}
    } else {
        const [marketId, market] = event.asLatest
        return {marketId, market}
    }
}

function getStartedWithSubsidyEvent(ctx: EventHandlerContext): StartedWithSubsidyEvent {
    const event = new PredictionMarketsMarketStartedWithSubsidyEvent(ctx)
    if (event.isV23) {
        const marketId = event.asV23
        const status = ""
        return {marketId, status}
    } else if (event.isV29) {
        const [marketId, status] = event.asV29
        return {marketId, status}
    } else {
        const [marketId, status] = event.asLatest
        return {marketId, status}
    }
}

function getInsufficientSubsidyEvent(ctx: EventHandlerContext): InsufficientSubsidyEvent {
    const event = new PredictionMarketsMarketInsufficientSubsidyEvent(ctx)
    if (event.isV23) {
        const marketId = event.asV23
        const status = ""
        return {marketId, status}
    } else if (event.isV29) {
        const [marketId, status] = event.asV29
        return {marketId, status}
    } else {
        const [marketId, status] = event.asLatest
        return {marketId, status}
    }
}

function getReportedEvent(ctx: EventHandlerContext): ReportedEvent {
    const event = new PredictionMarketsMarketReportedEvent(ctx)
    if (event.isV23) {
        const [marketId, report] = event.asV23
        const status = ""
        return {marketId, status, report}
    } else if (event.isV29) {
        const [marketId, status, report] = event.asV29
        return {marketId, status, report}
    } else {
        const [marketId, status, report] = event.asLatest
        return {marketId, status, report}
    }
}

function getDisputedEvent(ctx: EventHandlerContext): DisputedEvent {
    const event = new PredictionMarketsMarketDisputedEvent(ctx)
    if (event.isV23) {
        const [marketId, report] = event.asV23
        const status = ""
        return {marketId, status, report}
    } else if (event.isV29) {
        const [marketId, status, report] = event.asV29
        return {marketId, status, report}
    } else {
        const [marketId, status, report] = event.asLatest
        return {marketId, status, report}
    }
}

function getRejectedEvent(ctx: EventHandlerContext): RejectedEvent {
    const event = new PredictionMarketsMarketRejectedEvent(ctx)
    if (event.isV23) {
        const marketId = event.asV23
        return {marketId}
    } else {
        const marketId = event.asLatest
        return {marketId}
    }
}

function getCancelledEvent(ctx: EventHandlerContext): CancelledEvent {
    const event = new PredictionMarketsMarketCancelledEvent(ctx)
    if (event.isV23) {
        const marketId = event.asV23
        return {marketId}
    } else {
        const marketId = event.asLatest
        return {marketId}
    }
}

function getResolvedEvent(ctx: EventHandlerContext): ResolvedEvent {
    const event = new PredictionMarketsMarketResolvedEvent(ctx)
    if (event.isV23) {
        const [marketId, report] = event.asV23
        const status = ""
        return {marketId, status, report}
    } else if (event.isV29) {
        const [marketId, status, report] = event.asV29
        return {marketId, status, report}
    } else {
        const [marketId, status, report] = event.asLatest
        return {marketId, status, report}
    }
}

function getSoldCompleteSetEvent(ctx: EventHandlerContext): SoldCompleteSetEvent {
    const event = new PredictionMarketsSoldCompleteSetEvent(ctx)
    const [marketId, accountId] = event.asLatest
    return {marketId, accountId}
}

async function createAssetsForMarket(
    marketId: bigint,
    marketType: MType
): Promise<string[]> {
    const sdk = await Tools.getSDK()
    return marketType.isCategorical
      ? [...Array(marketType.asCategorical.toNumber()).keys()].map((catIdx) => {
          return sdk.api.createType("Asset", {
            categoricalOutcome: [marketId, catIdx],
          });
        })
      : ["Long", "Short"].map((pos) => {
          const position = sdk.api.createType("ScalarPosition", pos);
          return sdk.api.createType("Asset", {
            scalarOutcome: [marketId, position.toString()],
          });
        });
}

async function decodeMarketMetadata(
    metadata: string,
): Promise<DecodedMarketMetadata | undefined> {

    if (metadata) {
        var raw = await (await Cache.init()).getMeta(metadata)
        if (raw) {
            return raw !== '0' ? JSON.parse(raw) as DecodedMarketMetadata : undefined
        } else {
            try {
                const ipfs = new IPFS();
                raw = await ipfs.read(metadata);
            } catch (err) {
                console.error(err);
                await (await Cache.init()).setMeta(metadata, '0')
            }
            await (await Cache.init()).setMeta(metadata, raw ? raw : '0')
            return raw ? JSON.parse(raw) as DecodedMarketMetadata : undefined
        }
    }
}

type DecodedMarketMetadata = {
    slug: string
    question: string
    description: string
    categories?: CategoryData[]
    tags?: string[]
    img?: string
}

type CategoryData = {
    name: string
    ticker?: string
    img?: string
    color?: string
}