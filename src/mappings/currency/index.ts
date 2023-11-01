import { SubstrateBlock } from '@subsquid/substrate-processor';
import { HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent } from '../helper';
import { getDepositedEvent, getTransferredEvent, getWithdrawnEvent } from './types';

export const currencyDeposited = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, walletId, amount } = getDepositedEvent(ctx, item);

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

export const currencyTransferred = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { assetId, fromId, toId, amount } = getTransferredEvent(ctx, item);
  if (assetId === 'Ztg') return;
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

export const currencyWithdrawn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, walletId, amount } = getWithdrawnEvent(ctx, item);

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
