import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Ctx, EventItem } from '../../processor';
import { HistoricalAccountBalance } from '../../model';
import { Asset_ForeignAsset } from '../../types/v49';
import { TREASURY_ACCOUNT, extrinsicFromEvent, getAssetId } from '../helper';
import { getAssetTxFeePaidEvent, getMetadataStorage } from './types';

export const assetTxPaymentAssetTxFeePaidEvent = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { walletId, actualFee, assetId } = getAssetTxFeePaidEvent(ctx, item);
  const currencyId: Asset_ForeignAsset = { __kind: 'ForeignAsset', value: assetId };
  const habs: HistoricalAccountBalance[] = [];

  const onChainAsset = await getMetadataStorage(ctx, block, currencyId);
  if (!onChainAsset || !onChainAsset.additional.xcm.feeFactor) return;
  const amount = (Number(actualFee) * Number(onChainAsset.additional.xcm.feeFactor)) / 10 ** 10;

  const userHab = new HistoricalAccountBalance({
    id: item.event.id + '-' + walletId.slice(-5),
    accountId: walletId,
    assetId: getAssetId(currencyId),
    blockNumber: block.height,
    dBalance: -BigInt(Math.round(amount)),
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    timestamp: new Date(block.timestamp),
  });

  const treasuryHab = new HistoricalAccountBalance({
    id: item.event.id + '-' + TREASURY_ACCOUNT.slice(-5),
    accountId: TREASURY_ACCOUNT,
    assetId: getAssetId(currencyId),
    blockNumber: block.height,
    dBalance: BigInt(Math.round(amount)),
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    timestamp: new Date(block.timestamp),
  });

  habs.push(userHab, treasuryHab);
  return habs;
};
