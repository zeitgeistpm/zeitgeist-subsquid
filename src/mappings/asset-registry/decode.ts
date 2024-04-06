import { AssetMetadata as AssetMetadata_v48 } from '../../types/v48';
import { AssetMetadata as AssetMetadata_v54, XcmAssetClass_ForeignAsset } from '../../types/v54';
import { storage } from '../../types';
import { Block } from '../../processor';

export const decodeMetadataStorage = async (
  block: Block,
  assetId: XcmAssetClass_ForeignAsset
): Promise<AssetMetadata_v48 | AssetMetadata_v54 | undefined> => {
  let assetMetadata: AssetMetadata_v48 | AssetMetadata_v54 | undefined;
  if (storage.assetRegistry.metadata.v42.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v42.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v48.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v48.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v49.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v49.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v51.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v51.get(block, assetId);
  } else if (storage.assetRegistry.metadata.v54.is(block)) {
    assetMetadata = await storage.assetRegistry.metadata.v54.get(block, assetId);
  }
  return assetMetadata;
};
