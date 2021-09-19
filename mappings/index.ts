import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext, ExtrinsicContext } from '@subsquid/hydra-common'
import { CategoricalMarket } from '../generated/model'
import { PredictionMarkets } from '../chain'

export async function predictionMarketCreated ({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const categoricalMarket = new CategoricalMarket()
  const market = new PredictionMarkets.MarketCreatedEvent(event).params
  categoricalMarket.oracle = " "
  categoricalMarket.creation = " "
  categoricalMarket.categories = new BN(3)
  categoricalMarket.block = block.height
  console.log(`Saving categorical market: ${JSON.stringify(categoricalMarket, null, 2)}`)
  await store.save<CategoricalMarket>(categoricalMarket)
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
