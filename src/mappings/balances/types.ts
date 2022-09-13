import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { EventContext } from '../../types/support'
import { BalancesEndowedEvent } from '../../types/events'


export function getBalancesEndowedEvent(ctx: EventContext): EndowedEvent {
  const balancesEndowedEvent = new BalancesEndowedEvent(ctx)
  if (balancesEndowedEvent.isV23) {
    const [account, freeBalance] = balancesEndowedEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(account)
    return {walletId, freeBalance}
  } else if (balancesEndowedEvent.isV34) {
    const {account, freeBalance} = balancesEndowedEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(account)
    return {walletId, freeBalance}
  } else {
    const {account, freeBalance} = ctx.event.args
    const walletId = encodeAddress(account, 73)
    return {walletId, freeBalance}
  }
}

interface EndowedEvent {
  walletId: string
  freeBalance: bigint
}