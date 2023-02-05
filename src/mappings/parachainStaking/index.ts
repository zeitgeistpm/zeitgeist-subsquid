import { EventHandlerContext, SubstrateEvent } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model'
import { initBalance } from '../helper'
import { getRewardedEvent } from './types'

export const parachainStakingRewarded = async(ctx: EventHandlerContext<Store, {event: {args: true}}>) => {
  const { store, block, event } = ctx
  const { walletId, rewards } = getRewardedEvent(ctx)

  let acc = await store.get(Account, { where: { accountId: walletId } } )
  if (!acc) {
    acc = new Account()
    acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    acc.accountId = walletId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
    await initBalance(acc, store, block, event as SubstrateEvent)
  }

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + rewards
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    let hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.name.split('.')[1]
    hab.assetId = ab.assetId
    hab.dBalance = rewards
    hab.balance = ab.balance
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
  }
}