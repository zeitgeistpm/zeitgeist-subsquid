import { EventHandlerContext, SubstrateEvent } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, Asset, HistoricalAccountBalance } from '../../model'
import { initBalance } from '../helper'
import { getTokensEndowedEvent } from './types'


export async function tokensEndowed(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, walletId, amount } = getTokensEndowedEvent(ctx)
  
  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    acc = new Account()
    acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    acc.accountId = walletId
    acc.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
    await initBalance(acc, store, block, event as SubstrateEvent)
  }

  const asset = await store.get(Asset, { where: { assetId: assetId } })

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: assetId })
  if (ab) { return } 
  ab = new AccountBalance()
  ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  ab.account = acc
  ab.assetId = assetId
  ab.balance = amount
  ab.value = asset ? asset.price ? asset.price * Number(ab.balance) : 0 : null
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  acc.pvalue = ab.value ? acc.pvalue - 0 + ab.value! : acc.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await store.save<Account>(acc)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = amount
  hab.balance = ab.balance
  hab.dValue = ab.value
  hab.value = ab.value
  hab.pvalue = acc.pvalue
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}