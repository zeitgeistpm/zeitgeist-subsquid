import * as ss58 from "@subsquid/ss58"
import { EventHandlerContext, Store, SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from "@subsquid/substrate-processor"
import { Cache, Tools } from "./util"
import { Account, AccountBalance, Asset, HistoricalAccountBalance } from "../model"
import { BalancesBalanceSetEvent, BalancesDustLostEvent, BalancesEndowedEvent, BalancesReservedEvent, BalancesTransferEvent, 
    BalancesUnreservedEvent, CurrencyDepositedEvent, CurrencyTransferredEvent, CurrencyWithdrawnEvent, SystemExtrinsicFailedEvent, 
    SystemExtrinsicSuccessEvent, SystemNewAccountEvent, TokensEndowedEvent } from "../types/events"
import { AccountInfo } from "@polkadot/types/interfaces/system";
import { util } from "@zeitgeistpm/sdk"

export async function parachainStakingRewarded(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { walletId, amount } = getRewardedEvent(ctx)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance + BigInt(amount)
        ab.value = Number(ab.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        acc.pvalue = Number(acc.pvalue) + Number(amount)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.dBalance = BigInt(amount)
        hab.balance = ab.balance
        hab.dValue = Number(hab.dBalance)
        hab.value = Number(hab.balance)
        hab.pvalue = acc.pvalue
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    }
}

export async function systemNewAccount(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { accountId } = getNewAccountEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    const acc = await store.get(Account, { where: { accountId: walletId } })
    if (acc) return
    const newAcc = new Account()
    newAcc.id = event.id + '-' + walletId.substring(walletId.length - 5)
    newAcc.accountId = walletId
    newAcc.pvalue = 0
    console.log(`[${event.name}] Saving account: ${JSON.stringify(newAcc, null, 2)}`)
    await store.save<Account>(newAcc)

    const ab = new AccountBalance()
    ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    ab.account = newAcc
    ab.assetId = "Ztg"
    ab.balance = BigInt(0)
    ab.value = Number(ab.balance)
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = newAcc.accountId
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.dBalance = BigInt(0)
    hab.balance = ab.balance
    hab.dValue = Number(hab.dBalance)
    hab.value = Number(hab.balance)
    hab.pvalue = 0
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
    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const txnFees = await getFees(block, extrinsic) 
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance - txnFees
        ab.value = Number(ab.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        acc.pvalue = Number(acc.pvalue) - Number(txnFees)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.dBalance = - txnFees
        hab.balance = ab.balance
        hab.dValue = Number(hab.dBalance)
        hab.value = Number(hab.balance)
        hab.pvalue = acc.pvalue
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)

        const dhab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: acc.accountId, assetId: "Ztg", event: "DustLost", blockNumber: block.height } })
        if (dhab) {
            ab.balance = ab.balance - dhab.dBalance
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AccountBalance>(ab)

            acc.pvalue = Number(acc.pvalue) - Number(dhab.dBalance)
            console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
            await store.save<Account>(acc)

            const hab = new HistoricalAccountBalance()
            hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
            hab.accountId = acc.accountId
            hab.event = dhab.event
            hab.assetId = ab.assetId
            hab.dBalance = - dhab.dBalance
            hab.balance = ab.balance
            hab.dValue = Number(hab.dBalance)
            hab.value = Number(hab.balance)
            hab.pvalue = acc.pvalue
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
    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const txnFees = await getFees(block, extrinsic) 
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance - txnFees
        ab.value = Number(ab.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        acc.pvalue = Number(acc.pvalue) - Number(txnFees)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.dBalance = - txnFees
        hab.balance = ab.balance
        hab.dValue = Number(hab.dBalance)
        hab.value = Number(hab.balance)
        hab.pvalue = acc.pvalue
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    } 
}

