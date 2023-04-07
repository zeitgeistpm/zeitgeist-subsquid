import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { initBalance } from '../helper';
import {
  getBalanceSetEvent,
  getDepositEvent,
  getDustLostEvent,
  getEndowedEvent,
  getReservedEvent,
  getSlashedEvent,
  getTransferEvent,
  getUnreservedEvent,
  getWithdrawEvent,
} from './types';

export const balancesBalanceSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, free } = getBalanceSetEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    let eHab = await ctx.store.get(HistoricalAccountBalance, {
      where: {
        accountId: acc.accountId,
        assetId: 'Ztg',
        event: 'Endowed',
        blockNumber: block.height,
      },
    });
    if (!eHab) {
      ab.balance = free;
      console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
      await ctx.store.save<AccountBalance>(ab);

      let hab = new HistoricalAccountBalance();
      hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
      hab.accountId = acc.accountId;
      hab.event = item.event.name.split('.')[1];
      hab.assetId = ab.assetId;
      hab.dBalance = free;
      hab.blockNumber = block.height;
      hab.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(hab);
    } else {
      eHab.event = eHab.event.concat(item.event.name.split('.')[1]);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(eHab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(eHab);
      return;
    }
  }
};

export const balancesDeposit = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getDepositEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance + amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const balancesDustLost = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getDustLostEvent(ctx, item);

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (!ab) return;

  ab.balance = ab.balance - amount;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const balancesEndowed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, freeBalance } = getEndowedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab && ab.balance === BigInt(0)) {
    ab.balance = ab.balance + freeBalance;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = freeBalance;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const balancesReserved = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getReservedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = -amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const balancesSlashed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getSlashedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = -amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const balancesTransfer = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { fromId, toId, amount } = getTransferEvent(ctx, item);

  let fromAcc = await ctx.store.get(Account, { where: { accountId: fromId } });
  if (!fromAcc) {
    fromAcc = new Account();
    fromAcc.id = item.event.id + '-' + fromId.substring(fromId.length - 5);
    fromAcc.accountId = fromId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(fromAcc, null, 2)}`);
    await ctx.store.save<Account>(fromAcc);
    await initBalance(fromAcc, ctx.store, block, item);
  }

  let fromAb = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: fromId },
    assetId: 'Ztg',
  });
  if (fromAb) {
    fromAb.balance = fromAb.balance - amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(fromAb, null, 2)}`);
    await ctx.store.save<AccountBalance>(fromAb);

    let fromHab = new HistoricalAccountBalance();
    fromHab.id = item.event.id + '-' + fromId.substring(fromId.length - 5);
    fromHab.accountId = fromAcc.accountId;
    fromHab.event = item.event.name.split('.')[1];
    fromHab.assetId = fromAb.assetId;
    fromHab.dBalance = -amount;
    fromHab.blockNumber = block.height;
    fromHab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(fromHab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(fromHab);
  }

  let toAcc = await ctx.store.get(Account, { where: { accountId: toId } });
  if (!toAcc) {
    toAcc = new Account();
    toAcc.id = item.event.id + '-' + toId.substring(toId.length - 5);
    toAcc.accountId = toId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(toAcc, null, 2)}`);
    await ctx.store.save<Account>(toAcc);
    await initBalance(fromAcc, ctx.store, block, item);
  }

  let toAb = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: toId },
    assetId: 'Ztg',
  });
  if (toAb) {
    let hab = await ctx.store.get(HistoricalAccountBalance, {
      where: {
        accountId: toAcc.accountId,
        assetId: 'Ztg',
        event: 'Endowed',
        blockNumber: block.height,
      },
    });
    if (!hab) {
      toAb.balance = toAb.balance + amount;
      console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(toAb, null, 2)}`);
      await ctx.store.save<AccountBalance>(toAb);

      let toHab = new HistoricalAccountBalance();
      toHab.id = item.event.id + '-' + toId.substring(toId.length - 5);
      toHab.accountId = toAcc.accountId;
      toHab.event = item.event.name.split('.')[1];
      toHab.assetId = toAb.assetId;
      toHab.dBalance = amount;
      toHab.blockNumber = block.height;
      toHab.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(toHab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(toHab);
    } else {
      hab.event = hab.event.concat(item.event.name.split('.')[1]);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(hab);
      return;
    }
  }
};

export const balancesUnreserved = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getUnreservedEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance + amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const balancesWithdraw = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId, amount } = getWithdrawEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - amount;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = -amount;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};
