import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v26 from '../v26'
import * as v35 from '../v35'

export const rewarded =  {
    name: 'ParachainStaking.Rewarded',
    /**
     *  Paid the account (nominator or collator) the balance as liquid rewards
     */
    v26: new EventType(
        'ParachainStaking.Rewarded',
        sts.tuple([v26.AccountId, v26.BalanceOf])
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