export async function balancesEndowed(ctx: EventHandlerContext) {
    const {store, event, block, extrinsic} = ctx
    const {accountId, amount} = getBalancesEndowedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }
    
    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab && ab.balance === BigInt(0)) {
        ab.balance = ab.balance + amount
        ab.value = Number(ab.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        acc.pvalue = Number(acc.pvalue) + Number(amount)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.dBalance = amount
        hab.balance = ab.balance
        hab.dValue = Number(hab.dBalance)
        hab.value = Number(hab.balance)
        hab.pvalue = acc.pvalue
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

    const acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) { return }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (!ab) { return }

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.dBalance = amount
    hab.balance = BigInt(0)
    hab.dValue = Number(hab.dBalance)
    hab.value = Number(hab.balance)
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
    
    var fa = await store.get(Account, { where: { accountId: fromWId } })
    if (!fa) {
        fa = new Account()
        fa.id = event.id + '-' + fromWId.substring(fromWId.length - 5)
        fa.accountId = fromWId
        fa.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
        await initBalance(fa, store, event, block)
    }

    var faAB = await store.get(AccountBalance, { where: { account: fa, assetId: "Ztg" } })
    if (faAB) {
        faAB.balance = faAB.balance - amount
        faAB.value = Number(faAB.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
        await store.save<AccountBalance>(faAB)

        fa.pvalue = Number(fa.pvalue) - Number(amount)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)

        const faHAB = new HistoricalAccountBalance()
        faHAB.id = event.id + '-' + fromWId.substring(fromWId.length - 5)
        faHAB.accountId = fa.accountId
        faHAB.event = event.method
        faHAB.assetId = faAB.assetId
        faHAB.dBalance = - amount
        faHAB.balance = faAB.balance
        faHAB.dValue = Number(faHAB.dBalance)
        faHAB.value = Number(faHAB.balance)
        faHAB.pvalue = fa.pvalue
        faHAB.blockNumber = block.height
        faHAB.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
        await store.save<HistoricalAccountBalance>(faHAB)
    } 
    
    var ta = await store.get(Account, { where: { accountId: toWId } })
    if (!ta) {
        ta = new Account()
        ta.id = event.id + '-' + toWId.substring(toWId.length - 5)
        ta.accountId = toWId
        ta.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
        await initBalance(ta, store, event, block)
    }

    const taAB = await store.get(AccountBalance, { where: { account: ta, assetId: "Ztg" } })
    if (taAB) {
        const hab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: ta.accountId, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            taAB.balance = taAB.balance + amount
            taAB.value = Number(taAB.balance)
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
            await store.save<AccountBalance>(taAB)

            ta.pvalue = Number(ta.pvalue) + Number(amount)
            console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
            await store.save<Account>(ta)

            const taHAB = new HistoricalAccountBalance()
            taHAB.id = event.id + '-' + toWId.substring(toWId.length - 5)
            taHAB.accountId = ta.accountId
            taHAB.event = event.method
            taHAB.assetId = taAB.assetId
            taHAB.dBalance = amount
            taHAB.balance = taAB.balance
            taHAB.dValue = Number(taHAB.dBalance)
            taHAB.value = Number(taHAB.balance)
            taHAB.pvalue = ta.pvalue
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

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        const hab = await store.get(HistoricalAccountBalance, { where: 
            { accountId: acc.accountId, assetId: "Ztg", event: "Endowed", blockNumber: block.height } })
        if (!hab) {
            ab.balance = amount
            ab.value = Number(ab.balance)
            console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
            await store.save<AccountBalance>(ab)

            acc.pvalue = Number(acc.pvalue) + Number(amount)
            console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
            await store.save<Account>(acc)

            const hab = new HistoricalAccountBalance()
            hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
            hab.accountId = acc.accountId
            hab.event = event.method
            hab.assetId = ab.assetId
            hab.dBalance = amount
            hab.balance = ab.balance
            hab.dValue = Number(hab.dBalance)
            hab.value = Number(hab.balance)
            hab.pvalue = acc.pvalue
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

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance - amount
        ab.value = Number(ab.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        acc.pvalue = Number(acc.pvalue) - Number(amount)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.dBalance = - amount
        hab.balance = ab.balance
        hab.dValue = Number(hab.dBalance)
        hab.value = Number(hab.balance)
        hab.pvalue = acc.pvalue
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

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
    if (ab) {
        ab.balance = ab.balance + amount
        ab.value = Number(ab.balance)
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)

        acc.pvalue = Number(acc.pvalue) + Number(amount)
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)

        const hab = new HistoricalAccountBalance()
        hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        hab.accountId = acc.accountId
        hab.event = event.method
        hab.assetId = ab.assetId
        hab.dBalance = amount
        hab.balance = ab.balance
        hab.dValue = Number(hab.dBalance)
        hab.value = Number(hab.balance)
        hab.pvalue = acc.pvalue
        hab.blockNumber = block.height
        hab.timestamp = new Date(block.timestamp)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab)
    }
}

