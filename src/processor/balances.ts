import * as ss58 from "@subsquid/ss58"
import { EventHandlerContext, Store, SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from "@subsquid/substrate-processor"
import { Cache, Tools } from "./util"
import { Account, AccountBalance, HistoricalAccountBalance } from "../model"
import { BalancesBalanceSetEvent, BalancesDustLostEvent, BalancesEndowedEvent, BalancesReservedEvent, BalancesTransferEvent, BalancesUnreservedEvent, CurrencyDepositedEvent, CurrencyTransferredEvent, CurrencyWithdrawnEvent, SystemExtrinsicFailedEvent, SystemExtrinsicSuccessEvent, SystemNewAccountEvent, TokensEndowedEvent } from "../types/events"
import { AccountInfo } from "@polkadot/types/interfaces/system";
import { Asset } from "../types/v32"
import { util } from "@zeitgeistpm/sdk"
import { AssetId } from "@zeitgeistpm/sdk/dist/types"

export async function balancesEndowed(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {accountId, amount} = getBalancesEndowedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }
    
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab && ab.balance === BigInt(0)) {
        ab.balance = ab.balance + amount
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + walletId.substring(walletId.length - 5)
        hab.accountId = acc.wallet
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = amount
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    }
}

export async function balancesDustLost(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { accountId, amount } = getDustLostEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) { return }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (!ab) { return }

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + walletId.substring(walletId.length - 5)
    hab.accountId = acc.wallet
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = amount
    hab.balance = BigInt(0)
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

