import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Ctx, EventItem } from '../../processor';
import { Account, HistoricalAccountBalance } from '../../model';
import { extrinsicFromEvent, initBalance } from '../helper';
import { getAssetTxFeePaidEvent, getMetadataStorage } from './types';

export const assetTxPaymentAssetTxFeePaidEvent = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance | undefined> => {
  const { walletId, actualFee, assetId } = getAssetTxFeePaidEvent(ctx, item);

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  const onChainAsset = await getMetadataStorage(ctx, block, assetId);
  if (!onChainAsset || !onChainAsset.additional.xcm.feeFactor) return;
  const amount = (actualFee * onChainAsset.additional.xcm.feeFactor) / BigInt(10 ** 10);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = JSON.stringify({ foreignAsset: assetId });
  hab.dBalance = -amount;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
