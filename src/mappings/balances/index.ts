import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent, initBalance } from '../helper';
import {
  getBalanceSetEvent,
  getDepositEvent,
  getDustLostEvent,
  getReserveRepatriatedEvent,
  getReservedEvent,
  getSlashedEvent,
  getTransferEvent,
  getUnreservedEvent,
  getWithdrawEvent,
} from './types';

export const balancesBalanceSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, free } = getBalanceSetEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  const newBalance = free;
  let eHab = await ctx.store.get(HistoricalAccountBalance, {
    where: {
      accountId: acc.accountId,
      assetId: 'Ztg',
      event: 'Endowed',
      blockNumber: block.height,
    },
  });
  if (!eHab) {
    ab.balance = newBalance;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    const hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.slice(-5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.extrinsic = extrinsicFromEvent(item.event);
    hab.assetId = ab.assetId;
    hab.dBalance = newBalance - oldBalance;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  } else {
    eHab.event = eHab.event.concat(item.event.name.split('.')[1]);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(eHab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(eHab);
    return;
  }
};

export const balancesDeposit = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, amount } = getDepositEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const balancesDustLost = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, amount } = getDustLostEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const balancesReserved = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, amount } = getReservedEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const balancesReserveRepatriated = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance | undefined> => {
  const { fromId, toId, amount, destinationStatus } = getReserveRepatriatedEvent(ctx, item);
  if (destinationStatus.__kind !== 'Free') return;

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + toId.slice(-5);
  hab.accountId = toId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const balancesSlashed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getSlashedEvent(ctx, item);

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    const hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.slice(-5);
    hab.accountId = walletId;
    hab.event = item.event.name.split('.')[1];
    hab.extrinsic = extrinsicFromEvent(item.event);
    hab.assetId = ab.assetId;
    hab.dBalance = -amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const balancesTransfer = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[]> => {
  const { fromId, toId, amount } = getTransferEvent(ctx, item);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance();
  fromHab.id = item.event.id + '-' + fromId.slice(-5);
  fromHab.accountId = fromId;
  fromHab.event = item.event.name.split('.')[1];
  fromHab.extrinsic = extrinsicFromEvent(item.event);
  fromHab.assetId = 'Ztg';
  fromHab.dBalance = -amount;
  fromHab.blockNumber = block.height;
  fromHab.timestamp = new Date(block.timestamp);
  habs.push(fromHab);

  const toHab = new HistoricalAccountBalance();
  toHab.id = item.event.id + '-' + toId.slice(-5);
  toHab.accountId = toId;
  toHab.event = item.event.name.split('.')[1];
  toHab.extrinsic = extrinsicFromEvent(item.event);
  toHab.assetId = 'Ztg';
  toHab.dBalance = amount;
  toHab.blockNumber = block.height;
  toHab.timestamp = new Date(block.timestamp);
  habs.push(toHab);

  return habs;
};

export const balancesUnreserved = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, amount } = getUnreservedEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const balancesWithdraw = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, amount } = getWithdrawEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