export async function balancesTransfer(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {fromId, toId, amount} = getTransferEvent(ctx)

    const fromWId = ss58.codec('zeitgeist').encode(fromId)
    const toWId = ss58.codec('zeitgeist').encode(toId)
    
    var fa = await store.get(Account, { where: { wallet: fromWId } })
    if (!fa) {
        fa = new Account()
        fa.id = event.id + fromWId.substring(fromWId.length - 5)
        fa.wallet = fromWId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
        await initBalance(fa, store, event, block)
    }

    var faAB = await store.get(AccountBalance, { where: { account: fa, assetId: "Ztg" } })
    if (faAB) {
        faAB.balance = faAB.balance - amount
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
        await store.save<AccountBalance>(faAB)

        const faHAB = new HistoricalAccountBalance()
        faHAB.id = event.id + fromWId.substring(fromWId.length - 5)
        faHAB.accountId = fa.wallet
        faHAB.event = event.method
        faHAB.assetId = faAB.assetId
        faHAB.amount = - amount
        faHAB.balance = faAB.balance
        faHAB.blockNumber = block.height
        faHAB.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
        await store.save<HistoricalAccountBalance>(faHAB)
    } 
    
    var ta = await store.get(Account, { where: { wallet: toWId } })
    if (!ta) {
        ta = new Account()
        ta.id = event.id + toWId.substring(toWId.length - 5)
        ta.wallet = toWId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
        await initBalance(ta, store, event, block)
    }

    const taAB = await store.get(AccountBalance, { where: { account: ta, assetId: "Ztg" } })
    if (taAB) {
        const hab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: ta.wallet, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            taAB.balance = taAB.balance + amount
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
            await store.save<AccountBalance>(taAB)

            const taHAB = new HistoricalAccountBalance()
            taHAB.id = event.id + toWId.substring(toWId.length - 5)
            taHAB.accountId = ta.wallet
            taHAB.event = event.method
            taHAB.assetId = taAB.assetId
            taHAB.amount = amount
            taHAB.balance = taAB.balance
            taHAB.blockNumber = block.height
            taHAB.timestamp = new Date(block.timestamp)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(taHAB, null, 2)}`)
            await store.save<HistoricalAccountBalance>(taHAB)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab) 
            return  
        }
    }
}

export async function balancesBalanceSet(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { accountId, amount } = getBalanceSetEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        const hab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: acc.wallet, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            ab.balance = amount
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AccountBalance>(ab)

            const hab = new HistoricalAccountBalance()
            hab.id = event.id + walletId.substring(walletId.length - 5)
            hab.accountId = acc.wallet
            hab.event = event.method
            hab.assetId = ab.assetId
            hab.amount = amount
            hab.balance = ab.balance
            hab.blockNumber = block.height
            hab.timestamp = new Date(block.timestamp)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab)
        } else {
            hab.event = hab.event.concat(event.method)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab) 
            return  
        }
    }
}

export async function balancesReserved(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { accountId, amount } = getReservedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance - amount
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + walletId.substring(walletId.length - 5)
        hab.accountId = acc.wallet
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = - amount
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    }
}

export async function balancesUnreserved(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { accountId, amount } = getUnreservedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance + amount
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + walletId.substring(walletId.length - 5)
        hab.accountId = acc.wallet
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = amount
        hab.balance = ab.balance
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    }
}

export async function tokensEndowed(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, accountId, amount } = getTokensEndowedEvent(ctx)!
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    var ab = await store.get(AccountBalance, { where: { account: acc, assetId: assetId } })
    if (ab) { return } 
    ab = new AccountBalance()
    ab.id = event.id + walletId.substring(walletId.length - 5)
    ab.account = acc
    ab.assetId = assetId
    ab.balance = amount
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + walletId.substring(walletId.length - 5)
    hab.accountId = acc.wallet
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = amount
    hab.balance = ab.balance 
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

export async function currencyTransferred(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, fromId, toId, amount } = getTransferredEvent(ctx)
    if (assetId === "Ztg") { return }

    const fromWId = ss58.codec('zeitgeist').encode(fromId)
    const toWId = ss58.codec('zeitgeist').encode(toId)

    var fa = await store.get(Account, { where: { wallet: fromWId } })
    if (!fa) {
        fa = new Account()
        fa.id = event.id + fromWId.substring(fromWId.length - 5)
        fa.wallet = fromWId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
        await initBalance(fa, store, event, block)
    }

    var faAB = await store.get(AccountBalance, { where: { account: fa, assetId: assetId } })
    if (faAB) {
        faAB.balance = faAB.balance - amount
    } else {
        faAB = new AccountBalance()
        faAB.id = event.id + fromWId.substring(fromWId.length - 5)
        faAB.account = fa
        faAB.assetId = assetId
        faAB.balance = - amount
    }
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
    await store.save<AccountBalance>(faAB)

    const faHAB = new HistoricalAccountBalance()
    faHAB.id = event.id + fromWId.substring(fromWId.length - 5)
    faHAB.accountId = fa.wallet
    faHAB.event = event.method
    faHAB.assetId = faAB.assetId
    faHAB.amount = - amount
    faHAB.balance = faAB.balance
    faHAB.blockNumber = block.height
    faHAB.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAccountBalance>(faHAB)

    var ta = await store.get(Account, { where: { wallet: toWId } })
    if (!ta) {
        ta = new Account()
        ta.id = event.id + toWId.substring(toWId.length - 5)
        ta.wallet = toWId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
        await initBalance(ta, store, event, block)
    }

    const taAB = await store.get(AccountBalance, { where: { account: ta, assetId: assetId } })
    if (!taAB) { return }

    const hab = await store.get(HistoricalAccountBalance, { where: 
        { accountId: ta.wallet, assetId: assetId, event: "Endowed", blockNumber: block.height } })
    if (!hab) {
        taAB.balance = taAB.balance + amount
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
        await store.save<AccountBalance>(taAB)
    } else {
        hab.event = hab.event.concat(event.method)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab) 
        return  
    }

    const taHAB = new HistoricalAccountBalance()
    taHAB.id = event.id + toWId.substring(toWId.length - 5)
    taHAB.accountId = ta.wallet
    taHAB.event = event.method
    taHAB.assetId = taAB.assetId
    taHAB.amount = amount
    taHAB.balance = taAB.balance
    taHAB.blockNumber = block.height
    taHAB.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(taHAB, null, 2)}`)
    await store.save<HistoricalAccountBalance>(taHAB)
}

