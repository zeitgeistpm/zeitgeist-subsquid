import { HistoricalAccountBalance } from '../../model';
import { Asset_ForeignAsset } from '../../types/v49';
import { TREASURY_ACCOUNT, _Asset, extrinsicFromEvent, formatAssetId } from '../../helper';
import { Block, Event } from '../../processor';
import { decodeAssetTxFeePaidEvent, decodeMetadataStorage } from './decode';

export const assetTxFeePaid = async (block: Block, event: Event): Promise<HistoricalAccountBalance[] | undefined> => {
  const { accountId, actualFee, assetIdValue } = decodeAssetTxFeePaidEvent(event);
  const assetId: Asset_ForeignAsset = { __kind: _Asset.ForeignAsset, value: assetIdValue };
  const habs: HistoricalAccountBalance[] = [];

  const onChainAsset = await decodeMetadataStorage(block, assetId);
  if (!onChainAsset || !onChainAsset.additional.xcm.feeFactor) return;
  const amount = (Number(actualFee) * Number(onChainAsset.additional.xcm.feeFactor)) / 10 ** 10;

  const userHab = new HistoricalAccountBalance({
    accountId,
    assetId: formatAssetId(assetId),
    blockNumber: block.height,
    dBalance: -BigInt(Math.round(amount)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp!),
  });
  habs.push(userHab);

  // Skip condition. Ref: https://github.com/zeitgeistpm/zeitgeist/issues/1091
  if (process.env.WS_NODE_URL?.includes(`bs`) && block.specVersion < 49)
    if (assetIdValue == 0 || assetIdValue == 2) return habs;

  // Record TokensBalanceSetEvent for txn fee deposits in treasury account
  const treasuryHab = new HistoricalAccountBalance({
    accountId: TREASURY_ACCOUNT,
    assetId: formatAssetId(assetId),
    blockNumber: block.height,
    dBalance: BigInt(Math.round(amount)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + TREASURY_ACCOUNT.slice(-5),
    timestamp: new Date(block.timestamp!),
  });
  habs.push(treasuryHab);

  return habs;
};
