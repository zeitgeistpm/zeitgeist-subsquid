import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent } from '../helper';
import {
  getTokensBalanceSetEvent,
  getTokensDepositedEvent,
  getTokensReservedEvent,
  getTokensTransferEvent,
  getTokensWithdrawnEvent,
} from './types';

export const tokensBalanceSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, accountId, amount } = getTokensBalanceSetEvent(ctx, item);
  if (!assetId.includes(`pool`)) return;

  const acc = await ctx.store.get(Account, { where: { accountId } });
  if (!acc) return;

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId,
  });
  if (!ab) {
    ab = new AccountBalance({
      account: acc,
      assetId,
      id: accountId + '-' + assetId,
      balance: BigInt(0),
    });
  }
  const oldBalance = ab.balance;
  ab.balance = amount;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: block.height,
    dBalance: ab.balance - oldBalance,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const tokensDeposited = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = getTokensDepositedEvent(ctx, item);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: block.height,
    dBalance: amount,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  return hab;
};

export const tokensReserved = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = getTokensReservedEvent(ctx, item);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: block.height,
    dBalance: -amount,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  return hab;
};

export const tokensTransfer = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[]> => {
  const { assetId, fromId, toId, amount } = getTokensTransferEvent(ctx, item);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: fromId,
    assetId,
    blockNumber: block.height,
    dBalance: -amount,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + fromId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: toId,
    assetId,
    blockNumber: block.height,
    dBalance: amount,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + toId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  habs.push(fromHab, toHab);
  return habs;
};

export const tokensWithdrawn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = getTokensWithdrawnEvent(ctx, item);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: block.height,
    dBalance: -amount,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  return hab;
};
