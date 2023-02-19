import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { initBalance } from '../helper';
import { getAccountCrossedEvent } from './types';

export const accountCrossed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
) => {
  const { walletId, amount } = getAccountCrossedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(
      `[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`
    );
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - amount;
    console.log(
      `[${item.event.name}] Saving account balance: ${JSON.stringify(
        ab,
        null,
        2
      )}`
    );
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = -amount;
    hab.balance = ab.balance;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(
      `[${item.event.name}] Saving historical account balance: ${JSON.stringify(
        hab,
        null,
        2
      )}`
    );
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};
