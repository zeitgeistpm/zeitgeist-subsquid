import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Market, MarketDisputeMechanism, MarketHistory, MarketPeriod, MarketReport, MarketType, OutcomeReport } from '../generated/model'
import { PredictionMarkets } from '../chain'
import IPFS from './util'
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

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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
    newMarket.creator = market.creator.toString()
    newMarket.creation = market.creation.toString()
    newMarket.oracle = market.oracle.toString()

    const metadata = await decodeMarketMetadata(market.metadata.toString())
    if (metadata) {
        newMarket.slug = metadata.slug
        newMarket.question = metadata.question
        newMarket.description = metadata.description
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
    } else if (market.period.isTimestamp) {
        period.timestamp = market.period.asTimestamp.toString()
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(newMarket, null, 2)}`)
    await store.save<Market>(newMarket)

    const newMH = new MarketHistory()
    newMH.market = newMarket
    newMH.event = event.method
    newMH.status = newMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.report = savedMarket.report
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    console.log(`[${event.method}] Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = event.method
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving market history: ${JSON.stringify(newMH, null, 2)}`)
    await store.save<MarketHistory>(newMH)
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
    slug: string;
    question: string;
    description: string;
};