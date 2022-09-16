import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { EventContext } from '../../types/support'
import { BalancesEndowedEvent, BalancesTransferEvent } from '../../types/events'


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

interface EndowedEvent {
  walletId: string
  freeBalance: bigint
}

interface TransferEvent {
  fromId: string
  toId: string
  amount: bigint
}