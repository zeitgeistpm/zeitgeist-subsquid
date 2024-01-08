import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v23 from '../v23'
import * as v35 from '../v35'

export const rewarded =  {
    name: 'ParachainStaking.Rewarded',
    /**
     *  Paid the account (nominator or collator) the balance as liquid rewards
     */
    v23: new EventType(
        'ParachainStaking.Rewarded',
        sts.tuple([v23.AccountId, v23.BalanceOf])
    ),
    /**
     * Paid the account (delegator or collator) the balance as liquid rewards.
     */
    v35: new EventType(
        'ParachainStaking.Rewarded',
        sts.struct({
            account: v35.AccountId32,
            rewards: sts.bigint(),
        })
    ),
}
