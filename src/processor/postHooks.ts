import { BlockHandlerContext } from "@subsquid/substrate-processor"
import { Account, AccountBalance, HistoricalAccountBalance } from "../model"

export async function add_balance_108949(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE1EyDwADmoUReAUN2ynVgvGmqkmaWj3Ht1hMndubRPY4NrjD"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(5000000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 5000000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(5000000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}

export async function add_balance_155917(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(5000000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 5000000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(5000000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}

export async function add_balance_175178(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(50000000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 50000000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(50000000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}

export async function add_balance_178290(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(50000000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 50000000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(50000000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}

export async function add_balance_179524(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(50000000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 50000000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(50000000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}

export async function add_balance_184820(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(50000000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 50000000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(50000000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}

export async function add_balance_204361(ctx: BlockHandlerContext) {
    const {store, events, block} = ctx
    for (var i = 0; i < events.length; i++) {
        const event = events[i]
        if (event.name == "balances.Unreserved") {
            const walletId = "dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW"

            const acc = await store.get(Account, { where: { accountId: walletId } })
            if (!acc) { return }

            const ab = await store.get(AccountBalance, { where: { account: acc, assetId: "Ztg" } })
            if (ab) {
                ab.balance = ab.balance + BigInt(82500000000)
                ab.value = Number(ab.balance)
                console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
                await store.save<AccountBalance>(ab)

                acc.pvalue = acc.pvalue + 82500000000
                console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
                await store.save<Account>(acc)

                const hab = new HistoricalAccountBalance()
                hab.id = event.id + '-' + walletId.substring(walletId.length - 5)
                hab.accountId = acc.accountId
                hab.event = "PostHook"
                hab.assetId = ab.assetId
                hab.dBalance = BigInt(82500000000)
                hab.balance = ab.balance
                hab.dValue = Number(hab.dBalance)
                hab.value = Number(hab.balance)
                hab.pvalue = acc.pvalue
                hab.blockNumber = block.height
                hab.timestamp = new Date(block.timestamp)
                console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
                await store.save<HistoricalAccountBalance>(hab)
            }
            break
        }
    }
}