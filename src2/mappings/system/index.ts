import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { getFees, initBalance } from '../helper';
import {
  getExtrinsicFailedEvent,
  getExtrinsicSuccessEvent,
  getNewAccountEvent,
} from './types';

export const systemExtrinsicFailed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: any
) => {
  if (
    !item.event.extrinsic ||
    !item.event.extrinsic.signature ||
    !item.event.extrinsic.signature.address
  )
    return;

  const { dispatchInfo } = getExtrinsicFailedEvent(ctx, item);
  if (dispatchInfo.paysFee.__kind == 'No') return;

  const walletId = encodeAddress(
    item.event.extrinsic.signature.address['value'],
    73
  );
  let acc = await ctx.store.get(Account, {
    where: { accountId: walletId },
  });
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

  const txnFees = await getFees(block, item.event.extrinsic);
  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - txnFees;
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
    hab.dBalance = -txnFees;
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

export const systemExtrinsicSuccess = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: any
) => {
  if (
    !item.event.extrinsic ||
    !item.event.extrinsic.signature ||
    !item.event.extrinsic.signature.address
  )
    return;

  const { dispatchInfo } = getExtrinsicSuccessEvent(ctx, item);
  if (dispatchInfo.paysFee.__kind == 'No') return;

  const walletId = encodeAddress(
    item.event.extrinsic.signature.address['value'],
    73
  );
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

  const txnFees = await getFees(block, item.event.extrinsic);
  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: 'Ztg',
  });
  if (ab) {
    ab.balance = ab.balance - txnFees;
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
    hab.dBalance = -txnFees;
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

export const systemNewAccount = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
) => {
  const { walletId } = getNewAccountEvent(ctx, item);

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (acc) return;

  let newAcc = new Account();
  newAcc.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  newAcc.accountId = walletId;
  console.log(
    `[${item.event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`
  );
  await ctx.store.save<Account>(newAcc);

  let ab = new AccountBalance();
  ab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  ab.account = newAcc;
  ab.assetId = 'Ztg';
  ab.balance = BigInt(0);
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
  hab.accountId = newAcc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = BigInt(0);
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
};
