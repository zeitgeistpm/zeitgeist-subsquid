import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'
import { Authorized, Block, Categorical, Court, Market, MarketData, Scalar, SimpleDisputes, Timestamp } from '../generated/model'
import { PredictionMarkets } from '../chain'

export async function predictionMarketCreated ({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const newMarket = new Market()
  var newData = new MarketData()
  const [marketIdOf, market, accountId] = new PredictionMarkets.MarketCreatedEvent(event).params

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
    newData.period = block
  } else {
    const timestamp = new Timestamp()
    timestamp.value = market.period.asTimestamp.toString()
    newData.period = timestamp
  }

  if (market.report !== null) {
    newData.report = market.report.toString()
  }

  if (market.resolved_outcome !== null) {
    newData.resolvedOutcome = market.resolved_outcome.toString()
  }

  if (market.mdm.isAuthorized) {
    const authorized = new Authorized()
    authorized.value = market.mdm.asAuthorized.toString()
    newData.mdm = authorized
  } else if (market.mdm.isCourt) {
    const court = new Court()
    court.value = market.mdm.isCourt
    newData.mdm = court
  } else {
    const simpleDisputes = new SimpleDisputes()
    simpleDisputes.value = market.mdm.isSimpleDisputes
    newData.mdm = simpleDisputes
  }

  newData.id = marketIdOf.toString()
  newData.status = market.status.toString()
  newData.blockNumber = block.height
  newData.timestamp = new BN(block.timestamp)

  await store.save<MarketData>(newData)

  newMarket.marketId = marketIdOf.toNumber()
  newMarket.creator = market.creator.toString()
  newMarket.creation = market.creation.toString()
  newMarket.oracle = market.oracle.toString()
  newMarket.marketData = newData

  console.log(`Saving market: ${JSON.stringify(newMarket, null, 2)}`)
  await store.save<Market>(newMarket)
}

async function getOrCreate<T extends {id: string}>(
  store: DatabaseManager,
  entityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {

  let e = await store.get(entityConstructor, {
    where: { id },
  })

  if (e == null) {
    e = new entityConstructor()
    e.id = id
  }

  return e
}


type EntityConstructor<T> = {
  new (...args: any[]): T
}
