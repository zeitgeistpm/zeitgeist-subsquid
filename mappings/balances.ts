import BN from 'bn.js'
import { EventContext, StoreContext } from '@subsquid/hydra-common'
import { Currency } from '../chain/currency'
import { Account } from '../generated/modules/account/account.model'
import { AssetBalance } from '../generated/modules/asset-balance/asset-balance.model'
import { HistoricalAssetBalance } from '../generated/modules/historical-asset-balance/historical-asset-balance.model'
import { Balances, Tokens } from '../chain'

export async function balancesEndowed({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId, amount] = new Balances.EndowedEvent(event).params
    
    var acc = await store.get(Account, { where: { wallet: accountId.toString() } })
    if (!acc) {
        acc = new Account()
        acc.wallet = accountId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
    }

    var ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        return
    } else {
        ab = new AssetBalance()
        ab.account = acc
        ab.assetId = "Ztg"
        ab.balance = new BN(amount.toNumber())
    }
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AssetBalance>(ab)

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.balance = ab.balance 
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}

export async function balancesTransfer({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [fromId, toId, amount] = new Balances.TransferEvent(event).params
    
    var fa = await store.get(Account, { where: { wallet: fromId.toString() } })
    if (!fa) {
        fa = new Account()
        fa.wallet = fromId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
    }

    var faAB = await store.get(AssetBalance, { where: { account: fa, assetId: "Ztg" } })
    if (faAB) {
        faAB.balance = faAB.balance.sub(amount)
    } else {
        faAB = new AssetBalance()
        faAB.account = fa
        faAB.assetId = "Ztg"
        faAB.balance = new BN(0 - amount.toNumber())
    }
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(faAB, null, 2)}`)
    await store.save<AssetBalance>(faAB)

    const faHAB = new HistoricalAssetBalance()
    faHAB.account = fa
    faHAB.event = event.method
    faHAB.assetId = faAB.assetId
    faHAB.balance = new BN(0 - amount.toNumber())
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

    const taAB = await store.get(AssetBalance, { where: { account: ta, assetId: "Ztg" } })
    if (!taAB) {
        return
    } else {
        const hab = await store.get(HistoricalAssetBalance, { where: 
            { account: ta, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            taAB.balance = taAB.balance.add(amount)
            console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(taAB, null, 2)}`)
            await store.save<AssetBalance>(taAB)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab) 
            return  
        }
    }

    const taHAB = new HistoricalAssetBalance()
    taHAB.account = ta
    taHAB.event = event.method
    taHAB.assetId = taAB.assetId
    taHAB.balance = new BN(amount)
    taHAB.blockNumber = block.height
    taHAB.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(taHAB, null, 2)}`)
    await store.save<HistoricalAssetBalance>(taHAB)
}

export async function balancesBalanceSet({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId, famount, ramount] = new Balances.BalanceSetEvent(event).params
    
    var acc = await store.get(Account, { where: { wallet: accountId.toString() } })
    if (!acc) {
        acc = new Account()
        acc.wallet = accountId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
    }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (!ab) {
        return
    } else {
        const hab = await store.get(HistoricalAssetBalance, { where: 
            { account: acc, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            ab.balance = new BN(famount)
            console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AssetBalance>(ab)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab) 
            return  
        }
    }

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.balance = new BN(famount)
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}

export async function tokensEndowed({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [currencyId, accountId, amount] = new Tokens.EndowedEvent(event).params
    
    var acc = await store.get(Account, { where: { wallet: accountId.toString() } })
    if (!acc) {
        acc = new Account()
        acc.wallet = accountId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
    }

    var ab = await store.get(AssetBalance, { where: { account: acc, assetId: currencyId.toString() } })
    if (ab) {
        return
    } else {
        ab = new AssetBalance()
        ab.account = acc
        ab.assetId = currencyId.toString()
        ab.balance = new BN(amount.toNumber())
    }
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AssetBalance>(ab)

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.balance = ab.balance 
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}

export async function currencyTransferred({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [currencyId, fromId, toId, amount] = new Currency.TransferredEvent(event).params
    if (currencyId.toString() === "Ztg") { return }
    
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
    faHAB.balance = new BN(0 - amount.toNumber())
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

    const taAB = await store.get(AssetBalance, { where: { account: ta, assetId: currencyId.toString() } })
    if (!taAB) {
        return
    } else {
        const hab = await store.get(HistoricalAssetBalance, { where: 
            { account: ta, assetId: currencyId.toString(), event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            taAB.balance = taAB.balance.add(amount)
            console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(taAB, null, 2)}`)
            await store.save<AssetBalance>(taAB)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab) 
            return  
        }
    }

    const taHAB = new HistoricalAssetBalance()
    taHAB.account = ta
    taHAB.event = event.method
    taHAB.assetId = taAB.assetId
    taHAB.balance = new BN(amount)
    taHAB.blockNumber = block.height
    taHAB.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(taHAB, null, 2)}`)
    await store.save<HistoricalAssetBalance>(taHAB)
}

export async function currencyDeposited({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [currencyId, accountId, amount] = new Currency.DepositedEvent(event).params
    
    var acc = await store.get(Account, { where: { wallet: accountId.toString() } })
    if (!acc) {
        acc = new Account()
        acc.wallet = accountId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
    }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: currencyId.toString() } })
    if (!ab) {
        return
    } else {
        const hab = await store.get(HistoricalAssetBalance, { where: 
            { account: acc, assetId: currencyId.toString(), event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            ab.balance = ab.balance.add(amount)
            console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AssetBalance>(ab)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab) 
            return  
        }
    }

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.balance = new BN(amount)
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}

export async function currencyWithdrawn({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [currencyId, accountId, amount] = new Currency.WithdrawnEvent(event).params
    
    var acc = await store.get(Account, { where: { wallet: accountId.toString() } })
    if (!acc) {
        acc = new Account()
        acc.wallet = accountId.toString()

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
    }

    var ab = await store.get(AssetBalance, { where: { account: acc, assetId: currencyId.toString() } })
    if (!ab) {
        ab = new AssetBalance()
        ab.assetId = currencyId.toString()
        ab.balance = new BN(0 - amount.toNumber())
    } else {
        ab.balance = ab.balance.sub(amount)
    }
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AssetBalance>(ab)

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.balance = new BN(0 - amount.toNumber())
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}