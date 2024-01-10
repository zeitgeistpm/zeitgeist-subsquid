import {
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
  BlockHeader,
  Call as _Call,
  Event as _Event,
  Extrinsic as _Extrinsic,
} from '@subsquid/substrate-processor';
import { events } from './types';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`);

export const processor = new SubstrateBatchProcessor()
  .setGateway(process.env.ARCHIVE_GATEWAY_URL!)
  .setRpcEndpoint(process.env.WS_NODE_URL!)
  .addEvent({
    name: [
      events.assetTxPayment.assetTxFeePaid.name,
      events.authorized.authorityReported.name,
      events.balances.balanceSet.name,
      events.balances.deposit.name,
      events.balances.dustLost.name,
      events.balances.transfer.name,
      events.balances.reserveRepatriated.name,
      events.balances.reserved.name,
      events.balances.transfer.name,
      events.balances.unreserved.name,
      events.balances.withdraw.name,
      events.court.mintedInCourt.name,
      events.currency.deposited.name,
      events.currency.transferred.name,
      events.currency.withdrawn.name,
      events.neoSwaps.buyExecuted.name,
      events.neoSwaps.exitExecuted.name,
      events.neoSwaps.feesWithdrawn.name,
      events.neoSwaps.joinExecuted.name,
      events.neoSwaps.poolDeployed.name,
      events.neoSwaps.sellExecuted.name,
      events.parachainStaking.rewarded.name,
      events.predictionMarkets.globalDisputeStarted.name,
      events.predictionMarkets.marketApproved.name,
      events.predictionMarkets.marketClosed.name,
      events.predictionMarkets.marketCreated.name,
      events.predictionMarkets.marketDestroyed.name,
      events.predictionMarkets.marketDisputed.name,
      events.predictionMarkets.marketExpired.name,
      events.predictionMarkets.marketInsufficientSubsidy.name,
      events.predictionMarkets.marketRejected.name,
      events.predictionMarkets.marketReported.name,
      events.predictionMarkets.marketResolved.name,
      events.predictionMarkets.marketStartedWithSubsidy.name,
      events.predictionMarkets.tokensRedeemed.name,
      events.styx.accountCrossed.name,
      events.swaps.arbitrageBuyBurn.name,
      events.swaps.arbitrageMintSell.name,
      events.swaps.marketCreatorFeesPaid.name,
      events.swaps.poolActive.name,
      events.swaps.poolClosed.name,
      events.swaps.poolCreate.name,
      events.swaps.poolDestroyed.name,
      events.swaps.poolExit.name,
      events.swaps.poolExitWithExactAssetAmount.name,
      events.swaps.poolJoin.name,
      events.swaps.poolJoinWithExactAssetAmount.name,
      events.system.newAccount.name,
      events.tokens.balanceSet.name,
      events.tokens.deposited.name,
      events.tokens.reserved.name,
      events.tokens.transfer.name,
      events.tokens.withdrawn.name,
    ],
    call: true,
    extrinsic: true,
  })
  .addEvent({
    name: [
      events.predictionMarkets.boughtCompleteSet.name,
      events.predictionMarkets.soldCompleteSet.name,
      events.swaps.swapExactAmountIn.name,
      events.swaps.swapExactAmountOut.name,
    ],
    call: true,
    extrinsic: true,
    stack: true,
  })
  .setFields({
    call: {
      name: true,
      origin: true,
      success: true,
    },
    event: {
      args: true,
    },
    extrinsic: {
      hash: true,
      signature: true,
    },
    block: {
      timestamp: true,
    },
  });

type Fields = SubstrateBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Call = _Call<Fields>;
export type Event = _Event<Fields>;
export type Extrinsic = _Extrinsic<Fields>;
