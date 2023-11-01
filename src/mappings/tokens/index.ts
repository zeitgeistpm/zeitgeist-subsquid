import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent } from '../helper';
import {
  getTokensBalanceSetEvent,
  getTokensDepositedEvent,
  getTokensTransferEvent,
  getTokensWithdrawnEvent,
} from './types';

export const tokensBalanceSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, walletId, amount } = getTokensBalanceSetEvent(ctx, item);

  if (!assetId.includes(`pool`)) return;

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } });
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

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
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

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = assetId;
  hab.dBalance = amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const tokensTransfer = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[]> => {
  const { assetId, fromId, toId, amount } = getTokensTransferEvent(ctx, item);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance();
  fromHab.id = item.event.id + '-' + fromId.slice(-5);
  fromHab.accountId = fromId;
  fromHab.event = item.event.name.split('.')[1];
  fromHab.extrinsic = extrinsicFromEvent(item.event);
  fromHab.assetId = assetId;
  fromHab.dBalance = -amount;
  fromHab.blockNumber = block.height;
  fromHab.timestamp = new Date(block.timestamp);

  const toHab = new HistoricalAccountBalance();
  toHab.id = item.event.id + '-' + toId.slice(-5);
  toHab.accountId = toId;
  toHab.event = item.event.name.split('.')[1];
  toHab.extrinsic = extrinsicFromEvent(item.event);
  toHab.assetId = assetId;
  toHab.dBalance = amount;
  toHab.blockNumber = block.height;
  toHab.timestamp = new Date(block.timestamp);

  habs.push(fromHab, toHab);
  return habs;
};

export const tokensWithdrawn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, walletId, amount } = getTokensWithdrawnEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = assetId;
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
