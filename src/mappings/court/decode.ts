import { CourtInfo } from '../../types/v51';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { Event } from '../../processor';

export const courtOpened = (event: Event): CourtOpenedEvent => {
  let decoded: {
    marketId: bigint;
    courtInfo: CourtInfo;
  };
  if (events.court.courtOpened.v51.is(event)) {
    decoded = events.court.courtOpened.v51.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    marketId: +decoded.marketId.toString(),
    courtInfo: decoded.courtInfo,
  };
};

interface CourtOpenedEvent {
  marketId: number;
  courtInfo: CourtInfo;
}
