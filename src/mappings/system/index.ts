import { Store } from '@subsquid/typeorm-store';
import * as ss58 from '@subsquid/ss58';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Pallet, _Asset } from '../../consts';
import { extrinsicFromEvent, getFees } from '../../helper';
import { Event } from '../../processor';
import { decodeExtrinsicFailedEvent, decodeExtrinsicSuccessEvent, decodeNewAccountEvent } from './decode';

export const extrinsicFailed = async (event: Event): Promise<HistoricalAccountBalance | undefined> => {
  if (!event.extrinsic || !event.extrinsic.signature || !event.extrinsic.signature.address) return;
  const accountId = ss58.encode({ prefix: 73, bytes: (event.extrinsic.signature.address as any).value });

  const { dispatchInfo } = decodeExtrinsicFailedEvent(event);
  if (dispatchInfo.paysFee.__kind == 'No') return;

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -(await getFees(event.block, event.extrinsic)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const extrinsicSuccess = async (event: Event): Promise<HistoricalAccountBalance | undefined> => {
  if (
    !event.extrinsic ||
    !event.extrinsic.signature ||
    !event.extrinsic.signature.address ||
    (event.extrinsic.call && event.extrinsic.call.name.split('.')[0] === (Pallet.Sudo || Pallet.ParachainSystem))
  )
    return;
  const accountId = ss58.encode({ prefix: 73, bytes: (event.extrinsic.signature.address as any).value });

  const { dispatchInfo } = decodeExtrinsicSuccessEvent(event);
  if (dispatchInfo.paysFee.__kind === 'No') return;

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -(await getFees(event.block, event.extrinsic)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const newAccount = async (store: Store, event: Event) => {
  const { accountId } = decodeNewAccountEvent(event);

  const account = await store.get(Account, { where: { accountId } });
  if (account) return;

  const newAccount = new Account({
    accountId,
    id: accountId,
  });
  console.log(`[${event.name}] Saving account: ${JSON.stringify(newAccount, null, 2)}`);
  await store.save<Account>(newAccount);

  const ab = new AccountBalance({
    account: newAccount,
    assetId: _Asset.Ztg,
    balance: BigInt(0),
    id: event.id + '-' + accountId.slice(-5),
  });
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: BigInt(0),
    event: event.name.split('.')[1],
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};
