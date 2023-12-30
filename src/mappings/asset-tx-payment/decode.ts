import * as ss58 from '@subsquid/ss58';
import { AssetMetadata as AssetMetadata_v48 } from '../../types/v48';
import { AssetMetadata as AssetMetadata_v49, Asset_ForeignAsset } from '../../types/v49';
import { events, storage } from '../../types';
import { Block, Event } from '../../processor';

export const decodeAssetTxFeePaidEvent = (event: Event): AssetTxFeePaidEvent => {
  let decoded: { who: string; actualFee: bigint; assetId?: any };
  if (events.assetTxPayment.assetTxFeePaid.v47.is(event)) {
    decoded = events.assetTxPayment.assetTxFeePaid.v47.decode(event);
    decoded.assetId = decoded.assetId.value;
  } else if (events.assetTxPayment.assetTxFeePaid.v48.is(event)) {
    decoded = events.assetTxPayment.assetTxFeePaid.v48.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    actualFee: BigInt(decoded.actualFee),
    assetIdValue: Number(decoded.assetId),
  };
};

export const decodeMetadataStorage = async (
  block: Block,
  assetId: Asset_ForeignAsset
): Promise<AssetMetadata_v48 | AssetMetadata_v49 | undefined> => {
  let assetMetadata: AssetMetadata_v48 | AssetMetadata_v49 | undefined;
  if (storage.assetRegistry.metadata.v42.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v42.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v48.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v48.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v49.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v49.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v51.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v51.get(block, assetId);
  }
  return assetMetadata;
};

interface AssetTxFeePaidEvent {
  accountId: string;
  actualFee: bigint;
  assetIdValue: number;
}
