import { SubstrateProcessor } from "@subsquid/substrate-processor"
import { balancesBalanceSet, balancesDustLost, balancesEndowed, balancesReserved, balancesTransfer, 
    balancesUnreserved, balancesWithdraw, currencyDeposited, currencyTransferred, currencyWithdrawn, 
    parachainStakingRewarded, systemNewAccount, tokensEndowed } from "../balances";
import { predictionMarketApproved, predictionMarketBoughtCompleteSet, predictionMarketCancelled, 
    predictionMarketCreated, predictionMarketDisputed, predictionMarketInsufficientSubsidy, 
    predictionMarketRejected, predictionMarketReported, predictionMarketResolved, 
    predictionMarketSoldCompleteSet, predictionMarketStartedWithSubsidy, predictionMarketTokensRedeemed } from "../markets";
import { swapExactAmountIn, swapExactAmountOut, swapPoolCreated, swapPoolExited, swapPoolJoined } from "../swaps";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
}

const processor = new SubstrateProcessor("zeitgeist");
processor.setTypesBundle("zeitgeist.json");
processor.setBatchSize(500);
processor.setDataSource({
  archive: "http://139.177.183.163:4010/v1/graphql",
  chain: "wss://rpc-0.zeitgeist.pm",
});
//processor.setBlockRange({from: 1276506, to: 1276506})

processor.addEventHandler('parachainStaking.Rewarded', parachainStakingRewarded)
processor.addEventHandler('system.NewAccount', systemNewAccount)
processor.addEventHandler('balances.Endowed', balancesEndowed)
processor.addEventHandler('balances.DustLost', balancesDustLost)
processor.addEventHandler('balances.Transfer', balancesTransfer)
processor.addEventHandler('balances.BalanceSet', balancesBalanceSet)
processor.addEventHandler('balances.Reserved', balancesReserved)
processor.addEventHandler('balances.Unreserved', balancesUnreserved)
processor.addEventHandler('balances.Withdraw', balancesWithdraw)
processor.addEventHandler('tokens.Endowed', tokensEndowed)
processor.addEventHandler('currency.Transferred', currencyTransferred)
processor.addEventHandler('currency.Deposited', currencyDeposited)
processor.addEventHandler('currency.Withdrawn', currencyWithdrawn)
processor.addEventHandler('predictionMarkets.BoughtCompleteSet', predictionMarketBoughtCompleteSet)
processor.addEventHandler('predictionMarkets.MarketApproved', predictionMarketApproved)
processor.addEventHandler('predictionMarkets.MarketCreated', predictionMarketCreated)
processor.addEventHandler('predictionMarkets.MarketStartedWithSubsidy', predictionMarketStartedWithSubsidy)
processor.addEventHandler('predictionMarkets.MarketInsufficientSubsidy', predictionMarketInsufficientSubsidy)
processor.addEventHandler('predictionMarkets.MarketDisputed', predictionMarketDisputed)
processor.addEventHandler('predictionMarkets.MarketRejected', predictionMarketRejected)
processor.addEventHandler('predictionMarkets.MarketReported', predictionMarketReported)
processor.addEventHandler('predictionMarkets.MarketCancelled', predictionMarketCancelled)
processor.addEventHandler('predictionMarkets.MarketResolved', predictionMarketResolved)
processor.addEventHandler('predictionMarkets.SoldCompleteSet', predictionMarketSoldCompleteSet)
processor.addEventHandler('predictionMarkets.TokensRedeemed', predictionMarketTokensRedeemed)
processor.addEventHandler('swaps.PoolCreate', swapPoolCreated)
processor.addEventHandler('swaps.PoolExit', swapPoolExited)
processor.addEventHandler('swaps.PoolJoin', swapPoolJoined)
processor.addEventHandler('swaps.SwapExactAmountIn', swapExactAmountIn)
processor.addEventHandler('swaps.SwapExactAmountOut', swapExactAmountOut)

processor.run()