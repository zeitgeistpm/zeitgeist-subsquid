import { HistoricalAccountBalance } from '../../model';
import { Asset, extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import { decodeRewardedEvent } from './decode';

export const parachainStakingRewarded = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeRewardedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: Asset.Ztg,
    blockNumber: block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  return hab;
};
