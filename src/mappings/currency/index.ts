import { EventHandlerContext, SubstrateEvent } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, Asset, HistoricalAccountBalance } from '../../model'
import { initBalance } from '../helper'
import { getTransferredEvent } from './types'

export async function currencyTransferred(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, fromId, toId, amount } = getTransferredEvent(ctx)
  if (assetId === "Ztg") { return }

  let fa = await store.get(Account, { where: { accountId: fromId } })
  if (!fa) {
    fa = new Account()
    fa.id = event.id + '-' + fromId.substring(fromId.length - 5)
    fa.accountId = fromId
    fa.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
    await store.save<Account>(fa)
    await initBalance(fa, store, block, event as SubstrateEvent)
  }

  const asset = await store.get(Asset, { where: { assetId: assetId } })

  let faAB = await store.findOneBy(AccountBalance, { account: { accountId: fromId }, assetId: assetId })
  let oldValue = 0
  if (faAB) {
    faAB.balance = faAB.balance - amount
    oldValue = faAB.value!
  } else {
    faAB = new AccountBalance()
    faAB.id = event.id + '-' + fromId.substring(fromId.length - 5)
    faAB.account = fa
    faAB.assetId = assetId
    faAB.balance = - amount
  }
  faAB.value = asset ? asset.price ? Number(faAB.balance) * asset.price : 0 : null
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
  await store.save<AccountBalance>(faAB)

  fa.pvalue = faAB.value ? fa.pvalue - oldValue + faAB.value! : fa.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
  await store.save<Account>(fa)

  let faHAB = new HistoricalAccountBalance()
  faHAB.id = event.id + '-' + fromId.substring(fromId.length - 5)
  faHAB.accountId = fa.accountId
  faHAB.event = event.name.split('.')[1]
  faHAB.assetId = faAB.assetId
  faHAB.dBalance = - amount
  faHAB.balance = faAB.balance
  faHAB.dValue = faAB.value ? faAB.value - oldValue : 0
  faHAB.value = faAB.value
  faHAB.pvalue = fa.pvalue
  faHAB.blockNumber = block.height
  faHAB.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
  await store.save<HistoricalAccountBalance>(faHAB)

  let ta = await store.get(Account, { where: { accountId: toId } })
  if (!ta) {
    ta = new Account()
    ta.id = event.id + '-' + toId.substring(toId.length - 5)
    ta.accountId = toId
    ta.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
    await store.save<Account>(ta)
    await initBalance(ta, store, block, event as SubstrateEvent)
  }

  let taAB = await store.findOneBy(AccountBalance, { account: { accountId: toId }, assetId: assetId })
  if (!taAB) { return }

  let hab = await store.get(HistoricalAccountBalance, { where: 
    { accountId: ta.accountId, assetId: assetId, event: "Endowed", blockNumber: block.height } })
  if (!hab) {
    taAB.balance = taAB.balance + amount
    oldValue = taAB.value!
    taAB.value = asset ? asset.price ? Number(taAB.balance) * asset.price : 0 : null
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
    await store.save<AccountBalance>(taAB)
  } else {
    hab.event = hab.event.concat(event.name.split('.')[1])
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab) 
    return
  }

  ta.pvalue = taAB.value ? ta.pvalue - oldValue + taAB.value! : ta.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
  await store.save<Account>(ta)

  let taHAB = new HistoricalAccountBalance()
  taHAB.id = event.id + '-' + toId.substring(toId.length - 5)
  taHAB.accountId = ta.accountId
  taHAB.event = event.name.split('.')[1]
  taHAB.assetId = taAB.assetId
  taHAB.dBalance = amount
  taHAB.balance = taAB.balance
  taHAB.dValue = taAB.value ? taAB.value - oldValue : 0
  taHAB.value = taAB.value
  taHAB.pvalue = ta.pvalue
  taHAB.blockNumber = block.height
  taHAB.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(taHAB, null, 2)}`)
  await store.save<HistoricalAccountBalance>(taHAB)
}