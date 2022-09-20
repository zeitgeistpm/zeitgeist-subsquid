import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { EventContext } from '../../types/support'
import { ParachainStakingRewardedEvent } from '../../types/events'


export function getRewardedEvent(ctx: EventContext): RewardedEvent {
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
    const walletId = encodeAddress(accountId, 73)
    return { walletId, amount }
  }
}

interface RewardedEvent {
  walletId: string
  amount: bigint
}