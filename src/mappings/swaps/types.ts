import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { SwapsPoolClosedEvent, SwapsPoolCreateEvent, SwapsPoolExitEvent, SwapsPoolJoinEvent, 
  SwapsSwapExactAmountInEvent, SwapsSwapExactAmountOutEvent} from '../../types/events'
import { EventContext } from '../../types/support'
import { PoolAssetsEvent } from '../../types/v35'
import { SwapEvent } from '../../types/v37'
import { CommonPoolEventParams, Pool } from '../../types/v39'


export function getPoolClosedEvent(ctx: EventContext): PoolClosedEvent {
  const poolCloseEvent = new SwapsPoolClosedEvent(ctx)
  if (poolCloseEvent.isV37) {
    const poolId = poolCloseEvent.asV37
    return {poolId}
  } else {
    const [poolId] = ctx.event.args
    return {poolId}
  }
}

export function getPoolCreateEvent(ctx: EventContext): PoolCreateEvent {
  const poolCreateEvent = new SwapsPoolCreateEvent(ctx)
  if (poolCreateEvent.isV23) {
    const [cpep, pool] = poolCreateEvent.asV23
    let swapPool = pool as Pool
    const amount = BigInt(0)
    return {cpep, swapPool, amount}
  } else if (poolCreateEvent.isV32) {
    const [cpep, pool] = poolCreateEvent.asV32
    let swapPool = pool as Pool
    const amount = BigInt(0)
    return {cpep, swapPool, amount}
  } else if (poolCreateEvent.isV35) {
    const [cpep, pool, amount] = poolCreateEvent.asV35
    let swapPool = pool as Pool
    return {cpep, swapPool, amount}
  } else if (poolCreateEvent.isV36) {
    const [cpep, pool, amount] = poolCreateEvent.asV36
    let swapPool = pool as Pool
    return {cpep, swapPool, amount}
  } else if (poolCreateEvent.isV37) {
    const [cpep, swapPool, amount] = poolCreateEvent.asV37
    return {cpep, swapPool, amount}
  } else if (poolCreateEvent.isV39) {
    const [cpep, swapPool, amount] = poolCreateEvent.asV39
    return {cpep, swapPool, amount}
  } else {
    const [cpep, swapPool, amount] = ctx.event.args
    return {cpep, swapPool, amount}
  }
}

export function getPoolJoinEvent(ctx: EventContext): PoolJoinEvent {
  const poolJoinEvent = new SwapsPoolJoinEvent(ctx)
  if (poolJoinEvent.isV23) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (poolJoinEvent.isV32) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (poolJoinEvent.isV35) {
    const pae = poolJoinEvent.asV35
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who)
    return {pae, walletId}
  } else {
    const pae = ctx.event.args
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  }
}

export function getPoolExitEvent(ctx: EventContext): PoolExitEvent {
  const poolExitEvent = new SwapsPoolExitEvent(ctx)
  if (poolExitEvent.isV23) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (poolExitEvent.isV32) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (poolExitEvent.isV35) {
    const pae = poolExitEvent.asV35
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who)
    return {pae, walletId}
  } else {
    const pae = ctx.event.args
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  }
}

export function getSwapExactAmountInEvent(ctx: EventContext): SwapExactAmountInEvent {
  const swapExactAmountInEvent = new SwapsSwapExactAmountInEvent(ctx)
  if (swapExactAmountInEvent.isV23) {
    const swapEvent = swapExactAmountInEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else if (swapExactAmountInEvent.isV32) {
    const swapEvent = swapExactAmountInEvent.asV32
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else if (swapExactAmountInEvent.isV37) {
    const swapEvent = swapExactAmountInEvent.asV37
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else {
    const swapEvent = ctx.event.args
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  }
}

export function getSwapExactAmountOutEvent(ctx: EventContext): SwapExactAmountOutEvent {
  const swapExactAmountOutEvent = new SwapsSwapExactAmountOutEvent(ctx)
  if (swapExactAmountOutEvent.isV23) {
    const swapEvent = swapExactAmountOutEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else if (swapExactAmountOutEvent.isV32) {
    const swapEvent = swapExactAmountOutEvent.asV32
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else if (swapExactAmountOutEvent.isV37) {
    const swapEvent = swapExactAmountOutEvent.asV37
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else {
    const swapEvent = ctx.event.args
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  }
}


interface PoolClosedEvent {
  poolId: bigint
}

interface PoolCreateEvent {
  cpep: CommonPoolEventParams
  swapPool: Pool
  amount: bigint
}

interface PoolJoinEvent {
  pae: PoolAssetsEvent
  walletId: string
}

interface PoolExitEvent {
  pae: PoolAssetsEvent
  walletId: string
}

interface SwapExactAmountInEvent {
  swapEvent: SwapEvent
  walletId: string
}

interface SwapExactAmountOutEvent {
  swapEvent: SwapEvent
  walletId: string
}