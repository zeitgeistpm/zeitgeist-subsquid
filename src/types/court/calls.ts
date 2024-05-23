import {sts, Block, Bytes, Option, Result, CallType, RuntimeCtx} from '../support'

export const reassignCourtStakes =  {
    name: 'Court.reassign_court_stakes',
    /**
     * Reassign the stakes of the jurors and delegators
     * for the selected draws of the specified court.
     * The losing jurors and delegators get slashed and
     * pay for the winning jurors and delegators.
     * The tardy (juror did not reveal or did not vote) or denounced jurors
     * and associated delegators get slashed and reward the winners.
     * 
     * # Arguments
     * 
     * - `court_id`: The identifier of the court.
     * 
     * # Weight
     * 
     * Complexity: O(N + M), with `N` being the number of draws and `M` being the total number of valid winners and losers.
     */
    v49: new CallType(
        'Court.reassign_court_stakes',
        sts.struct({
            courtId: sts.bigint(),
        })
    ),
}
