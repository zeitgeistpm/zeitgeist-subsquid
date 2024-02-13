import { unreserveBalances } from './balancesUnreserved';
import { initBalance } from './initBalance';
import { destroyMarkets } from './marketDestroyed';
import { migrateScoringRule } from './migrateScoringRule';
import { resolveMarket } from './resolveMarket';

export { destroyMarkets, initBalance, migrateScoringRule, unreserveBalances, resolveMarket };

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
  blockHeight?: number;
  blockTimestamp?: string;
  eventId?: string;
}
