import { SubstrateBlock } from '@subsquid/substrate-processor';
import { AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent } from '../helper';
import { getAccountCrossedEvent } from './types';

export const accountCrossed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getAccountCrossedEvent(ctx, item);

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    const hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.slice(-5);
    hab.accountId = walletId;
    hab.event = item.event.name.split('.')[1];
    hab.extrinsic = extrinsicFromEvent(item.event);
    hab.assetId = ab.assetId;
    hab.dBalance = -amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};
