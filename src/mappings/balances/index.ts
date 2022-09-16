import { EventHandlerContext, SubstrateEvent } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model'
import { initBalance } from '../helper'
import { getBalanceSetEvent, getDustLostEvent, getEndowedEvent, getTransferEvent } from './types'


export async function balancesBalanceSet(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { walletId, free } = getBalanceSetEvent(ctx)

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

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: "Ztg" })
  if (ab) {
    let ehab = await store.get(HistoricalAccountBalance, { where: 
      { accountId: acc.accountId, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
    if (!ehab) {
      ab.balance = free
      ab.value = Number(ab.balance)
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
      await store.save<AccountBalance>(ab)

      acc.pvalue = Number(acc.pvalue) + Number(free)
      console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
      await store.save<Account>(acc)

      let hab = new HistoricalAccountBalance()
      hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
      hab.accountId = acc.accountId
      hab.event = event.name.split('.')[1]
      hab.assetId = ab.assetId
      hab.dBalance = free
      hab.balance = ab.balance
      hab.dValue = Number(hab.dBalance)
      hab.value = Number(hab.balance)
      hab.pvalue = acc.pvalue
      hab.blockNumber = block.height
      hab.timestamp = new Date(block.timestamp)
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(hab)
    } else {
      ehab.event = ehab.event.concat(event.name.split('.')[1])
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(ehab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(ehab) 
      return  
    }
  }
}

export async function balancesDustLost(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { walletId, amount } = getDustLostEvent(ctx)

  const ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: "Ztg" })
  if (!ab) { return }

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = walletId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = amount
  hab.balance = BigInt(0)
  hab.dValue = Number(hab.dBalance)
  hab.value = Number(hab.balance)
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

export async function balancesEndowed(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {walletId, freeBalance} = getEndowedEvent(ctx)

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
    
  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: "Ztg" })
  if (ab && ab.balance === BigInt(0)) {
    acc.pvalue = Number(acc.pvalue) + Number(freeBalance)
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    ab.balance = ab.balance + freeBalance
    ab.value = Number(ab.balance)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    let hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.name.split('.')[1]
    hab.assetId = ab.assetId
    hab.dBalance = freeBalance
    hab.balance = ab.balance
    hab.dValue = Number(hab.dBalance)
    hab.value = Number(hab.balance)
    hab.pvalue = acc.pvalue
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
  }
}

export async function balancesTransfer(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {fromId, toId, amount} = getTransferEvent(ctx)

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

  let faAB = await store.findOneBy(AccountBalance, { account: { accountId: fromId }, assetId: "Ztg" })
  if (faAB) {
    faAB.balance = faAB.balance - amount
    faAB.value = Number(faAB.balance)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
    await store.save<AccountBalance>(faAB)

    fa.pvalue = Number(fa.pvalue) - Number(amount)
    console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
    await store.save<Account>(fa)

    let faHAB = new HistoricalAccountBalance()
    faHAB.id = event.id + '-' + fromId.substring(fromId.length - 5)
    faHAB.accountId = fa.accountId
    faHAB.event = event.name.split('.')[1]
    faHAB.assetId = faAB.assetId
    faHAB.dBalance = - amount
    faHAB.balance = faAB.balance
    faHAB.dValue = Number(faHAB.dBalance)
    faHAB.value = Number(faHAB.balance)
    faHAB.pvalue = fa.pvalue
    faHAB.blockNumber = block.height
    faHAB.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAccountBalance>(faHAB)

    let dhab = await store.get(HistoricalAccountBalance, { where: 
      { accountId: fa.accountId, assetId: "Ztg", event: "DustLost", blockNumber: block.height } })
    if (dhab) {
      faAB.balance = faAB.balance - dhab.dBalance
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
      await store.save<AccountBalance>(faAB)

      fa.pvalue = Number(fa.pvalue) - Number(dhab.dBalance)
      console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
      await store.save<Account>(fa)

      dhab.dBalance = - dhab.dBalance
      dhab.balance = faAB.balance
      dhab.dValue = Number(dhab.dBalance)
      dhab.value = Number(dhab.balance)
      dhab.pvalue = fa.pvalue
      console.log(`[${event.name}] Updating historical asset balance: ${JSON.stringify(dhab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(dhab)
    }
  } 
    
  let ta = await store.get(Account, { where: { accountId: toId } })
  if (!ta) {
    ta = new Account()
    ta.id = event.id + '-' + toId.substring(toId.length - 5)
    ta.accountId = toId
    ta.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
    await store.save<Account>(ta)
    await initBalance(fa, store, block, event as SubstrateEvent)
  }

  let taAB = await store.findOneBy(AccountBalance, { account: { accountId: toId }, assetId: "Ztg" })
  if (taAB) {
    let hab = await store.get(HistoricalAccountBalance, { where: 
        { accountId: ta.accountId, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
    if (!hab) {
      taAB.balance = taAB.balance + amount
      taAB.value = Number(taAB.balance)
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
      await store.save<AccountBalance>(taAB)

      ta.pvalue = Number(ta.pvalue) + Number(amount)
      console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
      await store.save<Account>(ta)

      let taHAB = new HistoricalAccountBalance()
      taHAB.id = event.id + '-' + toId.substring(toId.length - 5)
      taHAB.accountId = ta.accountId
      taHAB.event = event.name.split('.')[1]
      taHAB.assetId = taAB.assetId
      taHAB.dBalance = amount
      taHAB.balance = taAB.balance
      taHAB.dValue = Number(taHAB.dBalance)
      taHAB.value = Number(taHAB.balance)
      taHAB.pvalue = ta.pvalue
      taHAB.blockNumber = block.height
      taHAB.timestamp = new Date(block.timestamp)
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(taHAB, null, 2)}`)
      await store.save<HistoricalAccountBalance>(taHAB)
    } else {
      hab.event = hab.event.concat(event.name.split('.')[1])
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(hab) 
      return  
    }
  }
}

