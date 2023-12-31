import { AssetMetadata as AssetMetadata_v48 } from '../../types/v48';
import { AssetMetadata as AssetMetadata_v49, Asset_ForeignAsset } from '../../types/v49';
import { storage } from '../../types';
import { Block } from '../../processor';

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
