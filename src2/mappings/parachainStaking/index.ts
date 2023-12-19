import { HistoricalAccountBalance } from '../../model';
import { Event } from '../../processor';
import { ZTG_ASSET, extrinsicFromEvent } from '../../helper';
import { decodeRewardedEvent } from './decode';

export const parachainStakingRewarded = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeRewardedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  return hab;
};
