import { Transfer, BlockTimestamp, Market, CategoricalMarket, ScalarMarket, Block, Timestamp as Tstamp, Categorical, Scalar} from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Timestamp, PredictionMarkets } from './generated/types'
import BN from 'bn.js'
import {
  ExtrinsicContext,
  EventContext,
  StoreContext,
} from '@subsquid/hydra-common'

export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const transfer = new Transfer()
  const [from, to, value] = new Balances.TransferEvent(event).params
  transfer.from = Buffer.from(from.toHex())
  transfer.to = Buffer.from(to.toHex())
  transfer.value = value.toBn()
  transfer.tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)
  transfer.insertedAt = new Date(block.timestamp)

  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.timestamp = new BN(block.timestamp)
  console.log(`Saving transfer: ${JSON.stringify(transfer, null, 2)}`)
  await store.save<Transfer>(transfer)
}

export async function predictionMarketsCreateCategoricalMarket ({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const categoricalMarket = new CategoricalMarket()
  const {oracle, end, creation, categories} = new PredictionMarkets.CreateCategoricalMarketCall(event).args
  categoricalMarket.oracle = oracle.toString()
  if (end.isTimestamp) {
    categoricalMarket.end = end.asTimestamp
  } else if (end.isBlock) {
    categoricalMarket.end = end.asBlock
  }
  categoricalMarket.creation = creation.toString()
  categoricalMarket.categories = categories.toBn()
  categoricalMarket.block = block.height
  console.log(`Saving categorical market: ${JSON.stringify(categoricalMarket, null, 2)}`)
  await store.save<CategoricalMarket>(categoricalMarket)
}

export async function predictionMarketsCreateScalarMarket ({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const scalarMarket = new ScalarMarket()
  const {oracle, end, creation, outcomeRange} = new PredictionMarkets.CreateScalarMarketCall(event).args
  scalarMarket.oracle = oracle.toString()
  if (end.isTimestamp) {
    scalarMarket.end = end.asTimestamp
  } else if (end.isBlock) {
    scalarMarket.end = end.asBlock
  }
  scalarMarket.creation = creation.toString()
  scalarMarket.outcomeRange = outcomeRange
  scalarMarket.block = block.height
  console.log(`Saving scalar market: ${JSON.stringify(scalarMarket, null, 2)}`)
  await store.save<ScalarMarket>(scalarMarket)
}

export async function timestampCall({
  store,
  event,
  block,
  extrinsic
}: ExtrinsicContext & StoreContext) {
  const call = new Timestamp.SetCall(event)
  const blockT = new BlockTimestamp()
  blockT.timestamp = call.args.now.toBn()
  blockT.blockNumber = block.height
  await store.save<BlockTimestamp>(blockT)
}

export async function predictionMarketCreated({
  store,
  event,
  block,
  extrinsic
}: ExtrinsicContext & StoreContext) {
  const market = new Market()
  if (extrinsic.method === 'createCategoricalMarket') {
    const { oracle, end, creation, categories } = new PredictionMarkets.CreateCategoricalMarketCall(event).args
    market.oracle = oracle.toString()
    market.creation = creation.toString()
    if (end.isTimestamp) {
      const tsp = new Tstamp()
      tsp.value = end.asTimestamp.toString()
      market.end = tsp
    } else if (end.isBlock) { 
      const blk = new Block()
      blk.value = end.asBlock.toString()
      market.end = blk
    }
    const categorical = new Categorical()
    categorical.categories = categories.toNumber()
    market.marketType = categorical
  } else {
    const { oracle, end, creation, outcomeRange } = new PredictionMarkets.CreateScalarMarketCall(event).args
    market.oracle = oracle.toString()
    market.creation = creation.toString()
    if (end.isTimestamp) {
      const tsp = new Tstamp()
      tsp.value = end.asTimestamp.toString()
      market.end = tsp
    } else if (end.isBlock) { 
      const blk = new Block()
      blk.value = end.asBlock.toString()
      market.end = blk
    }
    const scalar = new Scalar()
    scalar.lowerBound = outcomeRange[0]
    scalar.upperBound = outcomeRange[1]
    market.marketType = scalar
  }
  market.metadata = extrinsic.args[2].value['sha3384']
  market.block = block.height
  const call = new PredictionMarkets.MarketCreatedEvent(event)
  market.marketId = call.params[0].toNumber()
  market.creator = call.params[1].toString()
  console.log(`Saving market: ${JSON.stringify(market, null, 2)}`)
  await store.save<Market>(market)
}


function toJson(data) {
  if (data !== undefined) {
      return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}#bigint` : v)
          .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
  }
}