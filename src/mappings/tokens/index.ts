import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent, initBalance, Transfer } from '../helper';
import {
  getTokensBalanceSetEvent,
  getTokensDepositedEvent,
  getTokensTransferEvent,
  getTokensWithdrawnEvent,
} from './types';

export const tokensBalanceSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, walletId, amount } = getTokensBalanceSetEvent(ctx, item);

  if (!assetId.includes(`pool`)) return;

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) return;

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: assetId,
  });
  let oldBalance = BigInt(0);
  if (ab) {
    oldBalance = ab.balance;
    ab.balance = amount;
  } else {
    ab = new AccountBalance();
    ab.id = walletId + '-' + assetId;
    ab.account = acc;
    ab.assetId = assetId;
    ab.balance = amount;
  }
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = ab.assetId;
  hab.dBalance = ab.balance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const tokensDeposited = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, walletId, amount } = getTokensDepositedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = assetId;
  hab.dBalance = amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const tokensTransfer = async (ctx: Ctx, block: SubstrateBlock, item: EventItem): Promise<Transfer> => {
  const { assetId, fromId, toId, amount } = getTokensTransferEvent(ctx, item);

  let fromAcc = await ctx.store.get(Account, { where: { accountId: fromId } });
  if (!fromAcc) {
    fromAcc = new Account();
    fromAcc.id = fromId;
    fromAcc.accountId = fromId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(fromAcc, null, 2)}`);
    await ctx.store.save<Account>(fromAcc);
    await initBalance(fromAcc, ctx.store, block, item);
  }

  const fromHab = new HistoricalAccountBalance();
  fromHab.id = item.event.id + '-' + fromId.substring(fromId.length - 5);
  fromHab.accountId = fromAcc.accountId;
  fromHab.event = item.event.name.split('.')[1];
  fromHab.extrinsic = extrinsicFromEvent(item.event);
  fromHab.assetId = assetId;
  fromHab.dBalance = -amount;
  fromHab.blockNumber = block.height;
  fromHab.timestamp = new Date(block.timestamp);

  let toAcc = await ctx.store.get(Account, { where: { accountId: toId } });
  if (!toAcc) {
    toAcc = new Account();
    toAcc.id = toId;
    toAcc.accountId = toId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(toAcc, null, 2)}`);
    await ctx.store.save<Account>(toAcc);
    await initBalance(toAcc, ctx.store, block, item);
  }

  const toHab = new HistoricalAccountBalance();
  toHab.id = item.event.id + '-' + toId.substring(toId.length - 5);
  toHab.accountId = toAcc.accountId;
  toHab.event = item.event.name.split('.')[1];
  toHab.extrinsic = extrinsicFromEvent(item.event);
  toHab.assetId = assetId;
  toHab.dBalance = amount;
  toHab.blockNumber = block.height;
  toHab.timestamp = new Date(block.timestamp);

  return { fromHab, toHab };
};

export const tokensWithdrawn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, walletId, amount } = getTokensWithdrawnEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = assetId;
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
