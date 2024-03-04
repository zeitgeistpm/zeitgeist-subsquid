import { Store } from '@subsquid/typeorm-store';
import { HistoricalOrder } from '../../model';
import { Event } from '../../processor';
import * as decode from './decode';


export const orderPlaced = async (event: Event): Promise<Order> => {
  const { orderId, marketId, maker, makerAsset, makerAmount, takerAsset, takerAmount } = decode.orderPlaced(event);

  const order = new Order({
    createdAt: new Date(event.block.timestamp!),
    id: orderId,
    makerAccountId: maker,
    maker: new OrderRecord({
      asset: makerAsset,
      filledAmount: BigInt(0),
      initialAmount: makerAmount,
    }),
    marketId,
    taker: new OrderRecord({
      asset: takerAsset,
      filledAmount: BigInt(0),
      initialAmount: takerAmount,
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
