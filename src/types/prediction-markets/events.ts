import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v23 from '../v23'
import * as v29 from '../v29'
import * as v32 from '../v32'
import * as v34 from '../v34'
import * as v35 from '../v35'
import * as v36 from '../v36'
import * as v38 from '../v38'
import * as v40 from '../v40'
import * as v41 from '../v41'
import * as v42 from '../v42'
import * as v46 from '../v46'
import * as v49 from '../v49'
import * as v50 from '../v50'
import * as v51 from '../v51'
import * as v53 from '../v53'
import * as v54 from '../v54'
import * as v55 from '../v55'
import * as v56 from '../v56'
import * as v57 from '../v57'

export const boughtCompleteSet =  {
    name: 'PredictionMarkets.BoughtCompleteSet',
    /**
     *  A complete set of shares has been bought \[market_id, buyer\]
     */
    v23: new EventType(
        'PredictionMarkets.BoughtCompleteSet',
        sts.tuple([v23.MarketIdOf, v23.AccountId])
    ),
    /**
     * A complete set of assets has been bought \[market_id, amount_per_asset, buyer\]
     */
    v34: new EventType(
        'PredictionMarkets.BoughtCompleteSet',
        sts.tuple([sts.bigint(), sts.bigint(), v34.AccountId32])
    ),
}

export const marketApproved =  {
    name: 'PredictionMarkets.MarketApproved',
    /**
     *  A market has been approved \[market_id\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketApproved',
        v23.MarketIdOf
    ),
    /**
     *  A market has been approved \[market_id, new_market_status\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketApproved',
        sts.tuple([v29.MarketIdOf, v29.MarketStatus])
    ),
    /**
     * A market has been approved. \[market_id, new_market_status\]
     */
    v53: new EventType(
        'PredictionMarkets.MarketApproved',
        sts.tuple([sts.bigint(), v53.MarketStatus])
    ),
}

export const marketCreated =  {
    name: 'PredictionMarkets.MarketCreated',
    /**
     *  A market has been created \[market_id, creator\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([v23.MarketIdOf, v23.Market, v23.AccountId])
    ),
    /**
     *  A market has been created \[market_id, creator\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([v29.MarketIdOf, v29.Market])
    ),
    /**
     * A market has been created \[market_id, creator\]
     */
    v32: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v32.Market])
    ),
    /**
     * A market has been created \[market_id, market_account, creator\]
     */
    v36: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v36.AccountId32, v36.Market])
    ),
    /**
     * A market has been created \[market_id, market_account, creator\]
     */
    v38: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v38.AccountId32, v38.Market])
    ),
    /**
     * A market has been created \[market_id, market_account, creator\]
     */
    v40: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v40.AccountId32, v40.Market])
    ),
    /**
     * A market has been created \[market_id, market_account, market\]
     */
    v41: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v41.AccountId32, v41.Market])
    ),
    /**
     * A market has been created \[market_id, market_account, market\]
     */
    v42: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v42.AccountId32, v42.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v46: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v46.AccountId32, v46.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v49: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v49.AccountId32, v49.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v50: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v50.AccountId32, v50.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v51: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v51.AccountId32, v51.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v53: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v53.AccountId32, v53.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v54: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v54.AccountId32, v54.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v55: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v55.AccountId32, v55.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v56: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v56.AccountId32, v56.Market])
    ),
    /**
     * A market has been created. \[market_id, market_account, market\]
     */
    v57: new EventType(
        'PredictionMarkets.MarketCreated',
        sts.tuple([sts.bigint(), v57.AccountId32, v57.Market])
    ),
}

