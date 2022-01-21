import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext, SubstrateBlock, SubstrateExtrinsic, SubstrateEvent } from '@subsquid/hydra-common'
import { Currency } from '../chain/currency'
import { Account } from '../generated/modules/account/account.model'
import { AssetBalance } from '../generated/modules/asset-balance/asset-balance.model'
import { HistoricalAssetBalance } from '../generated/modules/historical-asset-balance/historical-asset-balance.model'
import { Balances, System, Tokens } from '../chain'
import { encodeAddress } from '@polkadot/keyring'
import { Cache, Tools } from './util'

export async function balancesEndowed({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId, amount] = new Balances.EndowedEvent(event).params
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab && new BN(ab.balance).eq(new BN(0))) {
        ab.balance = ab.balance.add(new BN(amount.toNumber()))
        console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AssetBalance>(ab)

        const hab = new HistoricalAssetBalance()
        hab.account = acc
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = new BN(amount)
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = new BN(block.timestamp)
        console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAssetBalance>(hab)
    }
}

export async function balancesDustLost({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId, amount] = new Balances.DustLostEvent(event).params
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    const acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) { return }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (!ab) { return }

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = new BN(amount)
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
    
    const fromWId = encodeAddress(fromId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    const toWId = encodeAddress(toId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var fa = await store.get(Account, { where: { wallet: fromWId } })
    if (!fa) {
        fa = new Account()
        fa.wallet = fromWId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
        await initBalance(fa, fromWId, store, event, block)
    }

    var faAB = await store.get(AssetBalance, { where: { account: fa, assetId: "Ztg" } })
    if (faAB) {
        const hab = await store.get(HistoricalAssetBalance, { where: 
            { account: fa, assetId: "Ztg", event: "DustLost", blockNumber: block.height } })
        if (hab) {
            faAB.balance = faAB.balance.sub(amount)
            console.log(`[${event.method}] Removing asset balance: ${JSON.stringify(faAB, null, 2)}`)
            await store.remove<AssetBalance>(faAB)

            const faHAB = new HistoricalAssetBalance()
            faHAB.account = fa
            faHAB.event = hab.event
            faHAB.assetId = hab.assetId
            faHAB.amount = hab.amount
            faHAB.balance = new BN(0)
            faHAB.blockNumber = block.height
            faHAB.timestamp = new BN(block.timestamp)

            hab.event = event.method
            hab.amount = new BN(0 - amount.toNumber())
            hab.balance = faAB.balance
            console.log(`[${event.method}] Updating historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab)

            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(faHAB, null, 2)}`)
            await store.save<HistoricalAssetBalance>(faHAB)

            return
        } else {
            faAB.balance = faAB.balance.sub(amount)
        }
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
    faHAB.amount = new BN(0 - amount.toNumber())
    faHAB.balance = faAB.balance
    faHAB.blockNumber = block.height
    faHAB.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAssetBalance>(faHAB)

    var ta = await store.get(Account, { where: { wallet: toWId } })
    if (!ta) {
        ta = new Account()
        ta.wallet = toWId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
        await initBalance(ta, toWId, store, event, block)
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
    taHAB.amount = new BN(amount)
    taHAB.balance = taAB.balance
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
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        const hab = await store.get(HistoricalAssetBalance, { where: 
            { account: acc, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            ab.balance = new BN(famount)
            console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AssetBalance>(ab)

            const hab = new HistoricalAssetBalance()
            hab.account = acc
            hab.event = event.method
            hab.assetId = ab.assetId
            hab.amount = new BN(famount)
            hab.balance = ab.balance
            hab.blockNumber = block.height
            hab.timestamp = new BN(block.timestamp)
            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAssetBalance>(hab) 
            return  
        }
    }
}

export async function balancesReserved({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId, amount] = new Balances.ReservedEvent(event).params
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance.sub(amount)
        console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AssetBalance>(ab)

        const hab = new HistoricalAssetBalance()
        hab.account = acc
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = new BN(0 - amount.toNumber())
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = new BN(block.timestamp)
        console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAssetBalance>(hab)
    }
}

export async function balancesUnreserved({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId, amount] = new Balances.UnreservedEvent(event).params
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance.add(amount)
        console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AssetBalance>(ab)

        const hab = new HistoricalAssetBalance()
        hab.account = acc
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = new BN(amount)
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = new BN(block.timestamp)
        console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAssetBalance>(hab)
    }
}

export async function tokensEndowed({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [currencyId, accountId, amount] = new Tokens.EndowedEvent(event).params
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
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
    hab.amount = new BN(amount)
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

    const fromWId = encodeAddress(fromId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    const toWId = encodeAddress(toId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var fa = await store.get(Account, { where: { wallet: fromWId } })
    if (!fa) {
        fa = new Account()
        fa.wallet = fromWId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
        await initBalance(fa, fromWId, store, event, block)
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
    faHAB.amount = new BN(0 - amount.toNumber())
    faHAB.balance = faAB.balance
    faHAB.blockNumber = block.height
    faHAB.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAssetBalance>(faHAB)

    var ta = await store.get(Account, { where: { wallet: toWId } })
    if (!ta) {
        ta = new Account()
        ta.wallet = toWId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
        await initBalance(ta, toWId, store, event, block)
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
    taHAB.amount = new BN(amount)
    taHAB.balance = taAB.balance
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
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
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
    hab.amount = new BN(amount)
    hab.balance = ab.balance
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
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId

        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    var ab = await store.get(AssetBalance, { where: { account: acc, assetId: currencyId.toString() } })
    if (!ab) {
        ab = new AssetBalance()
        ab.account = acc
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
    hab.amount = new BN(0 - amount.toNumber())
    hab.balance = ab.balance
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)

    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}

export async function systemNewAccount({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [accountId] = new System.NewAccountEvent(event).params
    const walletId = encodeAddress(accountId, (await Tools.getSDK()).api.consts.system.ss58Prefix.toNumber())
    
    const acc = new Account()
    acc.wallet = walletId
    console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    const ab = new AssetBalance()
    ab.account = acc
    ab.assetId = "Ztg"
    ab.balance = new BN(0)
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AssetBalance>(ab)

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = new BN(0)
    hab.balance = ab.balance
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)
    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}

export async function systemExtrinsicSuccess({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [info] = new System.ExtrinsicSuccessEvent(event).params
    if (!extrinsic || (+extrinsic.signature! == 0) || info.paysFee.isNo ) { 
        return 
    }

    const walletId = extrinsic.signer
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    const txnFees = await getFees(block, extrinsic) 
    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance.sub(new BN(txnFees))
        console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AssetBalance>(ab)

        const hab = new HistoricalAssetBalance()
        hab.account = acc
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = new BN(0 - txnFees)
        hab.balance = ab.balance 
        hab.blockNumber = block.height
        hab.timestamp = new BN(block.timestamp)
        console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAssetBalance>(hab)
    }
}

export async function systemExtrinsicFailed({
    store,
    event,
    block,
    extrinsic,
}: EventContext & StoreContext) {

    const [error, info] = new System.ExtrinsicFailedEvent(event).params
    if (info.paysFee.isNo || !extrinsic) { 
        return 
    }

    const walletId = extrinsic.signer
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.wallet = walletId
        console.log(`[${event.method}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, walletId, store, event, block)
    }

    const txnFees = await getFees(block, extrinsic) 
    const ab = await store.get(AssetBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance.sub(new BN(txnFees))
        console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AssetBalance>(ab)

        const hab = new HistoricalAssetBalance()
        hab.account = acc
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = new BN(0 - txnFees)
        hab.balance = ab.balance 
        hab.blockNumber = block.height
        hab.timestamp = new BN(block.timestamp)
        console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAssetBalance>(hab)
    } 
}

async function getFees(block: SubstrateBlock, extrinsic: SubstrateExtrinsic): Promise<number> {
    const id = +extrinsic.id.substring(extrinsic.id.indexOf('-')+1, extrinsic.id.lastIndexOf('-'))!
    var fees = await (await Cache.init()).getFee(block.hash+id)
    if (fees) { return +fees }

    var totalFees = BigInt(0)
    const sdk = await Tools.getSDK()
    const { block: blk } = await sdk.api.rpc.chain.getBlock(block.hash)
    fees = JSON.stringify(await sdk.api.rpc.payment.queryFeeDetails(blk.extrinsics[id].toHex(), block.hash))
    if (fees) {
        const feesFormatted = JSON.parse(fees)
        const inclusionFee = feesFormatted.inclusionFee
        const baseFee = inclusionFee.baseFee
        const lenFee = inclusionFee.lenFee
        const adjustedWeightFee = inclusionFee.adjustedWeightFee
        const tip = extrinsic.tip.valueOf()
        if (inclusionFee) {
            if (baseFee) totalFees = totalFees + BigInt(baseFee)
            if (lenFee) totalFees = totalFees + BigInt(lenFee)
            if (adjustedWeightFee) totalFees = totalFees + BigInt(adjustedWeightFee)
            if (tip) totalFees = totalFees + BigInt(tip)
        }
    }
    await (await Cache.init()).setFee(block.hash+id, totalFees.toString())
    return +totalFees.toString()
}

async function initBalance(acc: Account, walletId: string, store: DatabaseManager, event: SubstrateEvent, block: SubstrateBlock) {
    const sdk = await Tools.getSDK()
    const blockZero = `0xb90cd3a37b4793c6494b78962986f4f6ed3ec2eda91a6b84fd8457d24f606b9c`
    const { data : { free: amt } } = await sdk.api.query.system.account.at(blockZero, walletId)

    const ab = new AssetBalance()
    ab.account = acc
    ab.assetId = "Ztg"
    ab.balance = new BN(amt)
    console.log(`[${event.method}] Saving asset balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AssetBalance>(ab)

    const hab = new HistoricalAssetBalance()
    hab.account = acc
    hab.event = "Initialised"
    hab.assetId = ab.assetId
    hab.amount = new BN(amt)
    hab.balance = ab.balance 
    hab.blockNumber = block.height
    hab.timestamp = new BN(block.timestamp)
    console.log(`[${event.method}] Saving historical asset balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAssetBalance>(hab)
}