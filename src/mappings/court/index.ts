import { Court, CourtStatus, RoundEndsInfo, VoteItemType } from '../../model';
import { Event } from '../../processor';
import * as decode from './decode';

export const courtOpened = async (event: Event): Promise<Court> => {
  const { marketId, courtInfo } = decode.courtOpened(event);

  const court = new Court({
    id: marketId.toString(),
    marketId: marketId,
    roundEnds: new RoundEndsInfo({
      preVote: courtInfo.roundEnds.preVote,
      vote: courtInfo.roundEnds.vote,
      aggregation: courtInfo.roundEnds.aggregation,
      appeal: courtInfo.roundEnds.appeal,
    }),
    status: CourtStatus.Opened,
    voteItemType: VoteItemType.Outcome,
  });
  return court;
};
