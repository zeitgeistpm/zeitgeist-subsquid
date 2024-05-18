import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v49 from '../v49'
import * as v51 from '../v51'

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
