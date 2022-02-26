import { SubstrateProcessor } from "@subsquid/substrate-processor"
import { balancesBalanceSet, balancesDustLost, balancesEndowed, balancesReserved, balancesTransfer, 
    balancesUnreserved, currencyDeposited, currencyTransferred, currencyWithdrawn, systemExtrinsicFailed, 
    systemExtrinsicSuccess, systemNewAccount, tokensEndowed } from "./balances";
import { predictionMarketApproved, predictionMarketBoughtCompleteSet, predictionMarketCancelled, 
    predictionMarketCreated, predictionMarketDisputed, predictionMarketInsufficientSubsidy, 
    predictionMarketRejected, predictionMarketReported, predictionMarketResolved, 
    predictionMarketSoldCompleteSet, predictionMarketStartedWithSubsidy } from "./markets";

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
//processor.setBlockRange({from: 816, to: 830})
processor.addEventHandler('system.NewAccount', systemNewAccount)
processor.addEventHandler('system.ExtrinsicSuccess', systemExtrinsicSuccess)
processor.addEventHandler('system.ExtrinsicFailed', systemExtrinsicFailed)
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

processor.run()