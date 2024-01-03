import { HistoricalAccountBalance } from '../../model';
import { _Asset } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import { decodeRewardedEvent } from './decode';

export const rewarded = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeRewardedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};
