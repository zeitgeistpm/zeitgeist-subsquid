import { SubstrateProcessor } from "@subsquid/substrate-processor"
import { balancesBalanceSet, balancesDustLost, balancesEndowed, balancesReserved, balancesTransfer, 
    balancesUnreserved, currencyDeposited, currencyTransferred, currencyWithdrawn, systemExtrinsicFailed, 
    systemExtrinsicSuccess, systemNewAccount, tokensEndowed } from "./balances";

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

processor.run()