export const marketStartedWithSubsidy =  {
    name: 'PredictionMarkets.MarketStartedWithSubsidy',
    /**
     *  A market was started after gathering enough subsidy. \[market_id\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketStartedWithSubsidy',
        v23.MarketIdOf
    ),
    /**
     *  A market was started after gathering enough subsidy. \[market_id, new_market_status\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketStartedWithSubsidy',
        sts.tuple([v29.MarketIdOf, v29.MarketStatus])
    ),
}

export const marketInsufficientSubsidy =  {
    name: 'PredictionMarkets.MarketInsufficientSubsidy',
    /**
     * A market was discarded after failing to gather enough subsidy. \[market_id\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketInsufficientSubsidy',
        v23.MarketIdOf
    ),
    /**
     *  A market was discarded after failing to gather enough subsidy. \[market_id, new_market_status\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketInsufficientSubsidy',
        sts.tuple([v29.MarketIdOf, v29.MarketStatus])
    ),
}

export const marketDisputed =  {
    name: 'PredictionMarkets.MarketDisputed',
    /**
     *  A market has been disputed \[market_id, new_outcome\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketDisputed',
        sts.tuple([v23.MarketIdOf, v23.OutcomeReport])
    ),
    /**
     *  A market has been disputed \[market_id, new_market_status, new_outcome\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketDisputed',
        sts.tuple([v29.MarketIdOf, v29.MarketStatus, v29.MarketDispute])
    ),
    /**
     * A market has been disputed \[market_id, new_market_status\]
     */
    v49: new EventType(
        'PredictionMarkets.MarketDisputed',
        sts.tuple([sts.bigint(), v49.MarketStatus])
    ),
    /**
     * A market has been disputed \[market_id, new_market_status, disputant\]
     */
    v51: new EventType(
        'PredictionMarkets.MarketDisputed',
        sts.tuple([sts.bigint(), v51.MarketStatus, v51.AccountId32])
    ),
    /**
     * A market has been disputed \[market_id, new_market_status, disputant\]
     */
    v53: new EventType(
        'PredictionMarkets.MarketDisputed',
        sts.tuple([sts.bigint(), v53.MarketStatus, v53.AccountId32])
    ),
}

export const marketRejected =  {
    name: 'PredictionMarkets.MarketRejected',
    /**
     *  NOTE: Maybe we should only allow rejections.
     *  A pending market has been rejected as invalid. \[market_id\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketRejected',
        v23.MarketIdOf
    ),
    /**
     * A pending market has been rejected as invalid with a reason. \[market_id, reject_reason\]
     */
    v41: new EventType(
        'PredictionMarkets.MarketRejected',
        sts.tuple([sts.bigint(), v41.BoundedVec])
    ),
}

export const marketReported =  {
    name: 'PredictionMarkets.MarketReported',
    /**
     *  A market has been reported on \[market_id, reported_outcome\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketReported',
        sts.tuple([v23.MarketIdOf, v23.OutcomeReport])
    ),
    /**
     *  A market has been reported on \[market_id, new_market_status, reported_outcome\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketReported',
        sts.tuple([v29.MarketIdOf, v29.MarketStatus, v29.Report])
    ),
    /**
     * A market has been reported on. \[market_id, new_market_status, reported_outcome\]
     */
    v53: new EventType(
        'PredictionMarkets.MarketReported',
        sts.tuple([sts.bigint(), v53.MarketStatus, v53.Report])
    ),
}

export const marketResolved =  {
    name: 'PredictionMarkets.MarketResolved',
    /**
     *  A market has been resolved \[market_id, real_outcome\]
     */
    v23: new EventType(
        'PredictionMarkets.MarketResolved',
        sts.tuple([v23.MarketIdOf, sts.number()])
    ),
    /**
     *  A market has been resolved \[market_id, new_market_status, real_outcome\]
     */
    v29: new EventType(
        'PredictionMarkets.MarketResolved',
        sts.tuple([v29.MarketIdOf, v29.MarketStatus, v29.OutcomeReport])
    ),
    /**
     * A market has been resolved. \[market_id, new_market_status, real_outcome\]
     */
    v53: new EventType(
        'PredictionMarkets.MarketResolved',
        sts.tuple([sts.bigint(), v53.MarketStatus, v53.OutcomeReport])
    ),
}

