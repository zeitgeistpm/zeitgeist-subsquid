import { SubstrateBlock } from '@subsquid/substrate-processor';
import { HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { getRewardedEvent } from './types';

export const parachainStakingRewarded = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, rewards } = getRewardedEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = 'Ztg';
  hab.dBalance = rewards;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
