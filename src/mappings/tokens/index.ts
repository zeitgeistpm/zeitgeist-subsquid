import { Store } from '@subsquid/typeorm-store';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import {
  decodeTokensBalanceSetEvent,
  decodeTokensDepositedEvent,
  decodeTokensReservedEvent,
  decodeTokensTransferEvent,
  decodeTokensWithdrawnEvent,
} from './decode';

export const balanceSet = async (store: Store, event: Event) => {
  const { assetId, accountId, amount } = decodeTokensBalanceSetEvent(event);
  if (!assetId.includes('pool')) return;

  const acc = await store.get(Account, { where: { accountId } });
  if (!acc) return;

  let ab = await store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId,
  });
  if (!ab) {
    ab = new AccountBalance({
      account: acc,
      assetId,
      id: accountId + '-' + assetId,
      balance: BigInt(0),
    });
  }
  const oldBalance = ab.balance;
  ab.balance = amount;
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: ab.balance - oldBalance,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const deposited = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = decodeTokensDepositedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const reserved = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = decodeTokensReservedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const transfer = async (event: Event): Promise<HistoricalAccountBalance[]> => {
  const { assetId, fromAccountId, toAccountId, amount } = decodeTokensTransferEvent(event);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: fromAccountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + fromAccountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + toAccountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  habs.push(fromHab, toHab);
  return habs;
};

export const withdrawn = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, accountId, amount } = decodeTokensWithdrawnEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};
