import { HistoricalAccountBalance } from '../../model';
import { ZTG_ASSET, extrinsicFromEvent } from '../helper';
import { decodeTransferEvent } from './decode';

export const balancesTransfer = async (block: any, event: any): Promise<HistoricalAccountBalance[]> => {
  const { fromAccountId, toAccountId, amount } = decodeTransferEvent(event);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: fromAccountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + fromAccountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + toAccountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  habs.push(fromHab, toHab);
  return habs;
};
