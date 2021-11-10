import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'
import { Authorized, Block, Categorical, Court, Market, MarketHistory, Pool, Scalar, SimpleDisputes, Timestamp } from '../generated/model'
import { PredictionMarkets, Swaps } from '../chain'
import IPFS from './util'

export async function predictionMarketCreated ({
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
  
  if (market.report !== null) {
    newMarket.report = market.report.toString()
  }
  if (market.resolved_outcome !== null) {
    newMarket.resolvedOutcome = market.resolved_outcome.toString()
  }

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

  const newHistory = new MarketHistory()
  newHistory.market = newMarket
  newHistory.status = market.status.toString()
  newHistory.report = newMarket.report
  newHistory.resolvedOutcome = newMarket.resolvedOutcome
  newHistory.blockNumber = block.height
  newHistory.timestamp = new BN(block.timestamp)

  console.log(`Saving market history: ${JSON.stringify(newHistory, null, 2)}`)
  await store.save<MarketHistory>(newHistory)
}

export async function swapPoolCreated ({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const newPool = new Pool()
  const [cpep, pool] = new Swaps.PoolCreateEvent(event).params
  newPool.poolId = cpep.pool_id.toNumber();
  newPool.baseAsset = pool.base_asset.toString();
  newPool.marketId = pool.market_id;
  newPool.poolStatus = pool.pool_status.toString();
  newPool.scoringRule = pool.scoring_rule;
  newPool.swapFee = pool.swap_fee.toString();
  newPool.totalSubsidy = pool.total_subsidy.toString();
  newPool.totalWeight = pool.total_weight.toString();
  newPool.blockNumber = block.height
  newPool.timestamp = new BN(block.timestamp)

  console.log(`Saving pool: ${JSON.stringify(newPool, null, 2)}`)
  await store.save<Pool>(newPool)
}

async function decodeMarketMetadata(
  metadata: string,
): Promise<DecodedMarketMetadata|undefined> {

  try {
    if (metadata) {
      const ipfs = new IPFS();
      const raw = await ipfs.read(metadata);
      return raw ? JSON.parse(raw) as DecodedMarketMetadata: undefined
    }
  } catch (err) {
    console.error(err);
  }
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

type DecodedMarketMetadata = {
  slug: string;
  question: string;
  description: string;
};