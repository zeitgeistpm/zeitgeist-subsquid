import { HistoricalAccountBalance } from '../../model';
import { _Asset } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import { decodeDepositedEvent, decodeTransferredEvent, decodeWithdrawnEvent } from './decode';

export const deposited = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = decodeDepositedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const transferred = async (event: Event): Promise<HistoricalAccountBalance[] | undefined> => {
  const { assetId, fromAccountId, toAccountId, amount } = decodeTransferredEvent(event);
  if (assetId === _Asset.Ztg) return;
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: fromAccountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + fromAccountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + toAccountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  habs.push(fromHab, toHab);
  return habs;
};

export const withdrawn = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = decodeWithdrawnEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};
