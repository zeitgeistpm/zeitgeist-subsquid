import { SubstrateProcessor } from "@subsquid/substrate-processor"
import { balancesBalanceSet, balancesDustLost, balancesEndowed, balancesReserved, balancesTransfer, 
    balancesUnreserved, currencyDeposited, currencyTransferred, currencyWithdrawn, parachainStakingRewarded, 
    systemExtrinsicFailed, systemExtrinsicSuccess, systemNewAccount, tokensEndowed } from "./balances";
import { predictionMarketApproved, predictionMarketBoughtCompleteSet, predictionMarketCancelled, 
    predictionMarketCreated, predictionMarketDisputed, predictionMarketInsufficientSubsidy, 
    predictionMarketRejected, predictionMarketReported, predictionMarketResolved, 
    predictionMarketSoldCompleteSet, predictionMarketStartedWithSubsidy } from "./markets";
import { add_balance_108949, add_balance_155917, add_balance_175178, add_balance_178290, add_balance_179524, 
  add_balance_184820, add_balance_204361 } from "./postHooks";
import { swapExactAmountIn, swapExactAmountOut, swapPoolCreated, swapPoolExited, swapPoolJoined } from "./swaps";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
}

const processor = new SubstrateProcessor("zeitgeist");
processor.setTypesBundle("zeitgeist.json");
processor.setBatchSize(500);
processor.setDataSource({
  archive:
    process.env["INDEXER_ENDPOINT_URL"] ??
    "https://indexer.zeitgeist.pm/v1/graphql",
  chain: process.env["WS_NODE_URL"] ?? "wss://bsr.zeitgeist.pm",
});
//processor.setBlockRange({from: 815, to: 14210})

processor.addEventHandler('parachainStaking.Rewarded', parachainStakingRewarded)
processor.addEventHandler('system.NewAccount', systemNewAccount)
processor.addEventHandler('system.ExtrinsicSuccess', systemExtrinsicSuccess)
processor.addEventHandler('system.ExtrinsicFailed', systemExtrinsicFailed)
processor.addEventHandler('balances.Endowed', balancesEndowed)
processor.addEventHandler('balances.DustLost', balancesDustLost)
processor.addEventHandler('balances.Transfer', balancesTransfer)
processor.addEventHandler('balances.BalanceSet', balancesBalanceSet)
processor.addEventHandler('balances.Reserved', balancesReserved)
processor.addEventHandler('balances.Unreserved', balancesUnreserved)
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
processor.addEventHandler('swaps.PoolCreate', swapPoolCreated)
processor.addEventHandler('swaps.PoolExit', swapPoolExited)
processor.addEventHandler('swaps.PoolJoin', swapPoolJoined)
processor.addEventHandler('swaps.SwapExactAmountIn', swapExactAmountIn)
processor.addEventHandler('swaps.SwapExactAmountOut', swapExactAmountOut)

processor.addPostHook({range: {from: 108949, to: 108949}}, add_balance_108949)
processor.addPostHook({range: {from: 155917, to: 155917}}, add_balance_155917)
processor.addPostHook({range: {from: 175178, to: 175178}}, add_balance_175178)
processor.addPostHook({range: {from: 178290, to: 178290}}, add_balance_178290)
processor.addPostHook({range: {from: 179524, to: 179524}}, add_balance_179524)
processor.addPostHook({range: {from: 184820, to: 184820}}, add_balance_184820)
processor.addPostHook({range: {from: 204361, to: 204361}}, add_balance_204361)

processor.run()