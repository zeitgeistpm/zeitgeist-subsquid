import { Store } from '@subsquid/typeorm-store';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { ProcessorContext, Event } from '../../processor';
import { ZTG_ASSET, extrinsicFromEvent, initBalance } from '../../helper';
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

export const balancesBalanceSet = async (ctx: ProcessorContext<Store>, block: any, event: Event) => {
  const { accountId, amount } = decodeBalanceSetEvent(event);

  let account = await ctx.store.get(Account, { where: { accountId } });
  if (!account) {
    account = new Account({
      accountId,
      id: accountId,
    });
    console.log(`[${event.name}] Saving account: ${JSON.stringify(account, null, 2)}`);
    await ctx.store.save<Account>(account);
    await initBalance(account, ctx.store);
  }

  const ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId: ZTG_ASSET,
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  ab.balance = amount;
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: ab.balance - oldBalance,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const balancesDeposit = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeDepositEvent(event);

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

export const balancesDustLost = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeDustLostEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  return hab;
};

export const balancesReserveRepatriated = async (
  block: any,
  event: Event
): Promise<HistoricalAccountBalance | undefined> => {
  const { fromAccountId, toAccountId, amount, destinationStatus } = decodeReserveRepatriatedEvent(event);
  if (destinationStatus.__kind !== 'Free') return;

  const hab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + toAccountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  return hab;
};

export const balancesReserved = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeReservedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  return hab;
};

export const balancesTransfer = async (block: any, event: Event): Promise<HistoricalAccountBalance[]> => {
  const { fromAccountId, toAccountId, amount } = decodeTransferEvent(event);
  const habs: HistoricalAccountBalance[] = [];

  const fromHab = new HistoricalAccountBalance({
    accountId: fromAccountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + fromAccountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  const toHab = new HistoricalAccountBalance({
    accountId: toAccountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + toAccountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });

  habs.push(fromHab, toHab);
  return habs;
};

export const balancesUnreserved = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeUnreservedEvent(event);

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

export const balancesWithdraw = async (block: any, event: Event): Promise<HistoricalAccountBalance> => {
  const { accountId, amount } = decodeWithdrawEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ZTG_ASSET,
    blockNumber: block.height,
    dBalance: -amount,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  return hab;
};
