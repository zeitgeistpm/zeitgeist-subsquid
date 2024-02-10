import { unreserveBalances } from './balancesUnreserved';
import { initBalance } from './initBalance';
import { destroyMarkets } from './marketDestroyed';
import { resolveMarkets } from './marketResolved';
import { migrateScoringRule } from './migrateScoringRule';

export { destroyMarkets, initBalance, migrateScoringRule, resolveMarkets, unreserveBalances };

export interface ResolvedMarket {
  blockHeight: number;
  blockTimestamp: string;
  eventId: string;
  marketId: number;
  resolvedOutcome: string;
}

export interface PostHookBalance {
  accountId: string;
  amount: bigint;
  blockHeight: number;
  blockTimestamp: string;
  eventId: string;
}
