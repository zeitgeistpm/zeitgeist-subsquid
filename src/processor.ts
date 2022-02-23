import * as ss58 from "@subsquid/ss58"
import {EventHandlerContext, SubstrateProcessor} from "@subsquid/substrate-processor"
import {Account, AccountBalance, HistoricalAccountBalance} from "./model"
import {BalancesEndowedEvent} from "./types/events"

const processor = new SubstrateProcessor('balances_endowed')
processor.setTypesBundle('zeitgeist.json')
processor.setBatchSize(500)
processor.setDataSource({
    archive: 'https://indexer.zeitgeist.pm/v1/graphql',
    chain: 'wss://bsr.zeitgeist.pm'
})

async function balancesEndowed(ctx: EventHandlerContext) {
    const {store, event, block} = ctx
    const {accountId, amount} = getEndowedEvent(ctx)
    const walletId = ss58.codec('zeitgeistpm').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
    }
    
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab && ab.balance === BigInt(0)) {
        ab.balance = ab.balance + amount
        console.log(`[${event.method}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        const hab = new HistoricalAccountBalance()
        hab.accountId = acc.wallet
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = amount
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = BigInt(block.timestamp)
        console.log(`[${event.method}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    }
}

processor.addEventHandler('balances.Endowed', balancesEndowed)

processor.run()

interface EndowedEvent {
    accountId: Uint8Array
    amount: bigint
}

function getEndowedEvent(ctx: EventHandlerContext): EndowedEvent {
    const event = new BalancesEndowedEvent(ctx)
    const [accountId, amount] = event.asLatest
    return {accountId, amount}
}