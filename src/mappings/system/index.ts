import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent, getFees, initBalance } from '../helper';
import { getExtrinsicFailedEvent, getExtrinsicSuccessEvent, getNewAccountEvent } from './types';

export const systemExtrinsicFailed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance | undefined> => {
  if (
    // @ts-ignore
    !item.event.extrinsic ||
    // @ts-ignore
    !item.event.extrinsic.signature ||
    // @ts-ignore
    !item.event.extrinsic.signature.address
  )
    return;

  const { dispatchInfo } = getExtrinsicFailedEvent(ctx, item);
  if (dispatchInfo.paysFee.__kind == 'No') return;

  const walletId = encodeAddress(
    // @ts-ignore
    item.event.extrinsic.signature.address['value'],
    73
  );
  let acc = await ctx.store.get(Account, {
    where: { accountId: walletId },
  });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }
  // @ts-ignore
  const txnFees = await getFees(block, item.event.extrinsic);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = -txnFees;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const systemExtrinsicSuccess = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance | undefined> => {
  if (
    // @ts-ignore
    !item.event.extrinsic ||
    // @ts-ignore
    !item.event.extrinsic.signature ||
    // @ts-ignore
    !item.event.extrinsic.signature.address ||
    // @ts-ignore
    item.event.extrinsic.call.name.split('.')[0] == 'Sudo' ||
    // @ts-ignore
    item.event.extrinsic.call.name.split('.')[0] == 'ParachainSystem'
  )
    return;

  const { dispatchInfo } = getExtrinsicSuccessEvent(ctx, item);
  if (dispatchInfo.paysFee.__kind == 'No') return;

  const walletId = encodeAddress(
    // @ts-ignore
    item.event.extrinsic.signature.address['value'],
    73
  );
  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }
  // @ts-ignore
  const txnFees = await getFees(block, item.event.extrinsic);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = 'Ztg';
  hab.dBalance = -txnFees;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};

export const systemNewAccount = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { walletId } = getNewAccountEvent(ctx, item);

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (acc) return;

  let newAcc = new Account();
  newAcc.id = walletId;
  newAcc.accountId = walletId;
  console.log(`[${item.event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`);
  await ctx.store.save<Account>(newAcc);

  let ab = new AccountBalance();
  ab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  ab.account = newAcc;
  ab.assetId = 'Ztg';
  ab.balance = BigInt(0);
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = newAcc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = ab.assetId;
  hab.dBalance = BigInt(0);
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};
