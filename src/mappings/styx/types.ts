import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { StyxAccountCrossedEvent } from '../../types/events'
import { EventContext } from '../../types/support'


export const getAccountCrossedEvent = (ctx: EventContext): AccountCrossedEvent => {
  const event = new StyxAccountCrossedEvent(ctx)
  if (event.isV39) {
    const [who, amount] = event.asV39
    const walletId = ss58.codec('zeitgeist').encode(who)
    return {walletId, amount}
  } else {
    const [who, amount] = ctx.event.args
    const walletId = encodeAddress(who, 73)
    return {walletId, amount}
  }
}

interface AccountCrossedEvent {
  walletId: string
  amount: bigint
}