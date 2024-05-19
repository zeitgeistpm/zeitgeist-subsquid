import { CourtStatus, VoteItemType } from '../../model';
import { CourtStatus as _CourtStatus, VoteItemType as _VoteItemType } from '../../types/v51';

export const mapCourtStatus = (status: _CourtStatus): CourtStatus => {
  switch (status.__kind) {
    case 'Closed':
      return CourtStatus.Closed;
    case 'Open':
      return CourtStatus.Open;
    case 'Reassigned':
      return CourtStatus.Reassigned;
  }
};

export const mapVoteItemType = (voteItemType: _VoteItemType): VoteItemType => {
  switch (voteItemType.__kind) {
    case 'Binary':
      return VoteItemType.Binary;
    case 'Outcome':
      return VoteItemType.Outcome;
  }
};
