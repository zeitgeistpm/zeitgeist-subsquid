import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { CurrencyTransferredEvent } from '../../types/events'
import { EventContext } from '../../types/support'
import { getAssetId } from '../helper'


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

interface TransferredEvent {
  assetId: string
  fromId: string
  toId: string
  amount: bigint
}