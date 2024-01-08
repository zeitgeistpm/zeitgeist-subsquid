import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { Event } from '../../processor';

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

interface AssetTxFeePaidEvent {
  accountId: string;
  actualFee: bigint;
  assetIdValue: number;
}
