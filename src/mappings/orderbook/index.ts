import { Store } from '@subsquid/typeorm-store';
import { HistoricalOrder, HistoricalSwap, Order, OrderEvent, OrderRecord } from '../../model';
import { SwapEvent } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import * as decode from './decode';

export const orderFilled = async (
  store: Store,
  event: Event
): Promise<{ order: Order; historicalOrder: HistoricalOrder; historicalSwap: HistoricalSwap } | undefined> => {
  const { orderId, taker, filledMakerAmount, filledTakerAmount, unfilledMakerAmount, unfilledTakerAmount } =
    decode.orderFilled(event);

  const order = await store.get(Order, { where: { id: orderId.toString() } });
  if (!order) return;

  order.maker.filledAmount += filledMakerAmount;
  order.taker.filledAmount += filledTakerAmount;
  order.maker.unfilledAmount = unfilledMakerAmount;
  order.taker.unfilledAmount = unfilledTakerAmount;
  order.updatedAt = new Date(event.block.timestamp!);

  const historicalOrder = new HistoricalOrder({
    accountId: order.makerAccountId,
    assetAmountIn: filledTakerAmount,
    assetAmountOut: filledMakerAmount,
    assetIn: order?.taker.asset,
    assetOut: order?.maker.asset,
    blockNumber: event.block.height,
    event: OrderEvent.OrderFilled,
    externalFeeAmount: null,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    orderId: +order.id,
    timestamp: new Date(event.block.timestamp!),
  });

  const historicalSwap = new HistoricalSwap({
    accountId: taker,
    assetAmountIn: filledMakerAmount,
    assetAmountOut: filledTakerAmount,
    assetIn: order?.maker.asset,
    assetOut: order?.taker.asset,
    blockNumber: event.block.height,
    event: SwapEvent.OrderFilled,
    externalFeeAmount: null,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    swapFeeAmount: null,
    timestamp: new Date(event.block.timestamp!),
  });

  return { order, historicalOrder, historicalSwap };
};

export const orderPlaced = async (event: Event): Promise<Order> => {
  const { orderId, marketId, maker, makerAsset, makerAmount, takerAsset, takerAmount } = decode.orderPlaced(event);

  const order = new Order({
    createdAt: new Date(event.block.timestamp!),
    id: orderId,
    makerAccountId: maker,
    maker: new OrderRecord({
      asset: makerAsset,
      filledAmount: BigInt(0),
      unfilledAmount: makerAmount,
    }),
    marketId,
    taker: new OrderRecord({
      asset: takerAsset,
      filledAmount: BigInt(0),
      unfilledAmount: takerAmount,
    }),
    updatedAt: new Date(event.block.timestamp!),
  });
  return order;
};

export const orderRemoved = async (store: Store, event: Event) => {
  const { orderId } = decode.orderRemoved(event);

  const order = await store.get(Order, { where: { id: orderId.toString() } });
  if (!order) return;

  console.log(`[${event.name}] Removing order: ${JSON.stringify(order, null, 2)}`);
  await store.remove<Order>(order);
};
