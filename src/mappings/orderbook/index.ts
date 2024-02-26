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
