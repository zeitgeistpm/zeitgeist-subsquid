import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { initBalance } from '../helper';
import { getDepositedEvent, getTransferredEvent, getWithdrawnEvent } from './types';

export const currencyDeposited = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, walletId, amount } = getDepositedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: assetId,
  });
  if (!ab) {
    return;
  }

  let eHab = await ctx.store.get(HistoricalAccountBalance, {
    where: {
      accountId: acc.accountId,
      assetId: assetId,
      event: 'Endowed',
      blockNumber: block.height,
    },
  });
  if (!eHab) {
    ab.balance = ab.balance + amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);
  } else {
    eHab.event = eHab.event.concat(item.event.name.split('.')[1]);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(eHab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(eHab);
    return;
  }

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = amount;
  hab.balance = ab.balance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const currencyTransferred = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, fromId, toId, amount } = getTransferredEvent(ctx, item);
  if (assetId === 'Ztg') {
    return;
  }

  let fromAcc = await ctx.store.get(Account, { where: { accountId: fromId } });
  if (!fromAcc) {
    fromAcc = new Account();
    fromAcc.id = item.event.id + '-' + fromId.substring(fromId.length - 5);
    fromAcc.accountId = fromId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(fromAcc, null, 2)}`);
    await ctx.store.save<Account>(fromAcc);
    await initBalance(fromAcc, ctx.store, block, item);
  }

  let fromAb = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: fromId },
    assetId: assetId,
  });
  if (fromAb) {
    fromAb.balance = fromAb.balance - amount;
  } else {
    fromAb = new AccountBalance();
    fromAb.id = item.event.id + '-' + fromId.substring(fromId.length - 5);
    fromAb.account = fromAcc;
    fromAb.assetId = assetId;
    fromAb.balance = -amount;
  }
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(fromAb, null, 2)}`);
  await ctx.store.save<AccountBalance>(fromAb);

  let fromHab = new HistoricalAccountBalance();
  fromHab.id = item.event.id + '-' + fromId.substring(fromId.length - 5);
  fromHab.accountId = fromAcc.accountId;
  fromHab.event = item.event.name.split('.')[1];
  fromHab.assetId = fromAb.assetId;
  fromHab.dBalance = -amount;
  fromHab.balance = fromAb.balance;
  fromHab.blockNumber = block.height;
  fromHab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(fromHab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(fromHab);

  let toAcc = await ctx.store.get(Account, { where: { accountId: toId } });
  if (!toAcc) {
    toAcc = new Account();
    toAcc.id = item.event.id + '-' + toId.substring(toId.length - 5);
    toAcc.accountId = toId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(toAcc, null, 2)}`);
    await ctx.store.save<Account>(toAcc);
    await initBalance(toAcc, ctx.store, block, item);
  }

  let toAb = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: toId },
    assetId: assetId,
  });
  if (!toAb) {
    return;
  }

  let hab = await ctx.store.get(HistoricalAccountBalance, {
    where: {
      accountId: toAcc.accountId,
      assetId: assetId,
      event: 'Endowed',
      blockNumber: block.height,
    },
  });
  if (!hab) {
    toAb.balance = toAb.balance + amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(toAb, null, 2)}`);
    await ctx.store.save<AccountBalance>(toAb);
  } else {
    hab.event = hab.event.concat(item.event.name.split('.')[1]);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
    return;
  }

  let toHab = new HistoricalAccountBalance();
  toHab.id = item.event.id + '-' + toId.substring(toId.length - 5);
  toHab.accountId = toAcc.accountId;
  toHab.event = item.event.name.split('.')[1];
  toHab.assetId = toAb.assetId;
  toHab.dBalance = amount;
  toHab.balance = toAb.balance;
  toHab.blockNumber = block.height;
  toHab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(toHab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(toHab);
};

export const currencyWithdrawn = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, walletId, amount } = getWithdrawnEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: assetId,
  });
  if (!ab) {
    ab = new AccountBalance();
    ab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    ab.account = acc;
    ab.assetId = assetId;
    ab.balance = -amount;
  } else {
    ab.balance = ab.balance - amount;
  }
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = -amount;
  hab.balance = ab.balance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};
