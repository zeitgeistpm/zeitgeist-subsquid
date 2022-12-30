import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { SwapsPoolActiveEvent, SwapsPoolClosedEvent, SwapsPoolCreateEvent, SwapsPoolDestroyedEvent, 
  SwapsPoolExitEvent, SwapsPoolJoinEvent, SwapsSwapExactAmountInEvent, SwapsSwapExactAmountOutEvent
} from '../../types/events'
import { EventContext } from '../../types/support'
import { PoolAssetsEvent } from '../../types/v41'
import { SwapEvent } from '../../types/v41'
import { CommonPoolEventParams, Pool } from '../../types/v41'


export function getPoolActiveEvent(ctx: EventContext): PoolEvent {
  const poolActiveEvent = new SwapsPoolActiveEvent(ctx)
  if (poolActiveEvent.isV39) {
    const poolId = poolActiveEvent.asV39
    return {poolId}
  } else {
    const [poolId] = ctx.event.args
    return {poolId}
  }
}

export function getPoolClosedEvent(ctx: EventContext): PoolEvent {
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
  const event = new SwapsPoolCreateEvent(ctx)
  if (event.isV23) {
    const [cpep, pool] = event.asV23
    let swapPool = pool as Pool
    const amount = BigInt(0)
    return {cpep, swapPool, amount}
  } else if (event.isV32) {
    const [cpep, pool] = event.asV32
    let swapPool = pool as Pool
    const amount = BigInt(0)
    return {cpep, swapPool, amount}
  } else if (event.isV35) {
    const [cpep, pool, amount] = event.asV35
    let swapPool = pool as Pool
    return {cpep, swapPool, amount}
  } else if (event.isV36) {
    const [cpep, pool, amount] = event.asV36
    let swapPool = pool as Pool
    return {cpep, swapPool, amount}
  } else if (event.isV37) {
    const [cpep, swapPool, amount] = event.asV37
    return {cpep, swapPool, amount}
  } else if (event.isV39) {
    const [cpep, swapPool, amount] = event.asV39
    return {cpep, swapPool, amount}
  } else if (event.isV41) {
    const [cpep, swapPool, amount] = event.asV41
    return {cpep, swapPool, amount}
  } else {
    const [cpep, swapPool, amount] = ctx.event.args
    return {cpep, swapPool, amount}
  }
}

export function getPoolDestroyedEvent(ctx: EventContext): PoolEvent {
  const event = new SwapsPoolDestroyedEvent(ctx)
  if (event.isV36) {
    const poolId = event.asV36
    return {poolId}
  } else {
    const [poolId] = ctx.event.args
    return {poolId}
  }
}

export function getPoolExitEvent(ctx: EventContext): PoolExitEvent {
  const event = new SwapsPoolExitEvent(ctx)
  if (event.isV23) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (event.isV32) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (event.isV35) {
    const pae = event.asV35
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who)
    return {pae, walletId}
  } else if (event.isV41) {
    const pae = event.asV41
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who)
    return {pae, walletId}
  } else {
    const pae = ctx.event.args
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  }
}

export function getPoolJoinEvent(ctx: EventContext): PoolJoinEvent {
  const event = new SwapsPoolJoinEvent(ctx)
  if (event.isV23) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (event.isV32) {
    let pae = ctx.event.args as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  } else if (event.isV35) {
    const pae = event.asV35
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who)
    return {pae, walletId}
  } else if (event.isV41) {
    const pae = event.asV41
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who)
    return {pae, walletId}
  } else {
    const pae = ctx.event.args
    const walletId = encodeAddress(pae.cpep.who, 73)
    return {pae, walletId}
  }
}

export function getSwapExactAmountInEvent(ctx: EventContext): SwapExactAmountInEvent {
  const event = new SwapsSwapExactAmountInEvent(ctx)
  if (event.isV23) {
    let swapEvent = ctx.event.args as SwapEvent
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  } else if (event.isV32) {
    let swapEvent = ctx.event.args as SwapEvent
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  } else if (event.isV37) {
    const swapEvent = event.asV37
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else if (event.isV41) {
    const swapEvent = event.asV41
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else {
    const swapEvent = ctx.event.args
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  }
}

export function getSwapExactAmountOutEvent(ctx: EventContext): SwapExactAmountOutEvent {
  const event = new SwapsSwapExactAmountOutEvent(ctx)
  if (event.isV23) {
    let swapEvent = ctx.event.args as SwapEvent
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  } else if (event.isV32) {
    let swapEvent = ctx.event.args as SwapEvent
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  } else if (event.isV37) {
    const swapEvent = event.asV37
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else if (event.isV41) {
    const swapEvent = event.asV41
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who)
    return {swapEvent, walletId}
  } else {
    const swapEvent = ctx.event.args
    const walletId = encodeAddress(swapEvent.cpep.who, 73)
    return {swapEvent, walletId}
  }
}


interface PoolEvent {
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