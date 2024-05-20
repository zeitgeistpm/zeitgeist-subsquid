import { Court, RoundEndsInfo } from '../../model';
import { Event } from '../../processor';
import * as decode from './decode';
import { mapCourtStatus, mapVoteItemType } from './helper';

export const courtOpened = async (event: Event): Promise<Court> => {
  const { marketId, courtInfo } = decode.courtOpened(event);

  const court = new Court({
    id: marketId.toString(),
    marketId,
    roundEnds: new RoundEndsInfo({
      preVote: courtInfo.roundEnds.preVote,
      vote: courtInfo.roundEnds.vote,
      aggregation: courtInfo.roundEnds.aggregation,
      appeal: courtInfo.roundEnds.appeal,
    }),
    status: mapCourtStatus(courtInfo.status),
    voteItemType: mapVoteItemType(courtInfo.voteItemType),
  });
  return court;
};
