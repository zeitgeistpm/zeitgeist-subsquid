import { EventHandlerContext, SubstrateEvent } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, Asset, HistoricalAccountBalance } from '../../model'
import { initBalance } from '../helper'
import { getTokensBalanceSetEvent, getTokensDepositedEvent, getTokensEndowedEvent, getTokensTransferEvent, 
  getTokensWithdrawnEvent } from './types'


export async function tokensBalanceSet(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx 
  const { assetId, walletId, amount } = getTokensBalanceSetEvent(ctx)

  if (!assetId.includes(`pool`)) return
  
  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) return

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: assetId })
  let oldBalance = BigInt(0)
  if (ab) {
    oldBalance = ab.balance
    ab.balance = amount
  } else {
    ab = new AccountBalance()
    ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    ab.account = acc
    ab.assetId = assetId
    ab.balance = amount
  }
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = ab.balance - oldBalance
  hab.balance = ab.balance
  hab.pvalue = acc.pvalue
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

export async function tokensDeposited(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx 
  const { assetId, walletId, amount } = getTokensDepositedEvent(ctx)
  
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
  let oldValue = 0
  if (ab) {
    ab.balance = ab.balance + amount
    oldValue = ab.value ?? 0
  } else {
    ab = new AccountBalance()
    ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    ab.account = acc
    ab.assetId = assetId
    ab.balance = amount
  }
  ab.value = asset ? asset.price ? Number(ab.balance) * asset.price : 0 : null
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  acc.pvalue = ab.value ? acc.pvalue - oldValue + ab.value : acc.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await store.save<Account>(acc)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = amount
  hab.balance = ab.balance
  hab.dValue = ab.value ? ab.value - oldValue : 0
  hab.value = ab.value
  hab.pvalue = acc.pvalue
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

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
  
  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: assetId })
  if (!ab) {
    const asset = await store.get(Asset, { where: { assetId: assetId } })

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
    return
  }

  let hab = await store.get(HistoricalAccountBalance, { where: 
    { accountId: acc.accountId, assetId: assetId, event: 'Deposited', blockNumber: block.height } })
  if (!hab) {
    console.log(`Couldn't find Deposited event for ${assetId} on ${acc.accountId} at ${block.height}`)
    return
  }
  hab.event = hab.event.concat(event.name.split('.')[1])
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

export async function tokensTransfer(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, fromId, toId, amount } = getTokensTransferEvent(ctx)

  let fromAcc = await store.get(Account, { where: { accountId: fromId } })
  if (!fromAcc) {
    fromAcc = new Account()
    fromAcc.id = event.id + '-' + fromId.substring(fromId.length - 5)
    fromAcc.accountId = fromId
    fromAcc.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(fromAcc, null, 2)}`)
    await store.save<Account>(fromAcc)
    await initBalance(fromAcc, store, block, event as SubstrateEvent)
  }

  const asset = await store.get(Asset, { where: { assetId: assetId } })

  let fromAb = await store.findOneBy(AccountBalance, { account: { accountId: fromId }, assetId: assetId })
  let oldValue = 0
  if (fromAb) {
    fromAb.balance = fromAb.balance - amount
    oldValue = fromAb.value!
  } else {
    fromAb = new AccountBalance()
    fromAb.id = event.id + '-' + fromId.substring(fromId.length - 5)
    fromAb.account = fromAcc
    fromAb.assetId = assetId
    fromAb.balance = - amount
  }
  fromAb.value = asset ? asset.price ? Number(fromAb.balance) * asset.price : 0 : null
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(fromAb, null, 2)}`)
  await store.save<AccountBalance>(fromAb)

  fromAcc.pvalue = fromAb.value ? fromAcc.pvalue - oldValue + fromAb.value! : fromAcc.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(fromAcc, null, 2)}`)
  await store.save<Account>(fromAcc)

  let fromHab = new HistoricalAccountBalance()
  fromHab.id = event.id + '-' + fromId.substring(fromId.length - 5)
  fromHab.accountId = fromAcc.accountId
  fromHab.event = event.name.split('.')[1]
  fromHab.assetId = fromAb.assetId
  fromHab.dBalance = - amount
  fromHab.balance = fromAb.balance
  fromHab.dValue = fromAb.value ? fromAb.value - oldValue : 0
  fromHab.value = fromAb.value
  fromHab.pvalue = fromAcc.pvalue
  fromHab.blockNumber = block.height
  fromHab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(fromHab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(fromHab)

  let toAcc = await store.get(Account, { where: { accountId: toId } })
  if (!toAcc) {
    toAcc = new Account()
    toAcc.id = event.id + '-' + toId.substring(toId.length - 5)
    toAcc.accountId = toId
    toAcc.pvalue = 0
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
    oldValue = toAb.value!
    toAb.value = asset ? asset.price ? Number(toAb.balance) * asset.price : 0 : null
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(toAb, null, 2)}`)
    await store.save<AccountBalance>(toAb)
  } else {
    hab.event = hab.event.concat(event.name.split('.')[1])
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab) 
    return
  }

  toAcc.pvalue = toAb.value ? toAcc.pvalue - oldValue + toAb.value! : toAcc.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(toAcc, null, 2)}`)
  await store.save<Account>(toAcc)

  let toHab = new HistoricalAccountBalance()
  toHab.id = event.id + '-' + toId.substring(toId.length - 5)
  toHab.accountId = toAcc.accountId
  toHab.event = event.name.split('.')[1]
  toHab.assetId = toAb.assetId
  toHab.dBalance = amount
  toHab.balance = toAb.balance
  toHab.dValue = toAb.value ? toAb.value - oldValue : 0
  toHab.value = toAb.value
  toHab.pvalue = toAcc.pvalue
  toHab.blockNumber = block.height
  toHab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(toHab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(toHab)
}

export async function tokensWithdrawn(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { assetId, walletId, amount } = getTokensWithdrawnEvent(ctx)
  
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
  let oldValue = 0
  if (ab && ab.value) {
    ab.balance = ab.balance - amount
    oldValue = ab.value
  } else {
    ab = new AccountBalance()
    ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    ab.account = acc
    ab.assetId = assetId
    ab.balance = - amount
  }
  ab.value = asset ? asset.price ? Number(ab.balance) * asset.price : 0 : null
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  acc.pvalue = ab.value ? acc.pvalue - oldValue + ab.value : acc.pvalue
  console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await store.save<Account>(acc)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = - amount
  hab.balance = ab.balance
  hab.dValue = ab.value ? ab.value - oldValue : 0
  hab.value = ab.value
  hab.pvalue = acc.pvalue
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}