export async function currencyDeposited(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, accountId, amount } = getDepositedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: assetId} })
    if (!ab) { return }

    const ehab = await store.get(HistoricalAccountBalance, { where: 
        { accountId: acc.wallet, assetId: assetId, event: "Endowed", blockNumber: block.height } })
    if (!ehab) {
        ab.balance = ab.balance + amount
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)
    } else {
        ehab.event = ehab.event.concat(event.method)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(ehab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(ehab) 
        return  
    }

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + walletId.substring(walletId.length - 5)
    hab.accountId = acc.wallet
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = amount
    hab.balance = ab.balance
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

export async function currencyWithdrawn(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, accountId, amount } = getWithdrawnEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    var ab = await store.get(AccountBalance, { where: { account: acc, assetId: assetId } })
    if (!ab) {
        ab = new AccountBalance()
        ab.id = event.id + walletId.substring(walletId.length - 5)
        ab.account = acc
        ab.assetId = assetId
        ab.balance = - amount
    } else {
        ab.balance = ab.balance - amount
    }
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + walletId.substring(walletId.length - 5)
    hab.accountId = acc.wallet
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = - amount
    hab.balance = ab.balance
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

export async function systemNewAccount(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { accountId } = getNewAccountEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const acc = await store.get(Account, { where: { wallet: walletId } })
    if (acc) return
    const newAcc = new Account()
    newAcc.id = event.id + walletId.substring(walletId.length - 5)
    newAcc.wallet = walletId
    console.log(`[${event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`)
    await store.save<Account>(newAcc)

    const ab = new AccountBalance()
    ab.id = event.id + walletId.substring(walletId.length - 5)
    ab.account = newAcc
    ab.assetId = "Ztg"
    ab.balance = BigInt(0)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + walletId.substring(walletId.length - 5)
    hab.accountId = newAcc.wallet
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.amount = BigInt(0)
    hab.balance = ab.balance
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

export async function systemExtrinsicSuccess(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { info } = getExtrinsicSuccessEvent(ctx)
    if (!extrinsic || (+extrinsic.signature! == 0) || info.paysFee.isNo ) { return }

    if (extrinsic.era) {
        const era = extrinsic.era as any
        if (era["immortalEra"]) return
    }

    const walletId = extrinsic.signer
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const txnFees = await getFees(block, extrinsic) 
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance - txnFees
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + walletId.substring(walletId.length - 5)
        hab.accountId = acc.wallet
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = - txnFees
        hab.balance = ab.balance 
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)

        const dhab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: acc.wallet, assetId: "Ztg", event: "DustLost", blockNumber: block.height } })
        if (dhab) {
            ab.balance = ab.balance - dhab.amount
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AccountBalance>(ab)

            const hab = new HistoricalAccountBalance()
            hab.id = event.id + walletId.substring(walletId.length - 5)
            hab.accountId = acc.wallet
            hab.event = dhab.event
            hab.assetId = ab.assetId
            hab.amount = - dhab.amount
            hab.balance = ab.balance
            hab.blockNumber = block.height
            hab.timestamp = new Date(block.timestamp)
            console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
            await store.save<HistoricalAccountBalance>(hab)

            console.log(`[${event.name}] Removing historical asset balance: ${JSON.stringify(dhab, null, 2)}`)
            await store.remove<HistoricalAccountBalance>(dhab)
        }
    }
}