export async function balancesTransferOld(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const {store, block, event} = ctx
  const {fromId, toId, amount} = getTransferEvent(ctx)
  
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

  let faAB = await store.findOneBy(AccountBalance, { account: { accountId: fromId }, assetId: "Ztg" })
  if (faAB) {
    faAB.balance = faAB.balance - amount
    faAB.value = Number(faAB.balance)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
    await store.save<AccountBalance>(faAB)

    fa.pvalue = Number(fa.pvalue) - Number(amount)
    console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
    await store.save<Account>(fa)

    let faHAB = new HistoricalAccountBalance()
    faHAB.id = event.id + '-' + fromId.substring(fromId.length - 5)
    faHAB.accountId = fa.accountId
    faHAB.event = event.name.split('.')[1]
    faHAB.assetId = faAB.assetId
    faHAB.dBalance = - amount
    faHAB.balance = faAB.balance
    faHAB.dValue = Number(faHAB.dBalance)
    faHAB.value = Number(faHAB.balance)
    faHAB.pvalue = fa.pvalue
    faHAB.blockNumber = block.height
    faHAB.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAccountBalance>(faHAB)
  } 
  
  let ta = await store.get(Account, { where: { accountId: toId } })
  if (!ta) {
    ta = new Account()
    ta.id = event.id + '-' + toId.substring(toId.length - 5)
    ta.accountId = toId
    ta.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
    await store.save<Account>(ta)
    await initBalance(fa, store, block, event as SubstrateEvent)
  }

  let taAB = await store.findOneBy(AccountBalance, { account: { accountId: toId }, assetId: "Ztg" })
  if (taAB) {
    let hab = await store.get(HistoricalAccountBalance, { where: 
        { accountId: ta.accountId, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
    if (!hab) {
      taAB.balance = taAB.balance + amount
      taAB.value = Number(taAB.balance)
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
      await store.save<AccountBalance>(taAB)

      ta.pvalue = Number(ta.pvalue) + Number(amount)
      console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
      await store.save<Account>(ta)

      let taHAB = new HistoricalAccountBalance()
      taHAB.id = event.id + '-' + toId.substring(toId.length - 5)
      taHAB.accountId = ta.accountId
      taHAB.event = event.name.split('.')[1]
      taHAB.assetId = taAB.assetId
      taHAB.dBalance = amount
      taHAB.balance = taAB.balance
      taHAB.dValue = Number(taHAB.dBalance)
      taHAB.value = Number(taHAB.balance)
      taHAB.pvalue = ta.pvalue
      taHAB.blockNumber = block.height
      taHAB.timestamp = new Date(block.timestamp)
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(taHAB, null, 2)}`)
      await store.save<HistoricalAccountBalance>(taHAB)
    } else {
      hab.event = hab.event.concat(event.name.split('.')[1])
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
      await store.save<HistoricalAccountBalance>(hab)
      return
    }
  }
}