export async function tokensEndowed(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, accountId, amount } = getTokensEndowedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const asset = await store.get(Asset, { where: { assetId: assetId } })

    var ab = await store.get(AccountBalance, { where: { account: acc, assetId: assetId } })
    if (ab) { return } 
    ab = new AccountBalance()
    ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    ab.account = acc
    ab.assetId = assetId
    ab.balance = amount
    ab.value = asset ? asset.price ? asset.price * Number(ab.balance) : 0 : null
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    acc.pvalue = ab.value ? acc.pvalue - 0 + ab.value! : acc.pvalue
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.dBalance = amount
    hab.balance = ab.balance
    hab.dValue = ab.value
    hab.value = ab.value
    hab.pvalue = acc.pvalue
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

    var fa = await store.get(Account, { where: { accountId: fromWId } })
    if (!fa) {
        fa = new Account()
        fa.id = event.id + '-' + fromWId.substring(fromWId.length - 5)
        fa.accountId = fromWId
        fa.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
        await store.save<Account>(fa)
        await initBalance(fa, store, event, block)
    }

    const asset = await store.get(Asset, { where: { assetId: assetId } })

    var faAB = await store.get(AccountBalance, { where: { account: fa, assetId: assetId } })
    var oldValue = 0
    if (faAB) {
        faAB.balance = faAB.balance - amount
        oldValue = faAB.value!
    } else {
        faAB = new AccountBalance()
        faAB.id = event.id + '-' + fromWId.substring(fromWId.length - 5)
        faAB.account = fa
        faAB.assetId = assetId
        faAB.balance = - amount
    }
    faAB.value = asset ? asset.price ? Number(faAB.balance) * asset.price : 0 : null
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(faAB, null, 2)}`)
    await store.save<AccountBalance>(faAB)

    fa.pvalue = faAB.value ? fa.pvalue - oldValue + faAB.value! : fa.pvalue
    console.log(`[${event.name}] Saving account: ${JSON.stringify(fa, null, 2)}`)
    await store.save<Account>(fa)

    const faHAB = new HistoricalAccountBalance()
    faHAB.id = event.id + '-' + fromWId.substring(fromWId.length - 5)
    faHAB.accountId = fa.accountId
    faHAB.event = event.method
    faHAB.assetId = faAB.assetId
    faHAB.dBalance = - amount
    faHAB.balance = faAB.balance
    faHAB.dValue = faAB.value ? faAB.value - oldValue : 0
    faHAB.value = faAB.value
    faHAB.pvalue = fa.pvalue
    faHAB.blockNumber = block.height
    faHAB.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(faHAB, null, 2)}`)
    await store.save<HistoricalAccountBalance>(faHAB)

    var ta = await store.get(Account, { where: { accountId: toWId } })
    if (!ta) {
        ta = new Account()
        ta.id = event.id + '-' + toWId.substring(toWId.length - 5)
        ta.accountId = toWId
        ta.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
        await store.save<Account>(ta)
        await initBalance(ta, store, event, block)
    }

    const taAB = await store.get(AccountBalance, { where: { account: ta, assetId: assetId } })
    if (!taAB) { return }

    const hab = await store.get(HistoricalAccountBalance, { where: 
        { accountId: ta.accountId, assetId: assetId, event: "Endowed", blockNumber: block.height } })
    if (!hab) {
        taAB.balance = taAB.balance + amount
        oldValue = taAB.value!
        taAB.value = asset ? asset.price ? Number(taAB.balance) * asset.price : 0 : null
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(taAB, null, 2)}`)
        await store.save<AccountBalance>(taAB)
    } else {
        hab.event = hab.event.concat(event.method)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(hab) 
        return  
    }

    ta.pvalue = taAB.value ? ta.pvalue - oldValue + taAB.value! : ta.pvalue
    console.log(`[${event.name}] Saving account: ${JSON.stringify(ta, null, 2)}`)
    await store.save<Account>(ta)

    const taHAB = new HistoricalAccountBalance()
    taHAB.id = event.id + '-' + toWId.substring(toWId.length - 5)
    taHAB.accountId = ta.accountId
    taHAB.event = event.method
    taHAB.assetId = taAB.assetId
    taHAB.dBalance = amount
    taHAB.balance = taAB.balance
    taHAB.dValue = taAB.value ? taAB.value - oldValue : 0
    taHAB.value = taAB.value
    taHAB.pvalue = ta.pvalue
    taHAB.blockNumber = block.height
    taHAB.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(taHAB, null, 2)}`)
    await store.save<HistoricalAccountBalance>(taHAB)
}

