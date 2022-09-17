import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { util } from '@zeitgeistpm/sdk'
import { TokensEndowedEvent } from '../../types/events'
import { EventContext } from '../../types/support'
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

interface EndowedEvent {
  assetId: any
  walletId: string
  amount: bigint
}