import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { SwapsPoolCreateEvent } from '../../types/events'
import { CommonPoolEventParams, Pool } from '../../types/v39'


export function getPoolCreateEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): PoolCreateEvent {
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

interface PoolCreateEvent {
  cpep: CommonPoolEventParams
  pool: Pool
  amount: bigint
}
