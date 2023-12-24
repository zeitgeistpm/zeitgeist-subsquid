import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v39 from '../v39'

export const accountCrossed =  {
    name: 'Styx.AccountCrossed',
    /**
     * A account crossed and claimed their right to create their avatar.
     */
    v39: new EventType(
        'Styx.AccountCrossed',
        sts.tuple([v39.AccountId32, sts.bigint()])
    ),
}
