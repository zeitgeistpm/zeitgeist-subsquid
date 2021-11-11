import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Authorized, Block, Categorical, Court, Market, MarketHistory, Scalar, SimpleDisputes, Timestamp } from '../generated/model'
import { PredictionMarkets } from '../chain'
import IPFS from './util'
import { MarketEvent, MarketStatus } from '../generated/modules/enums/enums'

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

    if (market.market_type.isCategorical) {
        const categorical = new Categorical()
        categorical.value = market.market_type.asCategorical.toString()
        newMarket.marketType = categorical
    } else {
        const scalar = new Scalar()
        scalar.value = market.market_type.asScalar.toString()
        newMarket.marketType = scalar
    }

    if (market.period.isBlock) {
        const block = new Block()
        block.value = market.period.asBlock.toString()
        newMarket.period = block
    } else {
        const timestamp = new Timestamp()
        timestamp.value = market.period.asTimestamp.toString()
        newMarket.period = timestamp
    }

    newMarket.scoringRule = market.scoring_rule.toString()
    newMarket.status = market.status.toString()

    if (market.mdm.isAuthorized) {
        const authorized = new Authorized()
        authorized.value = market.mdm.asAuthorized.toString()
        newMarket.mdm = authorized
    } else if (market.mdm.isCourt) {
        const court = new Court()
        court.value = market.mdm.isCourt
        newMarket.mdm = court
    } else {
        const simpleDisputes = new SimpleDisputes()
        simpleDisputes.value = market.mdm.isSimpleDisputes
        newMarket.mdm = simpleDisputes
    }

    console.log(`Saving market: ${JSON.stringify(newMarket, null, 2)}`)
    await store.save<Market>(newMarket)

    const newMH = new MarketHistory()
    newMH.market = newMarket
    newMH.event = MarketEvent.MarketCreated
    newMH.status = newMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`Saving market history: ${JSON.stringify(newMH, null, 2)}`)
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

    console.log(`Saving market: ${JSON.stringify(savedMarket, null, 2)}`)
    await store.save<Market>(savedMarket)

    const newMH = new MarketHistory()
    newMH.market = savedMarket
    newMH.event = MarketEvent.MarketInsufficientSubsidy
    newMH.status = savedMarket.status
    newMH.blockNumber = block.height
    newMH.timestamp = new BN(block.timestamp)

    console.log(`Saving market history: ${JSON.stringify(newMH, null, 2)}`)
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