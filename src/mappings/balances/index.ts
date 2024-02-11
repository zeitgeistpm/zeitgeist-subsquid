import { Store } from '@subsquid/typeorm-store';
import { AccountBalance, HistoricalAccountBalance } from '../../model';
import { _Asset } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import {
  decodeBalanceSetEvent,
  decodeDepositEvent,
  decodeDustLostEvent,
  decodeReserveRepatriatedEvent,
  decodeReservedEvent,
  decodeTransferEvent,
  decodeUnreservedEvent,
  decodeWithdrawEvent,
} from './decode';

export const balanceSet = async (store: Store, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeBalanceSetEvent(event);

  const ab = await store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId: _Asset.Ztg,
  });
  const oldBalance = ab ? ab.balance : BigInt(0);
  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: amount - oldBalance,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const deposit = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeDepositEvent(event);

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

export const dustLost = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeDustLostEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const reserveRepatriated = async (event: Event): Promise<HistoricalAccountBalance | undefined> => {
  const { fromAccountId, toAccountId, amount, destinationStatus } = decodeReserveRepatriatedEvent(event);
  if (destinationStatus.__kind !== 'Free') return;

  const hab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + toAccountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const reserved = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeReservedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
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
  const { fromAccountId, toAccountId, amount } = decodeTransferEvent(event);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: fromAccountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + fromAccountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId: _Asset.Ztg,
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

export const unreserved = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeUnreservedEvent(event);

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

export const withdraw = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeWithdrawEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};
