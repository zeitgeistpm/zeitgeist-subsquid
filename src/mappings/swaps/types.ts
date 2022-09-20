import { SwapsPoolCreateEvent, SwapsPoolExitEvent, SwapsPoolJoinEvent } from '../../types/events'
import { EventContext } from '../../types/support'
import { PoolAssetsEvent } from '../../types/v35'
import { CommonPoolEventParams, Pool } from '../../types/v39'


export function getPoolCreateEvent(ctx: EventContext): PoolCreateEvent {
  const poolCreateEvent = new SwapsPoolCreateEvent(ctx)
  if (poolCreateEvent.isV23) {
    const [cpep, swapPool] = poolCreateEvent.asV23
    let pool = swapPool as Pool
    const amount = BigInt(0)
    return {cpep, pool, amount}
  } else if (poolCreateEvent.isV32) {
    const [cpep, swapPool] = poolCreateEvent.asV32
    let pool = swapPool as Pool
    const amount = BigInt(0)
    return {cpep, pool, amount}
  } else if (poolCreateEvent.isV35) {
    const [cpep, swapPool, amount] = poolCreateEvent.asV35
    let pool = swapPool as Pool
    return {cpep, pool, amount}
  } else if (poolCreateEvent.isV36) {
    const [cpep, swapPool, amount] = poolCreateEvent.asV36
    let pool = swapPool as Pool
    return {cpep, pool, amount}
  } else if (poolCreateEvent.isV37) {
    const [cpep, pool, amount] = poolCreateEvent.asV37
    return {cpep, pool, amount}
  } else if (poolCreateEvent.isV39) {
    const [cpep, pool, amount] = poolCreateEvent.asV39
    return {cpep, pool, amount}
  } else {
    const [cpep, pool, amount] = ctx.event.args
    return {cpep, pool, amount}
  }
}

export function getPoolJoinEvent(ctx: EventContext): PoolJoinEvent {
  const poolJoinEvent = new SwapsPoolJoinEvent(ctx)
  if (poolJoinEvent.isV23) {
    let res = poolJoinEvent.asV23
    let pae = res as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    return {pae}
  } else if (poolJoinEvent.isV32) {
    let res = poolJoinEvent.asV32
    let pae = res as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    return {pae}
  } else if (poolJoinEvent.isV35) {
    const pae = poolJoinEvent.asV35
    return {pae}
  } else {
    const pae = ctx.event.args
    return {pae}
  }
}

export function getPoolExitEvent(ctx: EventContext): PoolExitEvent {
  const poolExitEvent = new SwapsPoolExitEvent(ctx)
  if (poolExitEvent.isV23) {
    let res = poolExitEvent.asV23
    let pae = res as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    return {pae}
  } else if (poolExitEvent.isV32) {
    let res = poolExitEvent.asV32
    let pae = res as PoolAssetsEvent
    pae.poolAmount = BigInt(0)
    return {pae}
  } else if (poolExitEvent.isV35) {
    const pae = poolExitEvent.asV35
    return {pae}
  } else {
    const pae = ctx.event.args
    return {pae}
  }
}

interface PoolCreateEvent {
  cpep: CommonPoolEventParams
  pool: Pool
  amount: bigint
}

interface PoolJoinEvent {
  pae: PoolAssetsEvent
}

interface PoolExitEvent {
  pae: PoolAssetsEvent
}