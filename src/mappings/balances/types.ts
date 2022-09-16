import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { EventContext } from '../../types/support'
import { BalancesBalanceSetEvent, BalancesDustLostEvent, BalancesEndowedEvent, BalancesReservedEvent, BalancesTransferEvent, BalancesUnreservedEvent } from '../../types/events'


export function getBalanceSetEvent(ctx: EventContext): BalanceSetEvent {
  const balanceSetEvent = new BalancesBalanceSetEvent(ctx)
  if (balanceSetEvent.isV23) {
    const [who, free] = balanceSetEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, free}
  } else if (balanceSetEvent.isV34) {
    const {who, free} = balanceSetEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, free}
  } else {
    const [account, free] = ctx.event.args
    const walletId = encodeAddress(account, 73)
    return {walletId, free}
  }
}

export function getDustLostEvent(ctx: EventContext): DustLostEvent {
  const dustLostEvent = new BalancesDustLostEvent(ctx)
  if (dustLostEvent.isV23) {
    const [account, amount] = dustLostEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(account)
    return {walletId, amount}
  } else if (dustLostEvent.isV34) {
    const {account, amount} = dustLostEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(account)
    return {walletId, amount}
  } else {
    const [account, amount] = ctx.event.args
    const walletId = encodeAddress(account, 73)
    return {walletId, amount}
  }
}

export function getEndowedEvent(ctx: EventContext): EndowedEvent {
  const endowedEvent = new BalancesEndowedEvent(ctx)
  if (endowedEvent.isV23) {
    const [account, freeBalance] = endowedEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(account)
    return {walletId, freeBalance}
  } else if (endowedEvent.isV34) {
    const {account, freeBalance} = endowedEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(account)
    return {walletId, freeBalance}
  } else {
    const [account, freeBalance] = ctx.event.args
    const walletId = encodeAddress(account, 73)
    return {walletId, freeBalance}
  }
}

export function getReservedEvent(ctx: EventContext): ReservedEvent {
  const reservedEvent = new BalancesReservedEvent(ctx)
  if (reservedEvent.isV23) {
    const [who, amount] = reservedEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, amount}
  } else if (reservedEvent.isV34) {
    const {who, amount} = reservedEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, amount}
  } else {
    const [who, amount] = ctx.event.args
    const walletId = encodeAddress(who, 73)
    return {walletId, amount}
  }
}

export function getTransferEvent(ctx: EventContext): TransferEvent {
  const transferEvent = new BalancesTransferEvent(ctx)
  if (transferEvent.isV23) {
    const [from, to, amount] = transferEvent.asV23
    const fromId = ss58.codec('zeitgeist').encode(from)
    const toId = ss58.codec('zeitgeist').encode(to)
    return {fromId, toId, amount}
  } else if (transferEvent.isV34) {
    const {from, to, amount} = transferEvent.asV34
    const fromId = ss58.codec('zeitgeist').encode(from)
    const toId = ss58.codec('zeitgeist').encode(to)
    return {fromId, toId, amount}
  } else {
    const [from, to, amount] = ctx.event.args
    const fromId = encodeAddress(from, 73)
    const toId = encodeAddress(to, 73)
    return {fromId, toId, amount}
  }
}

export function getUnreservedEvent(ctx: EventContext): UnreservedEvent {
  const unreservedEvent = new BalancesUnreservedEvent(ctx)
  if (unreservedEvent.isV23) {
    const [who, amount] = unreservedEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, amount}
  } else if (unreservedEvent.isV34) {
    const {who, amount} = unreservedEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, amount}
  } else {
    const [who, amount] = ctx.event.args
    const walletId = encodeAddress(who, 73)
    return {walletId, amount}
  }
}

interface BalanceSetEvent {
  walletId: string
  free: bigint
}

interface DustLostEvent {
  walletId: string
  amount: bigint
}

interface EndowedEvent {
  walletId: string
  freeBalance: bigint
}

interface ReservedEvent {
  walletId: string
  amount: bigint
}

interface TransferEvent {
  fromId: string
  toId: string
  amount: bigint
}

interface UnreservedEvent {
  walletId: string
  amount: bigint
}