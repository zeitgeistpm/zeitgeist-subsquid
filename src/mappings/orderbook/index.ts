import { Store } from '@subsquid/typeorm-store';
import { HistoricalOrder, HistoricalSwap, Order, OrderEvent, OrderRecord, OrderStatus } from '../../model';
import { SwapEvent } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import * as decode from './decode';

export const orderFilled = async (
  store: Store,
  event: Event
): Promise<{ order: Order; historicalOrder: HistoricalOrder; historicalSwap: HistoricalSwap } | undefined> => {
  const {
    orderId,
    taker,
    filledMakerAmount,
    filledTakerAmount,
    unfilledMakerAmount,
    unfilledTakerAmount,
    externalFeeAccount,
    externalFeeAmount,
  } = decode.orderFilled(event);

  const order = await store.get(Order, { where: { id: orderId.toString() } });
  if (!order) return;

  order.maker.filledAmount += filledMakerAmount;
  order.taker.filledAmount += filledTakerAmount;
  order.maker.unfilledAmount = unfilledMakerAmount;
  order.status = OrderStatus.Filled;
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
    externalFeeAmount: externalFeeAccount === order.makerAccountId ? externalFeeAmount : undefined,
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
    externalFeeAmount: externalFeeAccount === order.makerAccountId ? externalFeeAmount : undefined,
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
    status: OrderStatus.Placed,
    taker: new OrderRecord({
      asset: takerAsset,
      filledAmount: BigInt(0),
      unfilledAmount: takerAmount,
    }),
    updatedAt: new Date(event.block.timestamp!),
  });
  return order;
};

export const orderRemoved = async (store: Store, event: Event): Promise<Order | undefined> => {
  const { orderId } = decode.orderRemoved(event);

  const order = await store.get(Order, { where: { id: orderId.toString() } });
  if (!order) return;

  order.status = OrderStatus.Removed;
  return order;
};
