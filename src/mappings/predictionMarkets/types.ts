import { encodeAddress } from '@polkadot/keyring'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import * as ss58 from '@subsquid/ss58'
import { Store } from '@subsquid/typeorm-store'
import { PredictionMarketsBoughtCompleteSetEvent, PredictionMarketsMarketApprovedEvent, PredictionMarketsMarketRejectedEvent, PredictionMarketsSoldCompleteSetEvent } from '../../types/events'
import { EventContext } from '../../types/support'


export function getBoughtCompleteSetEvent(ctx: EventContext): BoughtCompleteSetEvent {
  const boughtCompleteSetEvent = new PredictionMarketsBoughtCompleteSetEvent(ctx)
  if (boughtCompleteSetEvent.isV23) {
    const [mId, accountId] = boughtCompleteSetEvent.asV23
    const marketId = Number(mId)
    const amount = BigInt(0)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else if (boughtCompleteSetEvent.isV34) {
    const [mId, amount, accountId] = boughtCompleteSetEvent.asV34
    const marketId = Number(mId)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else {
    const [mId, amount, accountId] = ctx.event.args
    const marketId = Number(mId)
    const walletId = encodeAddress(accountId, 73)
    return {marketId, amount, walletId}
  }
}

export function getMarketApprovedEvent(ctx: EventContext): MarketApprovedEvent {
  const marketApprovedEvent = new PredictionMarketsMarketApprovedEvent(ctx)
  if (marketApprovedEvent.isV23) {
    const mId = marketApprovedEvent.asV23
    const marketId = Number(mId)
    const status = ""
    return {marketId, status}
  } else if (marketApprovedEvent.isV29) {
    const [mId, marketStatus] = marketApprovedEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  } else {
    const [mId, marketStatus] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  }
}

export function getMarketCreatedEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): MarketCreatedEvent {
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

export function getMarketRejectedEvent(ctx: EventContext): MarketRejectedEvent {
  const event = new PredictionMarketsMarketRejectedEvent(ctx)
  if (event.isV23) {
    const marketId = Number(event.asV23)
    return {marketId}
  } else {
    const [mId] = ctx.event.args
    const marketId = Number(mId)
    return {marketId}
  }
}

export function getSoldCompleteSetEvent(ctx: EventContext): SoldCompleteSetEvent {
  const soldCompleteSetEvent = new PredictionMarketsSoldCompleteSetEvent(ctx)
  if (soldCompleteSetEvent.isV23) {
    const [mId, accountId] = soldCompleteSetEvent.asV23
    const marketId = Number(mId)
    const amount = BigInt(0)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else if (soldCompleteSetEvent.isV34) {
    const [mId, amount, accountId] = soldCompleteSetEvent.asV34
    const marketId = Number(mId)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else {
    const [mId, amount, accountId] = ctx.event.args
    const marketId = Number(mId)
    const walletId = encodeAddress(accountId, 73)
    return {marketId, amount, walletId}
  }
}

interface BoughtCompleteSetEvent {
  marketId: number
  amount: bigint
  walletId: string
}

interface MarketApprovedEvent {
  marketId: number
  status: string
}

interface MarketCreatedEvent {
  marketId: string
  marketAccountId: string
  market: any
}

interface MarketRejectedEvent {
  marketId: number
}

interface SoldCompleteSetEvent {
  marketId: number
  amount: bigint
  walletId: string
}