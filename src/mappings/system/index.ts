import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model'
import { getNewAccountEvent } from './types'

export async function systemNewAccount(ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const { store, event, block } = ctx
  const { walletId } = getNewAccountEvent(ctx)

  const acc = await store.get(Account, { where: { accountId: walletId } })
  if (acc) return
  
  const newAcc = new Account()
  newAcc.id = event.id + '-' + walletId.substring(walletId.length - 5)
  newAcc.accountId = walletId
  newAcc.pvalue = 0
  console.log(`[${event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`)
  await store.save<Account>(newAcc)

  const ab = new AccountBalance()
  ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
  ab.account = newAcc
  ab.assetId = "Ztg"
  ab.balance = BigInt(0)
  ab.value = Number(ab.balance)
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  const hab = new HistoricalAccountBalance()
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