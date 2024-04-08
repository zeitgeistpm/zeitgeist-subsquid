import { HistoricalAccountBalance } from '../../model';
import { Asset_ForeignAsset } from '../../types/v54';
import { TREASURY_ACCOUNT, _Asset } from '../../consts';
import { extrinsicFromEvent, formatAssetId, isBatteryStation } from '../../helper';
import { Event } from '../../processor';
import { decodeMetadataStorage } from '../asset-registry/decode';
import { decodeAssetTxFeePaidEvent } from './decode';

export const assetTxFeePaid = async (event: Event): Promise<HistoricalAccountBalance[] | undefined> => {
  const { accountId, actualFee, assetIdValue } = decodeAssetTxFeePaidEvent(event);
  const assetId: Asset_ForeignAsset = { __kind: _Asset.ForeignAsset, value: assetIdValue };
  const habs: HistoricalAccountBalance[] = [];

  const onChainAsset = await decodeMetadataStorage(event.block, assetId);
  if (!onChainAsset || !onChainAsset.additional.xcm.feeFactor) return;
  const amount = (Number(actualFee) * Number(onChainAsset.additional.xcm.feeFactor)) / 10 ** 10;

  const userHab = new HistoricalAccountBalance({
    accountId,
    assetId: formatAssetId(assetId),
    blockNumber: event.block.height,
    dBalance: -BigInt(Math.round(amount)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  habs.push(userHab);

  // Skip condition. Ref: https://github.com/zeitgeistpm/zeitgeist/issues/1091
  if (isBatteryStation() && event.block.specVersion < 49) {
    if (assetIdValue == 0 || assetIdValue == 2) return habs;
  }

  // Record TokensBalanceSetEvent for txn fee deposits in treasury account
  const treasuryHab = new HistoricalAccountBalance({
    accountId: TREASURY_ACCOUNT,
    assetId: formatAssetId(assetId),
    blockNumber: event.block.height,
    dBalance: BigInt(Math.round(amount)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + TREASURY_ACCOUNT.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  habs.push(treasuryHab);

  return habs;
};
