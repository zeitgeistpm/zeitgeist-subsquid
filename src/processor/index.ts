import { SubstrateProcessor } from "@subsquid/substrate-processor"
import { balancesBalanceSet, balancesDustLost, balancesEndowed, balancesReserved, balancesTransfer, 
    balancesUnreserved, currencyDeposited, currencyTransferred, currencyWithdrawn, systemExtrinsicFailed, 
    systemExtrinsicSuccess, systemNewAccount, tokensEndowed } from "./balances";
import { predictionMarketApproved, predictionMarketBoughtCompleteSet, predictionMarketCancelled, 
    predictionMarketCreated, predictionMarketDisputed, predictionMarketInsufficientSubsidy, 
    predictionMarketRejected, predictionMarketReported, predictionMarketResolved, 
    predictionMarketSoldCompleteSet, predictionMarketStartedWithSubsidy } from "./markets";
import { add_balance_108949, add_balance_155917 } from "./postHooks";
import { swapExactAmountIn, swapExactAmountOut, swapPoolCreated, swapPoolExited, swapPoolJoined } from "./swaps";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
}

const processor = new SubstrateProcessor('zeitgeist')
processor.setTypesBundle('zeitgeist.json')
processor.setBatchSize(500)
processor.setDataSource({
    archive: 'https://indexer.zeitgeist.pm/v1/graphql',
    chain: 'wss://bsr.zeitgeist.pm'
})
//processor.setBlockRange({from: 815, to: 14210})

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

processor.run()