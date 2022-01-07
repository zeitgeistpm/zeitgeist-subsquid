import BN from 'bn.js'
import { encodeAddress } from '@polkadot/keyring'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import SDK from '@zeitgeistpm/sdk'
import { CategoryMetadata, Market, MarketDisputeMechanism, MarketHistory, MarketPeriod, MarketReport, MarketType, OutcomeReport } from '../generated/model'
import { PredictionMarkets } from '../chain'
import { IPFS, Tools } from './util'
import { MarketStatus } from '../generated/modules/enums/enums'

export async function predictionMarketBoughtCompleteSet({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf, accountId] = new PredictionMarkets.BoughtCompleteSetEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    const mh = new MarketHistory()
    mh.event = event.method
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketApproved({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf] = new PredictionMarkets.MarketApprovedEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    savedMarket.status = savedMarket.scoringRule === "CPMM" ? MarketStatus.Active : MarketStatus.CollectingSubsidy

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketCreated({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf, market, accountId] = new PredictionMarkets.MarketCreatedEvent(event).params

    const newMarket = new Market()
    newMarket.marketId = marketIdOf.toNumber()
    newMarket.creator = encodeAddress(market.creator, 73)
    newMarket.creation = market.creation.toString()
    newMarket.creatorFee = market.creator_fee.toNumber()
    newMarket.oracle = encodeAddress(market.oracle, 73)

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
        const now = (await sdk.api.query.timestamp.now()).toNumber();
        const head = await sdk.api.rpc.chain.getHeader();
        const blockNum = head.number.toNumber();
        const diffInMs = (await sdk.api.consts.timestamp.minimumPeriod).toNumber() * (market.period.asBlock[1].toNumber() - blockNum);
        newMarket.end = new BN(now + diffInMs)
        sdk.api.disconnect()
    } else if (market.period.isTimestamp) {
        period.timestamp = market.period.asTimestamp.toString()
        newMarket.end = new BN(market.period.asTimestamp[1])
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

    newMarket.marketHistory = []
    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = newMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    newMarket.marketHistory.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(newMarket, null, 2)}`)
    await store.save<Market>(newMarket)
}

export async function predictionMarketStartedWithSubsidy({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf] = new PredictionMarkets.MarketStartedWithSubsidyEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    savedMarket.status = MarketStatus.Active

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketInsufficientSubsidy({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf] = new PredictionMarkets.MarketInsufficientSubsidyEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    savedMarket.status = MarketStatus.InsufficientSubsidy

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketReported({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf, outcomeReport] = new PredictionMarkets.MarketReportedEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    const ocr = new OutcomeReport()
    if (outcomeReport.asCategorical) {
        ocr.categorical = outcomeReport.asCategorical.toNumber()
    } else if (outcomeReport.asScalar) {
        ocr.scalar = outcomeReport.asScalar.toNumber()
    }

    const mr = new MarketReport()
    mr.at = block.height
    mr.by = savedMarket.oracle
    mr.outcome = ocr

    savedMarket.status = MarketStatus.Reported
    savedMarket.report = mr

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.report = savedMarket.report
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketDisputed({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf, outcomeReport] = new PredictionMarkets.MarketDisputedEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    savedMarket.status = MarketStatus.Disputed

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketRejected({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf] = new PredictionMarkets.MarketRejectedEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    savedMarket.status = MarketStatus.Rejected

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketCancelled({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf] = new PredictionMarkets.MarketCancelledEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    savedMarket.status = MarketStatus.Cancelled

    const mh = new MarketHistory()
    mh.event = event.method
    mh.status = savedMarket.status
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

export async function predictionMarketSoldCompleteSet({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [marketIdOf, accountId] = new PredictionMarkets.SoldCompleteSetEvent(event).params

    const savedMarket = await store.get(Market, { where: { marketId: marketIdOf.toNumber() } })
    if (!savedMarket) return

    const mh = new MarketHistory()
    mh.event = event.method
    mh.blockNumber = block.height
    mh.timestamp = block.timestamp.toString()
    savedMarket.marketHistory?.push(mh)

    console.log(`[${event.name}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)
}

async function decodeMarketMetadata(
    metadata: string,
): Promise<DecodedMarketMetadata | undefined> {

    try {
        if (metadata) {
            const ipfs = new IPFS();
            const raw = await ipfs.read(metadata);
            return raw ? JSON.parse(raw) as DecodedMarketMetadata : undefined
        }
    } catch (err) {
        console.error(err);
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
