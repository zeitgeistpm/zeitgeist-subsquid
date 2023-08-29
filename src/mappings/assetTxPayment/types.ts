import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import { AssetTxPaymentAssetTxFeePaidEvent } from '../../types/events';

export const getAssetTxFeePaidEvent = (ctx: Ctx, item: EventItem): AssetTxFeePaidEvent => {
  // @ts-ignore
  const event = new AssetTxPaymentAssetTxFeePaidEvent(ctx, item.event);
  if (event.isV47) {
    const { who, actualFee, assetId } = event.asV47;
    const walletId = ss58.codec('zeitgeist').encode(who);
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

interface AssetTxFeePaidEvent {
  walletId: string;
  actualFee: bigint;
  assetId: any;
}
