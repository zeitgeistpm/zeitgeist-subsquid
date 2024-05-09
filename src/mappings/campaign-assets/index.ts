import { HistoricalAccountBalance } from '../../model';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import * as decode from './decode';

export const issued = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, owner, amount } = decode.issued(event);

  const hab = new HistoricalAccountBalance({
    accountId: owner,
    assetId,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + owner.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const transferred = async (event: Event): Promise<HistoricalAccountBalance[] | undefined> => {
  const { assetId, from, to, amount } = decode.transferred(event);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: from,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + from.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: to,
    assetId,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + to.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  habs.push(fromHab, toHab);
  return habs;
};
