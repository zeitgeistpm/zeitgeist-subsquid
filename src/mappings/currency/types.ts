import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { CurrencyDepositedEvent, CurrencyTransferredEvent, CurrencyWithdrawnEvent } from '../../types/events'
import { EventContext } from '../../types/support'
import { getAssetId } from '../helper'


export function getDepositedEvent(ctx: EventContext): DepositedEvent {
  const depositedEvent = new CurrencyDepositedEvent(ctx)
  let currencyId, who, walletId, amount
  if (depositedEvent.isV23) {
    [currencyId, who, amount] = depositedEvent.asV23
    walletId = ss58.codec('zeitgeist').encode(who)
  } else if (depositedEvent.isV32) {
    [currencyId, who, amount] = depositedEvent.asV32
    walletId = ss58.codec('zeitgeist').encode(who)
  } else if (depositedEvent.isV34) {
    currencyId = depositedEvent.asV34.currencyId
    walletId = ss58.codec('zeitgeist').encode(depositedEvent.asV34.who)
    amount = depositedEvent.asV34.amount
  } else {
    [currencyId, who, amount] = ctx.event.args
    walletId = encodeAddress(who, 73)
  }
  const assetId = getAssetId(currencyId)
  return {assetId, walletId, amount}
}

export function getTransferredEvent(ctx: EventContext): TransferredEvent {
  const transferredEvent = new CurrencyTransferredEvent(ctx)
  let currencyId, from, fromId, to, toId, amount
  if (transferredEvent.isV23) {
    [currencyId, from, to, amount] = transferredEvent.asV23
    fromId = ss58.codec('zeitgeist').encode(from)
    toId = ss58.codec('zeitgeist').encode(to)
  } else if (transferredEvent.isV32) {
    [currencyId, from, to, amount] = transferredEvent.asV32
    fromId = ss58.codec('zeitgeist').encode(from)
    toId = ss58.codec('zeitgeist').encode(to)
  } else if (transferredEvent.isV34) {
    currencyId = transferredEvent.asV34.currencyId
    fromId = ss58.codec('zeitgeist').encode(transferredEvent.asV34.from)
    toId = ss58.codec('zeitgeist').encode(transferredEvent.asV34.to)
    amount = transferredEvent.asV34.amount
  } else {
    [currencyId, from, to, amount] = ctx.event.args
    fromId = encodeAddress(from, 73)
    toId = encodeAddress(to, 73)
  }
  const assetId = getAssetId(currencyId)
  return {assetId, fromId, toId, amount}
}

export function getWithdrawnEvent(ctx: EventContext): WithdrawnEvent {
  const withdrawnEvent = new CurrencyWithdrawnEvent(ctx)
  let currencyId, who, walletId, amount
  if (withdrawnEvent.isV23) {
    [currencyId, who, amount] = withdrawnEvent.asV23
    walletId = ss58.codec('zeitgeist').encode(who)
  } else if (withdrawnEvent.isV32) {
    [currencyId, who, amount] = withdrawnEvent.asV32
    walletId = ss58.codec('zeitgeist').encode(who)
  } else if (withdrawnEvent.isV34) {
    currencyId = withdrawnEvent.asV34.currencyId
    walletId = ss58.codec('zeitgeist').encode(withdrawnEvent.asV34.who)
    amount = withdrawnEvent.asV34.amount
  } else {
    [currencyId, who, amount] = ctx.event.args
    walletId = encodeAddress(who, 73)
  }
  const assetId = getAssetId(currencyId)
  return {assetId, walletId, amount}
}

interface DepositedEvent {
  assetId: string
  walletId: string
  amount: bigint
}

interface TransferredEvent {
  assetId: string
  fromId: string
  toId: string
  amount: bigint
}

interface WithdrawnEvent {
  assetId: string
  walletId: string
  amount: bigint
}