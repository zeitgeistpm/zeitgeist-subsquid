import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const orderPlaced = (event: Event): OrderPlacedEvent => {
  let decoded: { orderId: bigint; order: any };
  if (events.orderbook.orderPlaced.v50.is(event)) {
    decoded = events.orderbook.orderPlaced.v50.decode(event);
  } else if (events.orderbook.orderPlaced.v51.is(event)) {
    decoded = events.orderbook.orderPlaced.v51.decode(event);
  } else if (events.orderbook.orderPlaced.v53.is(event)) {
    decoded = events.orderbook.orderPlaced.v53.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    orderId: decoded.orderId.toString(),
    marketId: Number(decoded.order.marketId),
    maker: ss58.encode({ prefix: 73, bytes: decoded.order.maker }),
    makerAsset: formatAssetId(decoded.order.makerAsset ?? decoded.order.baseAsset),
    makerAmount: BigInt(decoded.order.makerAmount ?? decoded.order.baseAssetAmount),
    takerAsset: formatAssetId(decoded.order.takerAsset ?? decoded.order.outcomeAsset),
    takerAmount: BigInt(decoded.order.takerAmount ?? decoded.order.baseAssetAmount),
  };
};

interface OrderPlacedEvent {
  orderId: string;
  marketId: number;
  maker: string;
  makerAsset: string;
  makerAmount: bigint;
  takerAsset: string;
  takerAmount: bigint;
}
