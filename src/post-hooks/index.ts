import { unreserveBalances } from './balancesUnreserved';
import { initBalance } from './initBalance';
import { destroyMarkets } from './marketDestroyed';
import { resolveMarket } from './resolveMarket';
import { migrateToAmmCdaHybrid, migrateToLmsr } from './scoringRule';

export { destroyMarkets, initBalance, migrateToAmmCdaHybrid, migrateToLmsr, unreserveBalances, resolveMarket };

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
