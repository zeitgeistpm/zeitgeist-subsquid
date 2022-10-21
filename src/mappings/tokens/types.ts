import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { EventContext } from '../../types/support'
import { TokensEndowedEvent, TokensTransferEvent } from '../../types/events'
import { getAssetId } from '../helper'


export function getTokensEndowedEvent(ctx: EventContext): EndowedEvent {
  const event = new TokensEndowedEvent(ctx)
  let currencyId, walletId, who, amount
  if (event.isV23) {
    [currencyId, who, amount] = event.asV23
    walletId = ss58.codec('zeitgeist').encode(who)
  } else if (event.isV32) {
    [currencyId, who, amount] = event.asV32
    walletId = ss58.codec('zeitgeist').encode(who)
  } else if (event.isV34) {
    currencyId = event.asV34.currencyId
    walletId = ss58.codec('zeitgeist').encode(event.asV34.who)
    amount = event.asV34.amount
  } else {
    [currencyId, who, amount] = ctx.event.args
    walletId = encodeAddress(who, 73)
  }
  const assetId = getAssetId(currencyId)
  return {assetId, walletId, amount}
}

export function getTokensTransferEvent(ctx: EventContext): TransferEvent {
  const transferEvent = new TokensTransferEvent(ctx)
  let currencyId, from, fromId, to, toId, amount
  if (transferEvent.isV23) {
    [currencyId, from, to, amount] = transferEvent.asV23
    fromId = ss58.codec('zeitgeist').encode(from)
    toId = ss58.codec('zeitgeist').encode(to)
  } else if (transferEvent.isV32) {
    [currencyId, from, to, amount] = transferEvent.asV32
    fromId = ss58.codec('zeitgeist').encode(from)
    toId = ss58.codec('zeitgeist').encode(to)
  } else if (transferEvent.isV34) {
    currencyId = transferEvent.asV34.currencyId
    fromId = ss58.codec('zeitgeist').encode(transferEvent.asV34.from)
    toId = ss58.codec('zeitgeist').encode(transferEvent.asV34.to)
    amount = transferEvent.asV34.amount
  } else {
    [currencyId, from, to, amount] = ctx.event.args
    fromId = encodeAddress(from, 73)
    toId = encodeAddress(to, 73)
  }
  const assetId = getAssetId(currencyId)
  return {assetId, fromId, toId, amount}
}

interface EndowedEvent {
  assetId: any
  walletId: string
  amount: bigint
}

interface TransferEvent {
  assetId: any
  fromId: string
  toId: string
  amount: bigint
}