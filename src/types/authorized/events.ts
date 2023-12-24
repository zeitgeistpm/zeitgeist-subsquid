import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v49 from '../v49'

export const authorityReported =  {
    name: 'Authorized.AuthorityReported',
    /**
     * The Authority reported.
     */
    v49: new EventType(
        'Authorized.AuthorityReported',
        sts.struct({
            marketId: sts.bigint(),
            outcome: v49.OutcomeReport,
        })
    ),
}