export async function systemExtrinsicFailed(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { info } = getExtrinsicFailedEvent(ctx)
    if (info.paysFee.isNo || !extrinsic) { return }

    const walletId = extrinsic.signer
    var acc = await store.get(Account, { where: { wallet: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + walletId.substring(walletId.length - 5)
        acc.wallet = walletId
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const txnFees = await getFees(block, extrinsic) 
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance - txnFees
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + walletId.substring(walletId.length - 5)
        hab.accountId = acc.wallet
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.amount = - txnFees
        hab.balance = ab.balance 
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    } 
}

interface BalEndowedEvent {
    accountId: Uint8Array
    amount: bigint
}

interface DustLostEvent {
    accountId: Uint8Array
    amount: bigint
}

interface TransferEvent {
    fromId: Uint8Array
    toId: Uint8Array
    amount: bigint
}

interface BalanceSetEvent {
    accountId: Uint8Array
    amount: bigint
}

interface ReservedEvent {
    accountId: Uint8Array
    amount: bigint
}

interface UnreservedEvent {
    accountId: Uint8Array
    amount: bigint
}

interface TokEndowedEvent {
    assetId: string
    accountId: Uint8Array
    amount: bigint
}

interface TransferredEvent {
    assetId: string
    fromId: Uint8Array
    toId: Uint8Array
    amount: bigint
}

interface DepositedEvent {
    assetId: string
    accountId: Uint8Array
    amount: bigint
}

interface WithdrawnEvent {
    assetId: string
    accountId: Uint8Array
    amount: bigint
}

interface NewAccountEvent {
    accountId: Uint8Array
}

interface ExtrinsicEvent {
    info: any
}

function getBalancesEndowedEvent(ctx: EventHandlerContext): BalEndowedEvent {
    const event = new BalancesEndowedEvent(ctx)
    const [accountId, amount] = event.asLatest
    return {accountId, amount}
}

function getDustLostEvent(ctx: EventHandlerContext): DustLostEvent {
    const event = new BalancesDustLostEvent(ctx)
    const [accountId, amount] = event.asLatest
    return {accountId, amount}
}

function getTransferEvent(ctx: EventHandlerContext): TransferEvent {
    const event = new BalancesTransferEvent(ctx)
    const [fromId, toId, amount] = event.asLatest
    return {fromId, toId, amount}
}

function getBalanceSetEvent(ctx: EventHandlerContext): BalanceSetEvent {
    const event = new BalancesBalanceSetEvent(ctx)
    const [accountId, amount] = event.asLatest
    return {accountId, amount}
}

function getReservedEvent(ctx: EventHandlerContext): ReservedEvent {
    const event = new BalancesReservedEvent(ctx)
    const [accountId, amount] = event.asLatest
    return {accountId, amount}
}

function getUnreservedEvent(ctx: EventHandlerContext): UnreservedEvent {
    const event = new BalancesUnreservedEvent(ctx)
    const [accountId, amount] = event.asLatest
    return {accountId, amount}
}

function getTokensEndowedEvent(ctx: EventHandlerContext): TokEndowedEvent {
    const event = new TokensEndowedEvent(ctx)
    var currencyId, accountId, amount
    if (event.isV23) {
        [currencyId, accountId, amount] = event.asV23
    } else if (event.isV32) {
        [currencyId, accountId, amount] = event.asV32
    } else {
        [currencyId, accountId, amount] = event.asLatest
    }

    if (currencyId.__kind  == "CategoricalOutcome" || currencyId.__kind  == "ScalarOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, accountId, amount}
    } else if (currencyId.__kind == "Ztg") {
        const assetId = "Ztg"
        return {assetId, accountId, amount}
    } else if (currencyId.__kind == "PoolShare") {
        const assetId = JSON.stringify(util.AssetIdFromString("pool" + currencyId.value.toString()))
        return {assetId, accountId, amount}
    } else {
        const assetId = ''
        return {assetId, accountId, amount}
    }
}

function getTransferredEvent(ctx: EventHandlerContext): TransferredEvent {
    const event = new CurrencyTransferredEvent(ctx)
    var currencyId, fromId, toId, amount
    if (event.isV23) {
        [currencyId, fromId, toId, amount] = event.asV23
    } else if (event.isV32) {
        [currencyId, fromId, toId, amount] = event.asV32
    } else {
        [currencyId, fromId, toId, amount] = event.asLatest
    }

    if (currencyId.__kind  == "CategoricalOutcome" || currencyId.__kind  == "ScalarOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, fromId, toId, amount}
    } else if (currencyId.__kind == "Ztg") {
        const assetId = "Ztg"
        return {assetId, fromId, toId, amount}
    } else if (currencyId.__kind == "PoolShare") {
        const assetId = JSON.stringify(util.AssetIdFromString("pool" + currencyId.value.toString()))
        return {assetId, fromId, toId, amount}
    } else {
        const assetId = ''
        return {assetId, fromId, toId, amount}
    }
}

function getDepositedEvent(ctx: EventHandlerContext): DepositedEvent {
    const event = new CurrencyDepositedEvent(ctx)
    var currencyId, accountId, amount
    if (event.isV23) {
        [currencyId, accountId, amount] = event.asV23
    } else if (event.isV32) {
        [currencyId, accountId, amount] = event.asV32
    } else {
        [currencyId, accountId, amount] = event.asLatest
    }

    if (currencyId.__kind  == "CategoricalOutcome" || currencyId.__kind  == "ScalarOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, accountId, amount}
    } else if (currencyId.__kind == "Ztg") {
        const assetId = "Ztg"
        return {assetId, accountId, amount}
    } else if (currencyId.__kind == "PoolShare") {
        const assetId = JSON.stringify(util.AssetIdFromString("pool" + currencyId.value.toString()))
        return {assetId, accountId, amount}
    } else {
        const assetId = ''
        return {assetId, accountId, amount}
    }
}

function getWithdrawnEvent(ctx: EventHandlerContext): WithdrawnEvent {
    const event = new CurrencyWithdrawnEvent(ctx)
    var currencyId, accountId, amount
    if (event.isV23) {
        [currencyId, accountId, amount] = event.asV23
    } else if (event.isV32) {
        [currencyId, accountId, amount] = event.asV32
    } else {
        [currencyId, accountId, amount] = event.asLatest
    }

    if (currencyId.__kind  == "CategoricalOutcome" || currencyId.__kind  == "ScalarOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, accountId, amount}
    } else if (currencyId.__kind == "Ztg") {
        const assetId = "Ztg"
        return {assetId, accountId, amount}
    } else if (currencyId.__kind == "PoolShare") {
        const assetId = JSON.stringify(util.AssetIdFromString("pool" + currencyId.value.toString()))
        return {assetId, accountId, amount}
    } else {
        const assetId = ''
        return {assetId, accountId, amount}
    }
}

function getNewAccountEvent(ctx: EventHandlerContext): NewAccountEvent {
    const event = new SystemNewAccountEvent(ctx)
    const accountId = event.asLatest
    return {accountId}
}

function getExtrinsicSuccessEvent(ctx: EventHandlerContext): ExtrinsicEvent {
    const event = new SystemExtrinsicSuccessEvent(ctx)
    const info = event.asLatest
    return {info}
}

function getExtrinsicFailedEvent(ctx: EventHandlerContext): ExtrinsicEvent {
    const event = new SystemExtrinsicFailedEvent(ctx)
    if (event.isV23) {
        const [error, info]  = event.asV23
        return {info}
    } else if (event.isV32) {
        const [error, info]  = event.asV32
        return {info}
    } else {
        const [error, info]  = event.asLatest 
        return {info}
    }
}

async function initBalance(acc: Account, store: Store, event: SubstrateEvent, block: SubstrateBlock) {
    const sdk = await Tools.getSDK()
    const blockZero = process.env.BLOCK_ZERO!
    const { data : { free: amt } } = await sdk.api.query.system.account.at(blockZero, acc.wallet) as AccountInfo

    const ab = new AccountBalance()
    ab.id = event.id + acc.wallet.substring(acc.wallet.length - 5)
    ab.account = acc
    ab.assetId = "Ztg"
    ab.balance = amt.toBigInt()
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    const hab = new HistoricalAccountBalance()
    hab.id = "00000-" + acc.wallet.substring(acc.wallet.length - 5)
    hab.accountId = acc.wallet
    hab.event = "Initialised"
    hab.assetId = ab.assetId
    hab.amount = amt.toBigInt()
    hab.balance = ab.balance 
    hab.blockNumber = 0
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

async function getFees(block: SubstrateBlock, extrinsic: SubstrateExtrinsic): Promise<bigint> {
    const id = +extrinsic.id.substring(extrinsic.id.indexOf('-')+1, extrinsic.id.lastIndexOf('-'))!
    var fees = await (await Cache.init()).getFee(block.hash+id)
    if (fees) { return BigInt(fees) }

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
    return totalFees
}