import { encodeAddress } from '@polkadot/keyring'
import * as ss58 from '@subsquid/ss58'
import { EventContext } from '../../types/support'
import { ParachainStakingRewardedEvent } from '../../types/events'


export const getRewardedEvent = (ctx: EventContext): RewardedEvent => {
  const event = new ParachainStakingRewardedEvent(ctx)
  if (event.isV23) {
    const [accountId, rewards] = event.asV23
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return { walletId, rewards }
  } else if (event.isV35) {
    const { account, rewards }  = event.asV35
    const walletId = ss58.codec('zeitgeist').encode(account)
    return { walletId, rewards }
  } else {
    const [accountId, rewards] = ctx.event.args
    const walletId = encodeAddress(accountId, 73)
    return { walletId, rewards }
  }
}

interface RewardedEvent {
  walletId: string
  rewards: bigint
}