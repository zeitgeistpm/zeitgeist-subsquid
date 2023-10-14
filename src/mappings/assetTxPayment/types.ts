import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import { AssetTxPaymentAssetTxFeePaidEvent } from '../../types/events';
import { AssetRegistryMetadataStorage } from '../../types/storage';
import { AssetMetadata as AssetMetadata_v48 } from '../../types/v48';
import { AssetMetadata as AssetMetadata_v49, Asset_ForeignAsset } from '../../types/v49';

export const getAssetTxFeePaidEvent = (ctx: Ctx, item: EventItem): AssetTxFeePaidEvent => {
  // @ts-ignore
  const event = new AssetTxPaymentAssetTxFeePaidEvent(ctx, item.event);
  if (event.isV47) {
    let { who, actualFee, assetId } = event.asV47;
    const walletId = ss58.codec('zeitgeist').encode(who);
    assetId = (assetId as any).value;
    return { walletId, actualFee, assetId };
  } else if (event.isV48) {
    const { who, actualFee, assetId } = event.asV48;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, actualFee, assetId };
  } else {
    const { who, actualFee, assetId } = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, actualFee, assetId };
  }
};

export const getMetadataStorage = async (
  ctx: Ctx,
  block: SubstrateBlock,
  assetId: Asset_ForeignAsset
): Promise<AssetMetadata_v48 | AssetMetadata_v49 | undefined> => {
  const storage = new AssetRegistryMetadataStorage(ctx, block);
  if (storage.isV42) {
    const assetMetadata = await storage.asV42.get(assetId);
    return assetMetadata;
  } else if (storage.isV48) {
    const assetMetadata = await storage.asV48.get(assetId);
    return assetMetadata;
  } else {
    const assetMetadata = await storage.asV49.get(assetId);
    return assetMetadata;
  }
};

interface AssetTxFeePaidEvent {
  walletId: string;
  actualFee: bigint;
  assetId: any;
}