export async function currencyDeposited(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, accountId, amount } = getDepositedEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const asset = await store.get(Asset, { where: { assetId: assetId } })

    const ab = await store.get(AccountBalance, { where: { account: acc, assetId: assetId} })
    if (!ab) { return }

    const ehab = await store.get(HistoricalAccountBalance, { where: 
        { accountId: acc.accountId, assetId: assetId, event: "Endowed", blockNumber: block.height } })
    var oldValue = 0
    if (!ehab) {
        ab.balance = ab.balance + amount
        oldValue = ab.value!
        ab.value = asset ? asset.price ? Number(ab.balance) * asset.price : 0 : null
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
        await store.save<AccountBalance>(ab)
    } else {
        ehab.event = ehab.event.concat(event.method)
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(ehab, null, 2)}`)
        await store.save<HistoricalAccountBalance>(ehab) 
        return  
    }

    acc.pvalue = ab.value ? acc.pvalue - oldValue + ab.value! : acc.pvalue
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.dBalance = amount
    hab.balance = ab.balance
    hab.dValue = ab.value ? ab.value - oldValue : 0
    hab.value = ab.value
    hab.pvalue = acc.pvalue
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

export async function currencyWithdrawn(ctx: EventHandlerContext) {
    const { store, event, block, extrinsic } = ctx
    const { assetId, accountId, amount } = getWithdrawnEvent(ctx)
    const walletId = ss58.codec('zeitgeist').encode(accountId)

    var acc = await store.get(Account, { where: { accountId: walletId } })
    if (!acc) {
        acc = new Account()
        acc.id = event.id + '-' + walletId.substring(walletId.length - 5)
        acc.accountId = walletId
        acc.pvalue = 0
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
        await store.save<Account>(acc)
        await initBalance(acc, store, event, block)
    }

    const asset = await store.get(Asset, { where: { assetId: assetId } })

    var ab = await store.get(AccountBalance, { where: { account: acc, assetId: assetId } })
    var oldValue = 0
    if (!ab) {
        ab = new AccountBalance()
        ab.id = event.id + '-' + walletId.substring(walletId.length - 5)
        ab.account = acc
        ab.assetId = assetId
        ab.balance = - amount
    } else {
        ab.balance = ab.balance - amount
        oldValue = ab.value!
    }
    ab.value = asset ? asset.price ? Number(ab.balance) * asset.price : 0 : null
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    acc.pvalue = ab.value ? acc.pvalue - oldValue + ab.value! : acc.pvalue
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
    hab.accountId = acc.accountId
    hab.event = event.method
    hab.assetId = ab.assetId
    hab.dBalance = - amount
    hab.balance = ab.balance
    hab.dValue = ab.value ? ab.value - oldValue : 0
    hab.value = ab.value
    hab.pvalue = acc.pvalue
    hab.blockNumber = block.height
    hab.timestamp = new Date(block.timestamp)
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
    await store.save<HistoricalAccountBalance>(hab)
}

async function initBalance(acc: Account, store: Store, event: SubstrateEvent, block: SubstrateBlock) {
    const sdk = await Tools.getSDK()
    const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
    const {
      data: { free: amt },
    } = (await sdk.api.query.system.account.at(
      blockZero,
      acc.accountId
    )) as AccountInfo;

    const ab = new AccountBalance()
    ab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5)
    ab.account = acc
    ab.assetId = "Ztg"
    ab.balance = amt.toBigInt()
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
    await store.save<AccountBalance>(ab)

    acc.pvalue = Number(acc.pvalue) + amt.toNumber()
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
    await store.save<Account>(acc)

    const hab = new HistoricalAccountBalance()
    hab.id = event.id + '-000-' + acc.accountId.substring(acc.accountId.length - 5)
    hab.accountId = acc.accountId
    hab.event = "Initialised"
    hab.assetId = ab.assetId
    hab.dBalance = amt.toBigInt()
    hab.balance = ab.balance
    hab.pvalue = acc.pvalue
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

interface RewardedEvent {
    walletId: string
    amount: string
}

interface NewAccountEvent {
    accountId: Uint8Array
}

interface ExtrinsicEvent {
    info: any
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

interface WithdrawEvent {
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

function getRewardedEvent(ctx: EventHandlerContext): RewardedEvent {
    const [param0, param1] = ctx.event.params
    const walletId = param0.value as string
    const amount = param1.value as string
    return {walletId, amount}
}

function getNewAccountEvent(ctx: EventHandlerContext): NewAccountEvent {
    const event = new SystemNewAccountEvent(ctx)
    if (event.isV23) {
        const accountId = event.asV23
        return {accountId}
    } else {
        const {account} = event.asLatest
        const accountId = account
        return {accountId}
    }
}

function getExtrinsicSuccessEvent(ctx: EventHandlerContext): ExtrinsicEvent {
    const event = new SystemExtrinsicSuccessEvent(ctx)
    if (event.isV23) {
        const info = event.asV23
        return {info}
    } else {
        const {dispatchInfo}  = event.asLatest
        const info = dispatchInfo
        return {info}
    }
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
        const {dispatchError, dispatchInfo}  = event.asLatest
        const info = dispatchInfo
        return {info}
    }
}

function getBalancesEndowedEvent(ctx: EventHandlerContext): BalEndowedEvent {
    const event = new BalancesEndowedEvent(ctx)
    if (event.isV23) {
        const [accountId, amount] = event.asV23
        return {accountId, amount}
    } else {
        const {account, freeBalance} = event.asLatest
        const accountId = account
        const amount = freeBalance
        return {accountId, amount}
    }
}

function getDustLostEvent(ctx: EventHandlerContext): DustLostEvent {
    const event = new BalancesDustLostEvent(ctx)
    if (event.isV23) {
        const [accountId, amount] = event.asV23
        return {accountId, amount}
    } else {
        const {account, amount} = event.asLatest
        const accountId = account
        return {accountId, amount}
    }
}

function getTransferEvent(ctx: EventHandlerContext): TransferEvent {
    const event = new BalancesTransferEvent(ctx)
    if (event.isV23) {
        const [fromId, toId, amount] = event.asV23
        return {fromId, toId, amount}
    } else {
        const {from, to, amount} = event.asLatest
        const fromId = from
        const toId = to
        return {fromId, toId, amount}
    }
}

function getBalanceSetEvent(ctx: EventHandlerContext): BalanceSetEvent {
    const event = new BalancesBalanceSetEvent(ctx)
    if (event.isV23) {
        const [accountId, amount] = event.asV23
        return {accountId, amount}
    } else {
        const {who, free} = event.asLatest
        const accountId = who
        const amount = free
        return {accountId, amount}
    }
}

function getReservedEvent(ctx: EventHandlerContext): ReservedEvent {
    const event = new BalancesReservedEvent(ctx)
    if (event.isV23) {
        const [accountId, amount] = event.asV23
        return {accountId, amount}
    } else {
        const {who, amount} = event.asLatest
        const accountId = who
        return {accountId, amount}
    }
}

function getUnreservedEvent(ctx: EventHandlerContext): UnreservedEvent {
    const event = new BalancesUnreservedEvent(ctx)
    if (event.isV23) {
        const [accountId, amount] = event.asV23
        return {accountId, amount}
    } else {
        const {who, amount} = event.asLatest
        const accountId = who
        return {accountId, amount}
    }
}

function getTokensEndowedEvent(ctx: EventHandlerContext): TokEndowedEvent {
    const event = new TokensEndowedEvent(ctx)
    var currencyId, accountId, amount
    if (event.isV23) {
        [currencyId, accountId, amount] = event.asV23
    } else if (event.isV32) {
        [currencyId, accountId, amount] = event.asV32
    } else {
        const info = event.asLatest
        currencyId = info.currencyId
        accountId = info.who
        amount = info.amount
    }

    if (currencyId.__kind  == "CategoricalOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, accountId, amount}
    } else if (currencyId.__kind  == "ScalarOutcome") {
        const scale = new Array()
        scale.push(+currencyId.value[0].toString())
        scale.push(currencyId.value[1].__kind)
        const assetId = JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)))
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
        const info = event.asLatest
        currencyId = info.currencyId
        fromId = info.from
        toId = info.to
        amount = info.amount
    }

    if (currencyId.__kind  == "CategoricalOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, fromId, toId, amount}
    } else if (currencyId.__kind  == "ScalarOutcome") {
        const scale = new Array()
        scale.push(+currencyId.value[0].toString())
        scale.push(currencyId.value[1].__kind)
        const assetId = JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)))
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
        const info = event.asLatest
        currencyId = info.currencyId
        accountId = info.who
        amount = info.amount
    }

    if (currencyId.__kind  == "CategoricalOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, accountId, amount}
    } else if (currencyId.__kind  == "ScalarOutcome") {
        const scale = new Array()
        scale.push(+currencyId.value[0].toString())
        scale.push(currencyId.value[1].__kind)
        const assetId = JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)))
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
        const info = event.asLatest
        currencyId = info.currencyId
        accountId = info.who
        amount = info.amount
    }

    if (currencyId.__kind  == "CategoricalOutcome") {
        const assetId = JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
        return {assetId, accountId, amount}
    } else if (currencyId.__kind  == "ScalarOutcome") {
        const scale = new Array()
        scale.push(+currencyId.value[0].toString())
        scale.push(currencyId.value[1].__kind)
        const assetId = JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)))
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