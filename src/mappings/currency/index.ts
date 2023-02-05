import { EventHandlerContext, SubstrateEvent } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, Asset, HistoricalAccountBalance } from '../../model'
import { initBalance } from '../helper'
import { getDepositedEvent, getTransferredEvent, getWithdrawnEvent } from './types'


export async function currencyDeposited(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, walletId, amount } = getDepositedEvent(ctx)

  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    acc = new Account()
    acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    acc.accountId = walletId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
    await initBalance(acc, store, block, event as SubstrateEvent)
  }

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: assetId })
  if (!ab) { return }

  let eHab = await store.get(HistoricalAccountBalance, { where: 
    { accountId: acc.accountId, assetId: assetId, event: 'Endowed', blockNumber: block.height } })
  if (!eHab) {
    ab.balance = ab.balance + amount
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)
  } else {
    eHab.event = eHab.event.concat(event.name.split('.')[1])
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(eHab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(eHab) 
    return  
  }

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = amount
  hab.balance = ab.balance
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

export async function currencyTransferred(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, fromId, toId, amount } = getTransferredEvent(ctx)
  if (assetId === 'Ztg') { return }

  let fromAcc = await store.get(Account, { where: { accountId: fromId } })
  if (!fromAcc) {
    fromAcc = new Account()
    fromAcc.id = event.id + '-' + fromId.substring(fromId.length - 5)
    fromAcc.accountId = fromId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(fromAcc, null, 2)}`)
    await store.save<Account>(fromAcc)
    await initBalance(fromAcc, store, block, event as SubstrateEvent)
  }

  let fromAb = await store.findOneBy(AccountBalance, { account: { accountId: fromId }, assetId: assetId })
  if (fromAb) {
    fromAb.balance = fromAb.balance - amount
  } else {
    fromAb = new AccountBalance()
    fromAb.id = event.id + '-' + fromId.substring(fromId.length - 5)
    fromAb.account = fromAcc
    fromAb.assetId = assetId
    fromAb.balance = - amount
  }
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(fromAb, null, 2)}`)
  await store.save<AccountBalance>(fromAb)

  let fromHab = new HistoricalAccountBalance()
  fromHab.id = event.id + '-' + fromId.substring(fromId.length - 5)
  fromHab.accountId = fromAcc.accountId
  fromHab.event = event.name.split('.')[1]
  fromHab.assetId = fromAb.assetId
  fromHab.dBalance = - amount
  fromHab.balance = fromAb.balance
  fromHab.blockNumber = block.height
  fromHab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(fromHab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(fromHab)

  let toAcc = await store.get(Account, { where: { accountId: toId } })
  if (!toAcc) {
    toAcc = new Account()
    toAcc.id = event.id + '-' + toId.substring(toId.length - 5)
    toAcc.accountId = toId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(toAcc, null, 2)}`)
    await store.save<Account>(toAcc)
    await initBalance(toAcc, store, block, event as SubstrateEvent)
  }

  let toAb = await store.findOneBy(AccountBalance, { account: { accountId: toId }, assetId: assetId })
  if (!toAb) { return }

  let hab = await store.get(HistoricalAccountBalance, { where: 
    { accountId: toAcc.accountId, assetId: assetId, event: 'Endowed', blockNumber: block.height } })
  if (!hab) {
    toAb.balance = toAb.balance + amount
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(toAb, null, 2)}`)
    await store.save<AccountBalance>(toAb)
  } else {
    hab.event = hab.event.concat(event.name.split('.')[1])
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab) 
    return
  }

  let toHab = new HistoricalAccountBalance()
  toHab.id = event.id + '-' + toId.substring(toId.length - 5)
  toHab.accountId = toAcc.accountId
  toHab.event = event.name.split('.')[1]
  toHab.assetId = toAb.assetId
  toHab.dBalance = amount
  toHab.balance = toAb.balance
  toHab.blockNumber = block.height
  toHab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(toHab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(toHab)
}

export async function currencyWithdrawn(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, walletId, amount } = getWithdrawnEvent(ctx)

  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    acc = new Account()
    acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    acc.accountId = walletId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
    await initBalance(acc, store, block, event as SubstrateEvent)
  }

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: assetId })
  if (!ab) {
    ab = new AccountBalance()
    ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    ab.account = acc
    ab.assetId = assetId
    ab.balance = - amount
  } else {
    ab.balance = ab.balance - amount
  }
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = - amount
  hab.balance = ab.balance
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}