import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Currency } from '../chain/currency'
import { Account } from '../generated/modules/account/account.model'
import { AssetBalance } from '../generated/modules/asset-balance/asset-balance.model'
import { HistoricalAssetBalance } from '../generated/modules/historical-asset-balance/historical-asset-balance.model'

export async function currencyTransferred({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [currencyId, fromId, toId, amount] = new Currency.TransferredEvent(event).params
    
    var fa = await store.get(Account, { where: { wallet: fromId.toString() } })
    if (!fa) {
        fa = new Account()
        fa.wallet = fromId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
    }

    var faAB = await store.get(AssetBalance, { where: { account: fa, assetId: currencyId.toString() } })
    if (faAB) {
        faAB.balance = faAB.balance.sub(amount)
    } else {
        faAB = new AssetBalance()
        faAB.account = fa
        faAB.assetId = currencyId.toString()
        faAB.balance = new BN(0 - amount.toNumber())
    }
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(faAB, null, 2)}`)
    await store.save<AssetBalance>(faAB)

    const faHAB = new HistoricalAssetBalance()
    faHAB.account = fa
    faHAB.event = event.method
    faHAB.assetId = faAB.assetId
    faHAB.balance = faAB.balance 
    faHAB.blockNumber = block.height
    faHAB.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAssetBalance>(faHAB)

    var ta = await store.get(Account, { where: { wallet: toId.toString() } })
    if (!ta) {
        ta = new Account()
        ta.wallet = toId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
    }

    var taAB = await store.get(AssetBalance, { where: { account: ta, assetId: currencyId.toString() } })
    if (taAB) {
        taAB.balance = taAB.balance.add(amount)
    } else {
        taAB = new AssetBalance()
        taAB.account = ta
        taAB.assetId = currencyId.toString()
        taAB.balance = new BN(0 + amount.toNumber())
    }
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(taAB, null, 2)}`)
    await store.save<AssetBalance>(taAB)

    const taHAB = new HistoricalAssetBalance()
    taHAB.account = ta
    taHAB.event = event.method
    taHAB.assetId = taAB.assetId
    taHAB.balance = taAB.balance 
    taHAB.blockNumber = block.height
    taHAB.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(taHAB, null, 2)}`)
    await store.save<HistoricalAssetBalance>(taHAB)
}