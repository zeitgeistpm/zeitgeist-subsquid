import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { initBalance } from '../helper';
import { getRewardedEvent } from './types';

export const parachainStakingRewarded = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { walletId, rewards } = getRewardedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = 'Ztg';
  hab.dBalance = rewards;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
