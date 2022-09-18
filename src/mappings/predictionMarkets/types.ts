import { encodeAddress } from '@polkadot/keyring'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import * as ss58 from '@subsquid/ss58'
import { Store } from '@subsquid/typeorm-store'
import { PredictionMarketsBoughtCompleteSetEvent } from '../../types/events'
import { EventContext } from '../../types/support'


export function getBoughtCompleteSetEvent(ctx: EventContext): BoughtCompleteSetEvent {
  const event = new PredictionMarketsBoughtCompleteSetEvent(ctx)
  if (event.isV23) {
    const [marketId, accountId] = event.asV23
    const amount = BigInt(0)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else if (event.isV34) {
    const [marketId, amount, accountId] = event.asV34
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else {
    const [marketId, amount, accountId] = ctx.event.args
    const walletId = encodeAddress(accountId, 73)
    return {marketId, amount, walletId}
  }
}

export function getMarketCreatedEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): CreatedEvent {
  const [marketId, param1, param2] = ctx.event.args
  const specVersion = +ctx.block.specId.substring(ctx.block.specId.indexOf('@')+1)
  if (specVersion < 32) {
    const marketAccountId = ""
    let market = param1 as any
    market.disputeMechanism = market.mdm
    market.period.start = market.period.value[0]
    market.period.end = market.period.value[1]
    return { marketId, marketAccountId, market } 
  } else if (specVersion < 36 ) {
    const marketAccountId = ""
    let market = param1 as any
    market.disputeMechanism = market.mdm
    market.period.start = market.period.value.start
    market.period.end = market.period.value.end
    return { marketId, marketAccountId, market }
  } else if (specVersion < 38) {
    const marketAccountId = encodeAddress(param1, 73)
    const market = param2 as any
    market.disputeMechanism = market.mdm
    market.period.start = market.period.value.start
    market.period.end = market.period.value.end
    return { marketId, marketAccountId, market }
  } else {
    const marketAccountId = encodeAddress(param1, 73)
    const market = param2 as any
    market.period.start = param2.period.value.start
    market.period.end = market.period.value.end
    return { marketId, marketAccountId, market }
  }
}

interface BoughtCompleteSetEvent {
  marketId: bigint
  amount: bigint
  walletId: string
}

interface CreatedEvent {
  marketId: string
  marketAccountId: string
  market: any
}

