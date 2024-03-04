import * as ss58 from '@subsquid/ss58';
import { Order as Order_v51 } from '../../types/v51';
import { Order as Order_v53 } from '../../types/v53';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const orderPlaced = (event: Event): OrderPlacedEvent => {
  let decoded: { orderId: bigint; order: Order_v51 | Order_v53 };
  if (events.orderbook.orderPlaced.v50.is(event)) {
    decoded = events.orderbook.orderPlaced.v50.decode(event);
  } else if (events.orderbook.orderPlaced.v51.is(event)) {
    decoded = events.orderbook.orderPlaced.v51.decode(event);
  } else if (events.orderbook.orderPlaced.v53.is(event)) {
    decoded = events.orderbook.orderPlaced.v53.decode(event);
  } else {
    decoded = event.args;
  }

  if ('side' in decoded.order) {
    let makerAsset, makerAmount, takerAsset, takerAmount;
    if (decoded.order.side.__kind === 'Ask') {
      makerAsset = decoded.order.outcomeAsset;
      makerAmount = decoded.order.outcomeAssetAmount;
      takerAsset = decoded.order.baseAsset;
      takerAmount = decoded.order.baseAssetAmount;
    } else {
      makerAsset = decoded.order.baseAsset;
      makerAmount = decoded.order.baseAssetAmount;
      takerAsset = decoded.order.outcomeAsset;
      takerAmount = decoded.order.outcomeAssetAmount;
    }
    return {
      orderId: decoded.orderId.toString(),
      marketId: Number(decoded.order.marketId),
      maker: ss58.encode({ prefix: 73, bytes: decoded.order.maker }),
      makerAsset: formatAssetId(makerAsset),
      makerAmount: BigInt(makerAmount),
      takerAsset: formatAssetId(takerAsset),
      takerAmount: BigInt(takerAmount),
    };
  }

  return {
    orderId: decoded.orderId.toString(),
    marketId: Number(decoded.order.marketId),
    maker: ss58.encode({ prefix: 73, bytes: decoded.order.maker }),
    makerAsset: formatAssetId(decoded.order.makerAsset),
    makerAmount: BigInt(decoded.order.makerAmount),
    takerAsset: formatAssetId(decoded.order.takerAsset),
    takerAmount: BigInt(decoded.order.takerAmount),
  };
};

export const orderRemoved = (event: Event): OrderRemovedEvent => {
  let decoded: { orderId: bigint };
  if (events.orderbook.orderRemoved.v50.is(event)) {
    decoded = events.orderbook.orderRemoved.v50.decode(event);
  } else {
    decoded = event.args;
  }
  return decoded;
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

interface OrderRemovedEvent {
  orderId: bigint;
}