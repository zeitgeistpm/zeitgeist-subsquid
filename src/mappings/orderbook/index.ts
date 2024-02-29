import { Store } from '@subsquid/typeorm-store';
import { HistoricalOrder } from '../../model';
import { Event } from '../../processor';
import * as decode from './decode';

export const orderPlaced = async (event: Event): Promise<HistoricalOrder> => {
  const { orderId, marketId, maker, makerAsset, makerAmount, takerAsset, takerAmount } = decode.orderPlaced(event);

  const historicalOrder = new HistoricalOrder({
    blockNumber: event.block.height,
    id: orderId,
    maker,
    makerAmount,
    makerAsset,
    marketId,
    takerAmount,
    takerAsset,
    timestamp: new Date(event.block.timestamp!),
  });
  return historicalOrder;
};

export const orderRemoved = async (store: Store, event: Event) => {
  const { orderId } = decode.orderRemoved(event);

  const historicalOrder = await store.get(HistoricalOrder, { where: { id: orderId.toString() } });
  if (!historicalOrder) return;

  console.log(`[${event.name}] Removing historical-order: ${JSON.stringify(historicalOrder, null, 2)}`);
  await store.remove<HistoricalOrder>(historicalOrder);
};
