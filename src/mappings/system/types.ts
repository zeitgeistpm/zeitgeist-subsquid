import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { SystemNewAccountEvent } from '../../types/events'
import * as ss58 from '@subsquid/ss58'

export function getNewAccountEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): NewAccountEvent {
  const newAccountEvent = new SystemNewAccountEvent(ctx)
  if (newAccountEvent.isV23) {
    const accountId = newAccountEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return { walletId }
  } else if (newAccountEvent.isV34) {
    const  { account } = newAccountEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(account)
    return { walletId }
  } else {
    const [accountId] = ctx.event.args
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return { walletId }
  }
}

interface NewAccountEvent {
  walletId: string
}