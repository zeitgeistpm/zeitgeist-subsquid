import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { ParachainStakingRewardedEvent } from '../../types/events'
import * as ss58 from '@subsquid/ss58'

export function getRewardedEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): RewardedEvent {
  const rewardedEvent = new ParachainStakingRewardedEvent(ctx)
  if (rewardedEvent.isV23) {
    const [ accountId, amount ] = rewardedEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return { walletId, amount }
  } else if (rewardedEvent.isV35) {
    const { account, rewards }  = rewardedEvent.asV35
    const walletId = ss58.codec('zeitgeist').encode(account)
    const amount = rewards
    return { walletId, amount }
  } else {
    const [accountId, amount] = ctx.event.args
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return { walletId, amount }
  }
}

interface RewardedEvent {
  walletId: string
  amount: bigint
}