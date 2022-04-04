import * as ss58 from "@subsquid/ss58"
import { encodeAddress } from '@polkadot/keyring'
import { Cache, IPFS, Tools } from './util'
import { PredictionMarketsBoughtCompleteSetEvent, PredictionMarketsMarketApprovedEvent, PredictionMarketsMarketCancelledEvent, 
    PredictionMarketsMarketCreatedEvent, PredictionMarketsMarketDisputedEvent, PredictionMarketsMarketInsufficientSubsidyEvent, 
    PredictionMarketsMarketRejectedEvent, PredictionMarketsMarketReportedEvent, PredictionMarketsMarketResolvedEvent, 
    PredictionMarketsMarketStartedWithSubsidyEvent, PredictionMarketsSoldCompleteSetEvent } from '../types/events'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Account, AccountBalance, Asset, CategoryMetadata, HistoricalAccountBalance, HistoricalMarket, 
    Market, MarketDisputeMechanism, MarketPeriod, MarketReport, MarketType, OutcomeReport } from '../model'
import { util } from '@zeitgeistpm/sdk'
import { Market as t_Market, MarketId as t_MarketId} from '@zeitgeistpm/typesV2/dist/interfaces'

export async function predictionMarketBoughtCompleteSet(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, amount, accountId} = getBoughtCompleteSetEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    const hm = new HistoricalMarket()
    hm.id = event.id + '-' + savedMarket.marketId
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) { return }

    const len = +savedMarket.marketType.categorical!
    for (var i = 0; i < len; i++) {
        const currencyId = util.AssetIdFromString(`[${marketId},${i}]`)
        const ab = await store.get(AccountBalance, { where: { account: acc, assetId: currencyId } })
        if (!ab) { return } 

        var hab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: acc.accountId, assetId: currencyId, event: "Endowed", blockNumber: block.height } })
        if (hab) {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab)
        } else {
            const asset = await store.get(Asset, { where: { assetId: currencyId } })
            
            var amt = BigInt(0)
            if (amount !== BigInt(0)) {
                amt = amount
            } else {
                if (extrinsic?.args[1]) {
                    const amount = extrinsic.args[1].value as any
                    amt = BigInt(amount.toString())
                } else if (extrinsic?.args[0].name === "calls") {
                    for (var ext of extrinsic.args[0].value as Array<{ args: { amount: number, market_id: number }}> ) {
                        const { args: { amount: amount, market_id } } = ext;
                        if (market_id && BigInt(market_id) == marketId) {
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
            hab.event = event.method
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
    hm.id = event.id + '-' + savedMarket.marketId
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

    const marketCreator = encodeAddress(market.creator, +(await Tools.getSDK()).api.consts.system.ss58Prefix.toString())
    const marketOracle = encodeAddress(market.oracle, +(await Tools.getSDK()).api.consts.system.ss58Prefix.toString())

    const newMarket = new Market()
    newMarket.id = event.id + '-' + marketId 
    newMarket.marketId = +marketId.toString()
    newMarket.creator = marketCreator
    newMarket.creation = market.creation.toString()
    newMarket.creatorFee = +market.creatorFee.toString()
    newMarket.oracle = marketOracle
    newMarket.scoringRule = market.scoringRule.toString()
    newMarket.status = market.status.toString()
    newMarket.outcomeAssets = (await createAssetsForMarket(marketId, market.marketType)) as string[]

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
    const type = market.marketType as any
    if (type.categorical) {
        marketType.categorical = type.categorical.toString()
    } else if (type.scalar) {
        marketType.scalar = type.scalar.toString()
    }
    newMarket.marketType = marketType

    const period = new MarketPeriod()
    const p = market.period as any
    if (p.block) {
        period.block = p.block.toString()

        const sdk = await Tools.getSDK()
        const now = +(await sdk.api.query.timestamp.now()).toString()
        const head = await sdk.api.rpc.chain.getHeader()
        const blockNum = head.number.toNumber()
        const diffInMs = +(sdk.api.consts.timestamp.minimumPeriod).toString() * (p.block[1] - blockNum)
        newMarket.end = BigInt(now + diffInMs)
    } else if (p.timestamp) {
        period.timestamp = p.timestamp.toString()
        newMarket.end = BigInt(p.timestamp[1].toString())
    }
    newMarket.period = period

    const mdm = new MarketDisputeMechanism()
    const dispute = market.mdm as any
    if (dispute.authorized) {
        mdm.authorized = dispute.authorized.toString()
    } else if (dispute.court !== undefined) {
        mdm.court = true
    } else if (dispute.simpleDisputes !== undefined) {
        mdm.simpleDisputes = true
    }
    newMarket.mdm = mdm

    console.log(`[${event.name}] Saving market: ${JSON.stringify(newMarket, null, 2)}`)
    await store.save<Market>(newMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + '-' + newMarket.marketId
    hm.marketId = newMarket.marketId
    hm.event = event.method
    hm.status = newMarket.status
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)

    if (newMarket.outcomeAssets && newMarket.outcomeAssets.length) {
        for (var i = 0; i < newMarket.outcomeAssets.length; i++) {
            const asset = new Asset()
            asset.id = event.id + '-' + newMarket.marketId + i
            asset.assetId = newMarket.outcomeAssets[i]!
            console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`)
            await store.save<Asset>(asset)
        }
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
    hm.id = event.id + '-' + savedMarket.marketId
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
    hm.id = event.id + '-' + savedMarket.marketId
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
    if (report.outcome) {
        if (report.outcome.categorical) {
            ocr.categorical = report.outcome.categorical.toNumber()
        } else if (report.outcome.scalar) {
            ocr.scalar = report.outcome.scalar.toNumber()
        } else if (report.outcome.__kind == "Categorical") {
            ocr.categorical = report.outcome.value
        } else if (report.outcome.__kind == "Scalar") {
            ocr.scalar = +report.outcome.value.toString()
        }
    } else if (report.__kind == "Categorical") {
        ocr.categorical = report.value
    } else if (report.__kind == "Scalar") {
        ocr.scalar = +report.value.toString()
    }

    const mr = new MarketReport()
    mr.at = report.at ? +report.at.toString() : block.height
    mr.by = report.by ? ss58.codec('zeitgeist').encode(report.by) : extrinsic!.signer
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
    hm.id = event.id + '-' + savedMarket.marketId
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
    if (report.outcome) {
        if (report.outcome.categorical) {
            ocr.categorical = report.outcome.categorical.toNumber()
        } else if (report.outcome.scalar) {
            ocr.scalar = report.outcome.scalar.toNumber()
        } else if (report.outcome.__kind == "Categorical") {
            ocr.categorical = report.outcome.value
        } else if (report.outcome.__kind == "Scalar") {
            ocr.scalar = +report.outcome.value.toString()
        }
    } else if (report.__kind == "Categorical") {
        ocr.categorical = report.value
    } else if (report.__kind == "Scalar") {
        ocr.scalar = +report.value.toString()
    }

    const mr = new MarketReport()
    mr.at = report.at ? +report.at.toString() : block.height
    mr.by = report.by ? ss58.codec('zeitgeist').encode(report.by) : extrinsic!.signer
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
    hm.id = event.id + '-' + savedMarket.marketId
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
    hm.id = event.id + '-' + savedMarket.marketId
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
    hm.id = event.id + '-' + savedMarket.marketId
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
    if (report.__kind == "Categorical") {
        ocr.categorical = report.value
        savedMarket.report!.outcome = ocr
        savedMarket.resolvedOutcome = report.value.toString()
    } else if (report.__kind == "Scalar") {
        ocr.scalar = +report.value.toString()
        savedMarket.report!.outcome = ocr
        savedMarket.resolvedOutcome = report.value()
    } else if (typeof report == "number") {
        savedMarket.resolvedOutcome = report.toString()
    }

    if (status.length < 2) {
        savedMarket.status = "Resolved"
    } else {
        savedMarket.status = status.__kind
    }
    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const hm = new HistoricalMarket()
    hm.id = event.id + '-' + savedMarket.marketId
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.status = savedMarket.status
    hm.report = savedMarket.report
    hm.resolvedOutcome = savedMarket.resolvedOutcome
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)
}

export async function predictionMarketSoldCompleteSet(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {marketId, amount, accountId} = getSoldCompleteSetEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const savedMarket = await store.get(Market, { where: { marketId: marketId } })
    if (!savedMarket) return

    const hm = new HistoricalMarket()
    hm.id = event.id + '-' + savedMarket.marketId
    hm.marketId = savedMarket.marketId
    hm.event = event.method
    hm.blockNumber = block.height
    hm.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`)
    await store.save<HistoricalMarket>(hm)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) { return }

    const len = +savedMarket.marketType.categorical!
    for (var i = 0; i < len; i++) {
        const currencyId = util.AssetIdFromString(`[${marketId},${i}]`)
        const ab = await store.get(AccountBalance, { where: { account: acc, assetId: currencyId } })
        if (!ab) { return }

        const asset = await store.get(Asset, { where: { assetId: currencyId } })

        var amt = BigInt(0)
        if (amount !== BigInt(0)) {
            amt = amount
        } else {
            if (extrinsic?.args[1]) {
                const amount = extrinsic.args[1].value as any
                amt = BigInt(amount.toString())
            } else if (extrinsic?.args[0].name === "calls") {
                for (var ext of extrinsic.args[0].value as Array<{ args: { amount: number, market_id: number }}> ) {
                    const { args: { amount: amount, market_id } } = ext;
                    if (market_id && BigInt(market_id) == marketId) {
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

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
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

async function createAssetsForMarket(marketId: t_MarketId, marketType: any): Promise<string[]> {
    const sdk = await Tools.getSDK()
    return marketType.categorical
      ? [...Array(marketType.categorical).keys()].map((catIdx) => {
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

async function decodeMarketMetadata(metadata: string): Promise<DecodedMarketMetadata | undefined> {
    if (metadata.startsWith('0x1530fa0bb52e67d0d9f89bf26552e1')) return undefined
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

interface DecodedMarketMetadata {
    slug: string
    question: string
    description: string
    categories?: CategoryData[]
    tags?: string[]
    img?: string
}

interface CategoryData {
    name: string
    ticker?: string
    img?: string
    color?: string
}

interface BoughtCompleteSetEvent {
    marketId: bigint
    amount: bigint
    accountId: Uint8Array
}

interface ApprovedEvent {
    marketId: bigint
    status: any
}

interface CreatedEvent {
    marketId: t_MarketId
    market: t_Market
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
    amount: bigint
    accountId: Uint8Array
}

function getBoughtCompleteSetEvent(ctx: EventHandlerContext): BoughtCompleteSetEvent {
    const event = new PredictionMarketsBoughtCompleteSetEvent(ctx)
    if (event.isV23) {
        const [marketId, accountId] = event.asV23
        const amount = BigInt(0)
        return {marketId, amount, accountId}
    } else {
        const [marketId, amount, accountId] = event.asLatest
        return {marketId, amount, accountId}
    }
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
    const [param0, param1] = ctx.event.params
    const marketId = param0.value as t_MarketId
    if (ctx.block.runtimeVersion.specVersion < 32) {
        var market = param1.value as any
        market.creatorFee = market.creator_fee
        market.scoringRule = market.scoring_rule
        market.marketType = market.market_type
        return { marketId, market } 
    } else {
        const market = param1.value as t_Market
        return { marketId, market }
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
    if (event.isV23) {
        const [marketId, accountId] = event.asV23
        const amount = BigInt(0)
        return {marketId, amount, accountId}
    } else {
        const [marketId, amount, accountId] = event.asLatest
        return {marketId, amount, accountId}
    }
}