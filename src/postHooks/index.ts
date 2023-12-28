import { unreserveBalances } from './balancesUnreserved';
import { destroyMarkets } from './marketDestroyed';
import { resolveMarkets } from './marketResolved';

export { unreserveBalances, destroyMarkets, resolveMarkets };

export interface ResolvedMarket {
  blockHeight: number;
  blockTimestamp: string;
  eventId: string;
  marketId: number;
  resolvedOutcome: string;
}

export interface UnreservedBalance {
  accountId: string;
  amount: bigint;
  blockHeight: number;
  blockTimestamp: string;
  eventId: string;
}
