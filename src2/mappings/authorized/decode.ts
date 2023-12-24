import { OutcomeReport } from '../../types/v49';
import { events } from '../../types';
import { Event } from '../../processor';

export const decodeAuthorityReportedEvent = (event: Event): AuthorityReportedEvent => {
  let decoded: { marketId: bigint; outcome: OutcomeReport };
  if (events.authorized.authorityReported.v49.is(event)) {
    decoded = events.authorized.authorityReported.v49.decode(event);
  } else {
    decoded = event.args;
  }
  return { marketId: Number(decoded.marketId), outcome: decoded.outcome };
};

interface AuthorityReportedEvent {
  marketId: number;
  outcome: OutcomeReport;
}
