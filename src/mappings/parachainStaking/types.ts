import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { ParachainStakingRewardedEvent } from '../../types/events'
import * as ss58 from '@subsquid/ss58'

export function getRewardedEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): RewardedEvent|undefined {
  const rewardedEvent = new ParachainStakingRewardedEvent(ctx)
  if (rewardedEvent.isV23) {
    const accountId = rewardedEvent.asV23[0]
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    const amount = rewardedEvent.asV23[1]
    return { walletId, amount }
  } else if (rewardedEvent.isV35) {
    const accountId = rewardedEvent.asV35.account
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    const amount = rewardedEvent.asV35.rewards
    return { walletId, amount }
  } else {
    const [walletId, amount] = ctx.event.args
    return { walletId, amount }
  }
}

interface RewardedEvent {
  walletId: string
  amount: bigint
}