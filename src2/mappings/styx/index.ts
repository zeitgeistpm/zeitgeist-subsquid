import { Store } from '@subsquid/typeorm-store';
import { AccountBalance, HistoricalAccountBalance } from '../../model';
import { _Asset, extrinsicFromEvent } from '../../helper';
import { Block, Event } from '../../processor';
import { decodeAccountCrossedEvent } from './decode';

export const accountCrossed = async (store: Store, block: Block, event: Event) => {
  const { accountId, amount } = decodeAccountCrossedEvent(event);

  const ab = await store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId: _Asset.Ztg,
  });
  if (!ab) return;
  ab.balance = ab.balance - amount;
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};
