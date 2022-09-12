import { EventHandlerContext } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import { Account, AccountBalance, HistoricalAccountBalance } from '../model'
import { Tools } from '../processor/util';
import { AccountInfo } from '@polkadot/types/interfaces/system';

export async function initBalance(acc: Account, ctx: EventHandlerContext<Store, {event: {args: true}}>) {
  const sdk = await Tools.getSDK()
  const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(
    blockZero,
    acc.accountId
  )) as AccountInfo;

  acc.pvalue = Number(acc.pvalue) + Number(amt)
  console.log(`[${ctx.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await ctx.store.save<Account>(acc)

  let ab = new AccountBalance()
  ab.id = ctx.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5)
  ab.account = acc
  ab.assetId = 'Ztg'
  ab.balance = amt.toBigInt()
  console.log(`[${ctx.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await ctx.store.save<AccountBalance>(ab)

  let hab = new HistoricalAccountBalance()
  hab.id = ctx.event.id + '-000-' + acc.accountId.substring(acc.accountId.length - 5)
  hab.accountId = acc.accountId
  hab.event = 'Initialised'
  hab.assetId = ab.assetId
  hab.dBalance = amt.toBigInt()
  hab.balance = ab.balance
  hab.pvalue = acc.pvalue
  hab.blockNumber = 0
  hab.timestamp = new Date(ctx.block.timestamp)
  console.log(`[${ctx.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await ctx.store.save<HistoricalAccountBalance>(hab)
}