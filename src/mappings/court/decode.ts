import * as ss58 from '@subsquid/ss58';
import { CourtInfo } from '../../types/v51';
import { calls, events, storage } from '../../types';
import { _Asset } from '../../consts';
import { Block, Call, Event } from '../../processor';

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

export const jurorRevealedVote = (event: Event): CourtEvent => {
  let decoded: {
    courtId: bigint;
    juror: string;
  };
  if (events.court.jurorRevealedVote.v49.is(event)) {
    decoded = events.court.jurorRevealedVote.v49.decode(event);
  } else if (events.court.jurorRevealedVote.v53.is(event)) {
    decoded = events.court.jurorRevealedVote.v53.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    courtId: +decoded.courtId.toString(),
    accountId: ss58.encode({ prefix: 73, bytes: decoded.juror }),
  };
};

export const jurorVoted = (event: Event): CourtEvent => {
  let decoded: {
    courtId: bigint;
    juror: string;
  };
  if (events.court.jurorVoted.v49.is(event)) {
    decoded = events.court.jurorVoted.v49.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    courtId: +decoded.courtId.toString(),
    accountId: ss58.encode({ prefix: 73, bytes: decoded.juror }),
  };
};

export const marketIdToCourtId = async (block: Block, marketId: number): Promise<string | undefined> => {
  let courtId: bigint | undefined;
  if (storage.court.marketIdToCourtId.v49.is(block)) {
    courtId = await storage.court.marketIdToCourtId.v49.get(block, BigInt(marketId));
  }
  return courtId?.toString();
};

export const reassignCourtStakes = (call: Call): number => {
  let decoded: { courtId: bigint };
  if (calls.court.reassignCourtStakes.v49.is(call)) {
    decoded = calls.court.reassignCourtStakes.v49.decode(call);
  } else {
    decoded = call.args;
  }
  return +decoded.courtId.toString();
};

interface CourtEvent {
  courtId: number;
  accountId: string;
}

interface CourtOpenedEvent {
  marketId: number;
  courtInfo: CourtInfo;
}