export const soldCompleteSet =  {
    name: 'PredictionMarkets.SoldCompleteSet',
    /**
     *  A complete set of shares has been sold \[market_id, seller\]
     */
    v23: new EventType(
        'PredictionMarkets.SoldCompleteSet',
        sts.tuple([v23.MarketIdOf, v23.AccountId])
    ),
    /**
     * A complete set of assets has been sold \[market_id, amount_per_asset, seller\]
     */
    v34: new EventType(
        'PredictionMarkets.SoldCompleteSet',
        sts.tuple([sts.bigint(), sts.bigint(), v34.AccountId32])
    ),
}

export const marketDestroyed =  {
    name: 'PredictionMarkets.MarketDestroyed',
    /**
     * A market has been created \[market_id, creator\]
     */
    v32: new EventType(
        'PredictionMarkets.MarketDestroyed',
        sts.bigint()
    ),
}

export const tokensRedeemed =  {
    name: 'PredictionMarkets.TokensRedeemed',
    /**
     * An amount of winning outcomes have been redeemed \[market_id, currency_id, amount_redeemed, payout, who\]
     */
    v35: new EventType(
        'PredictionMarkets.TokensRedeemed',
        sts.tuple([sts.bigint(), v35.Asset, sts.bigint(), sts.bigint(), v35.AccountId32])
    ),
    /**
     * An amount of winning outcomes have been redeemed
     * \[market_id, currency_id, amount_redeemed, payout, who\]
     */
    v41: new EventType(
        'PredictionMarkets.TokensRedeemed',
        sts.tuple([sts.bigint(), v41.Asset, sts.bigint(), sts.bigint(), v41.AccountId32])
    ),
    /**
     * An amount of winning outcomes have been redeemed.
     * \[market_id, currency_id, amount_redeemed, payout, who\]
     */
    v51: new EventType(
        'PredictionMarkets.TokensRedeemed',
        sts.tuple([sts.bigint(), v51.Asset, sts.bigint(), sts.bigint(), v51.AccountId32])
    ),
    /**
     * An amount of winning outcomes have been redeemed.
     * \[market_id, currency_id, amount_redeemed, payout, who\]
     */
    v54: new EventType(
        'PredictionMarkets.TokensRedeemed',
        sts.tuple([sts.bigint(), v54.Asset, sts.bigint(), sts.bigint(), v54.AccountId32])
    ),
    /**
     * An amount of winning outcomes have been redeemed.
     * \[market_id, currency_id, amount_redeemed, payout, who\]
     */
    v56: new EventType(
        'PredictionMarkets.TokensRedeemed',
        sts.tuple([sts.bigint(), v56.Asset, sts.bigint(), sts.bigint(), v56.AccountId32])
    ),
}

export const marketClosed =  {
    name: 'PredictionMarkets.MarketClosed',
    /**
     * A market has been closed \[market_id\]
     */
    v37: new EventType(
        'PredictionMarkets.MarketClosed',
        sts.bigint()
    ),
}

export const marketExpired =  {
    name: 'PredictionMarkets.MarketExpired',
    /**
     * An advised market has ended before it was approved or rejected. \[market_id\]
     */
    v37: new EventType(
        'PredictionMarkets.MarketExpired',
        sts.bigint()
    ),
}

export const globalDisputeStarted =  {
    name: 'PredictionMarkets.GlobalDisputeStarted',
    /**
     * The global dispute was started. \[market_id\]
     */
    v41: new EventType(
        'PredictionMarkets.GlobalDisputeStarted',
        sts.bigint()
    ),
}

export const marketEarlyCloseScheduled =  {
    name: 'PredictionMarkets.MarketEarlyCloseScheduled',
    /**
     * A market has been scheduled to close early.
     */
    v51: new EventType(
        'PredictionMarkets.MarketEarlyCloseScheduled',
        sts.struct({
            marketId: sts.bigint(),
            newPeriod: v51.MarketPeriod,
            state: v51.EarlyCloseState,
        })
    ),
}
