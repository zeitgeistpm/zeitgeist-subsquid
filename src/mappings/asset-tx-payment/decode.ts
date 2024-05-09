import * as ss58 from '@subsquid/ss58';
import { Asset } from '../../types/v54';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { Event } from '../../processor';

export const decodeAssetTxFeePaidEvent = (event: Event): AssetTxFeePaidEvent => {
  let decoded: { who: string; actualFee: bigint; assetId?: any };
  if (events.assetTxPayment.assetTxFeePaid.v47.is(event)) {
    decoded = events.assetTxPayment.assetTxFeePaid.v47.decode(event);
  } else if (events.assetTxPayment.assetTxFeePaid.v48.is(event)) {
    decoded = events.assetTxPayment.assetTxFeePaid.v48.decode(event);
    decoded.assetId = { __kind: _Asset.ForeignAsset, value: decoded.assetId };
  } else if (events.assetTxPayment.assetTxFeePaid.v54.is(event)) {
    decoded = events.assetTxPayment.assetTxFeePaid.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    assetId: decoded.assetId,
    actualFee: BigInt(decoded.actualFee),
  };
};

interface AssetTxFeePaidEvent {
  accountId: string;
  assetId?: Asset;
  actualFee: bigint;
}
