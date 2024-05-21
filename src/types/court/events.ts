import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v49 from '../v49'
import * as v51 from '../v51'
import * as v53 from '../v53'

export const jurorVoted =  {
    name: 'Court.JurorVoted',
    /**
     * A juror has voted in a court.
     */
    v49: new EventType(
        'Court.JurorVoted',
        sts.struct({
            courtId: sts.bigint(),
            juror: v49.AccountId32,
            commitment: v49.H256,
        })
    ),
}

export const jurorRevealedVote =  {
    name: 'Court.JurorRevealedVote',
    /**
     * A juror has revealed their vote.
     */
    v49: new EventType(
        'Court.JurorRevealedVote',
        sts.struct({
            juror: v49.AccountId32,
            courtId: sts.bigint(),
            voteItem: v49.VoteItem,
            salt: v49.H256,
        })
    ),
    /**
     * A juror has revealed their vote.
     */
    v53: new EventType(
        'Court.JurorRevealedVote',
        sts.struct({
            juror: v53.AccountId32,
            courtId: sts.bigint(),
            voteItem: v53.VoteItem,
            salt: v53.H256,
            slashableAmount: sts.bigint(),
            drawWeight: sts.number(),
        })
    ),
}

export const mintedInCourt =  {
    name: 'Court.MintedInCourt',
    /**
     * A new token amount was minted for a court participant.
     */
    v49: new EventType(
        'Court.MintedInCourt',
        sts.struct({
            courtParticipant: v49.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const courtOpened =  {
    name: 'Court.CourtOpened',
    /**
     * A court case was opened.
     */
    v51: new EventType(
        'Court.CourtOpened',
        sts.struct({
            marketId: sts.bigint(),
            courtInfo: v51.CourtInfo,
        })
    ),
}
