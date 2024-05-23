import { Store } from '@subsquid/typeorm-store';
import { Court, CourtEvent, CourtStatus, HistoricalAccountBalance, HistoricalCourt, RoundEndsInfo } from '../../model';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Call, Event } from '../../processor';
import { decodeSlashedEvent } from '../balances/decode';
import * as decode from './decode';
import { mapCourtStatus, mapVoteItemType } from './helper';

export const courtOpened = async (event: Event): Promise<{ court: Court; historicalCourt: HistoricalCourt }> => {
  const { marketId, courtInfo } = decode.courtOpened(event);

  const court = new Court({
    id: (await decode.marketIdToCourtId(event.block, marketId)) ?? marketId.toString(),
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

  const historicalCourt = new HistoricalCourt({
    id: event.id + '-' + court.id,
    accountId: undefined,
    blockNumber: event.block.height,
    courtId: +court.id,
    event: CourtEvent.CourtOpened,
    timestamp: new Date(event.block.timestamp!),
  });

  return { court, historicalCourt };
};

export const jurorRevealedVote = async (event: Event): Promise<HistoricalCourt> => {
  const { courtId, accountId } = decode.jurorRevealedVote(event);

  const historicalCourt = new HistoricalCourt({
    id: event.id + '-' + courtId.toString(),
    accountId,
    blockNumber: event.block.height,
    courtId,
    event: CourtEvent.JurorRevealedVote,
    timestamp: new Date(event.block.timestamp!),
  });
  return historicalCourt;
};

export const jurorVoted = async (event: Event): Promise<HistoricalCourt> => {
  const { courtId, accountId } = decode.jurorVoted(event);

  const historicalCourt = new HistoricalCourt({
    id: event.id + '-' + courtId.toString(),
    accountId,
    blockNumber: event.block.height,
    courtId,
    event: CourtEvent.JurorVoted,
    timestamp: new Date(event.block.timestamp!),
  });
  return historicalCourt;
};

export const reassignCourtStakes = async (
  store: Store,
  call: Call
): Promise<{ court: Court; hc: HistoricalCourt; habs: HistoricalAccountBalance[] } | undefined> => {
  const courtId = decode.reassignCourtStakes(call);
  const court = await store.findOneBy(Court, {
    id: courtId.toString(),
  });
  if (!court) return;
  court.status = CourtStatus.Reassigned;

  const hc = new HistoricalCourt({
    id: call.id + '-' + courtId.toString(),
    accountId: undefined,
    blockNumber: call.block.height,
    courtId,
    event: CourtEvent.StakesReassigned,
    timestamp: new Date(call.block.timestamp!),
  });

  const habs: HistoricalAccountBalance[] = [];
  await Promise.all(
    call.events.map(async (event) => {
      if (event.name === events.balances.slashed.name) {
        const { accountId, amount } = decodeSlashedEvent(event);
        const hab = new HistoricalAccountBalance({
          accountId,
          assetId: _Asset.Ztg,
          blockNumber: event.block.height,
          dBalance: -amount,
          event: event.name.split('.')[1],
          extrinsic: extrinsicFromEvent(event),
          id: event.id + '-' + accountId.slice(-5),
          timestamp: new Date(event.block.timestamp!),
        });
        habs.push(hab);
      }
    })
  );
  return { court, hc, habs };
};
