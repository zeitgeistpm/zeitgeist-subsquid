import { Ctx, EventItem } from '../../processor';
import { AuthorizedAuthorityReportedEvent } from '../../types/events';
import { OutcomeReport } from '../../types/v49';

// @ts-ignore
export const getAuthorityReportedEvent = (ctx: Ctx, item: EventItem): AuthorityReportedEvent => {
  // @ts-ignore
  const event = new AuthorizedAuthorityReportedEvent(ctx, item.event);
  if (event.isV49) {
    const { marketId, outcome } = event.asV49;
    return { marketId, outcome };
  } else {
    const [marketId, outcome] = item.event.args;
    return { marketId, outcome };
  }
};

interface AuthorityReportedEvent {
  marketId: bigint;
  outcome: OutcomeReport;
}
