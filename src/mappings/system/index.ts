import { encodeAddress } from '@polkadot/keyring'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model'
import { getFees, initBalance } from '../helper'
import { getExtrinsicFailedEvent, getExtrinsicSuccessEvent, getKilledAccountEvent, 
  getNewAccountEvent } from './types'


export async function systemExtrinsicFailed(ctx: EventHandlerContext<Store>) {
  const { store, block, event } = ctx
  if (!event.extrinsic || !event.extrinsic.signature || !event.extrinsic.signature.address) { return }
  const { dispatchInfo } = getExtrinsicFailedEvent(ctx)
  if (dispatchInfo.paysFee.__kind == 'No') { return }

  const walletId = encodeAddress(event.extrinsic.signature.address['value'], 73)
  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    acc = new Account()
    acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    acc.accountId = walletId
    acc.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
    await initBalance(acc, store, block, event)
  }

  const txnFees = await getFees(block, event.extrinsic) 
  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: 'Ztg' })
  if (ab) {
    acc.pvalue = Number(acc.pvalue) - Number(txnFees)
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    ab.balance = ab.balance - txnFees
    ab.value = Number(ab.balance)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    let hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.name.split('.')[1]
    hab.assetId = ab.assetId
    hab.dBalance = - txnFees
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

export async function systemExtrinsicSuccess(ctx: EventHandlerContext<Store>) {
  const { store, block, event } = ctx
  if (!event.extrinsic || !event.extrinsic.signature || !event.extrinsic.signature.address) { return }
  const { dispatchInfo } = getExtrinsicSuccessEvent(ctx)
  if (dispatchInfo.paysFee.__kind == 'No' ) { return }

  const walletId = encodeAddress(event.extrinsic.signature.address['value'], 73)
  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    acc = new Account()
    acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    acc.accountId = walletId
    acc.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)
    await initBalance(acc, store, block, event)
  }

  const txnFees = await getFees(block, event.extrinsic) 
  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: 'Ztg' })
  if (ab) {
    acc.pvalue = Number(acc.pvalue) - Number(txnFees)
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    ab.balance = ab.balance - txnFees
    ab.value = Number(ab.balance)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    let hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.name.split('.')[1]
    hab.assetId = ab.assetId
    hab.dBalance = - txnFees
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

export async function systemKilledAccount(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { walletId } = getKilledAccountEvent(ctx)

  let acc = await store.get(Account, { where: { accountId: walletId } })
  if (!acc) return
  acc.pvalue = 0
  console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await store.save<Account>(acc)

  let ab = await store.findOneBy(AccountBalance, { account: { accountId: walletId }, assetId: 'Ztg' })
  if (!ab) return
  const oldBalance = ab.balance
  const newBalance = BigInt(0)
  ab.balance = newBalance
  ab.value = Number(ab.balance)
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = acc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = newBalance - oldBalance
  hab.balance = newBalance
  hab.dValue = Number(hab.dBalance)
  hab.value = Number(hab.balance)
  hab.pvalue = acc.pvalue
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

export async function systemNewAccount(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, block, event } = ctx
  const { walletId } = getNewAccountEvent(ctx)

  const acc = await store.get(Account, { where: { accountId: walletId } })
  if (acc) return
  
  let newAcc = new Account()
  newAcc.id = event.id + '-' + walletId.substring(walletId.length - 5)
  newAcc.accountId = walletId
  newAcc.pvalue = 0
  console.log(`[${event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`)
  await store.save<Account>(newAcc)

  let ab = new AccountBalance()
  ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  ab.account = newAcc
  ab.assetId = 'Ztg'
  ab.balance = BigInt(0)
  ab.value = Number(ab.balance)
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  hab.accountId = newAcc.accountId
  hab.event = event.name.split('.')[1]
  hab.assetId = ab.assetId
  hab.dBalance = BigInt(0)
  hab.balance = ab.balance
  hab.dValue = Number(hab.dBalance)
  hab.value = Number(hab.balance)
  hab.pvalue = 0
  hab.blockNumber = block.height
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}