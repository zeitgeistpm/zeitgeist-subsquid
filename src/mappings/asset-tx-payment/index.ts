import { HistoricalAccountBalance } from '../../model';
import { Asset_ForeignAsset } from '../../types/v54';
import { TREASURY_ACCOUNT, _Asset } from '../../consts';
import { extrinsicFromEvent, formatAssetId, isBatteryStation } from '../../helper';
import { Event } from '../../processor';
import { decodeMetadataStorage } from '../asset-registry/decode';
import { decodeAssetTxFeePaidEvent } from './decode';

export const assetTxFeePaid = async (event: Event): Promise<HistoricalAccountBalance[] | undefined> => {
  const { accountId, assetId, actualFee } = decodeAssetTxFeePaidEvent(event);
  if (!assetId) return;

  let amount = Number(actualFee);
  if (assetId.__kind === _Asset.ForeignAsset) {
    const onChainAsset = await decodeMetadataStorage(event.block, assetId);
    if (!onChainAsset || !onChainAsset.additional.xcm.feeFactor) return;
    amount = Math.round((Number(actualFee) * Number(onChainAsset.additional.xcm.feeFactor)) / 10 ** 10);
  }

  const userHab = new HistoricalAccountBalance({
    accountId,
    assetId: formatAssetId(assetId),
    blockNumber: event.block.height,
    dBalance: -BigInt(amount),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  // Skip condition. Ref: https://github.com/zeitgeistpm/zeitgeist/issues/1091
  if (isBatteryStation() && event.block.specVersion < 49) {
    if ((assetId as Asset_ForeignAsset).value === 0 || (assetId as Asset_ForeignAsset).value === 2) return [userHab];
  }

  // Record TokensBalanceSetEvent for txn fee deposits in treasury account
  const treasuryHab = new HistoricalAccountBalance({
    accountId: TREASURY_ACCOUNT,
    assetId: formatAssetId(assetId),
    blockNumber: event.block.height,
    dBalance: BigInt(amount),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + TREASURY_ACCOUNT.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });

  return [userHab, treasuryHab];
};
