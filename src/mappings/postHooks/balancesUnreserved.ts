import { BlockHandlerContext } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import { Account, AccountBalance, HistoricalAccountBalance } from '../../model';


export async function unreserveBalances_92128(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dDzCbtpYLKGKgV3xmuAbQdGNs6puwev2ZpbVP1L5VYSd2uF1Y';
  const event = {
    id: '0000092128-000000-1e9d6',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(50000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 50000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(50000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_108949(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE1EyDwADmoUReAUN2ynVgvGmqkmaWj3Ht1hMndubRPY4NrjD';
  const event = {
    id: '0000108949-000000-3263e',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(5000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 5000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(5000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_155917(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW';
  const event = {
    id: '0000155917-000000-3f61f',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(5000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 5000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(5000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_168378(ctx: BlockHandlerContext<Store>) {
  const wIds = [
    'dDykRtA8VyuVVtWTD5PWst3f33L1NMVKseQEji8e3B4ZCHrjK', 
    'dE3EP2kkLee2E22JJr8kSEnXkQ1VyAoB8YnQsxgE5BFLMHGDj',
    'dE1qpHWYrzYSz5x2hkUtb9JW3iSEzE5igqcNR1XEcczWi5n8k',
  ];
  const event = {
    id: '0000168378-000000-e544d',
    name: 'PostHooks.BalancesUnreserved'
  }

  await Promise.all(
    wIds.map(async (wId) => {
      const acc = await ctx.store.get(Account, { where: { accountId: wId } })
      if (!acc) {
        return;
      }

      let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
      if (ab) {
        ab.balance = ab.balance + BigInt(70000000000);
        ab.value = Number(ab.balance);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        acc.pvalue = acc.pvalue + 70000000000;
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
        await ctx.store.save<Account>(acc);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + wId.substring(wId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = 'Unreserved';
        hab.assetId = ab.assetId;
        hab.dBalance = BigInt(70000000000);
        hab.balance = ab.balance;
        hab.dValue = Number(hab.dBalance);
        hab.value = Number(hab.balance);
        hab.pvalue = acc.pvalue;
        hab.blockNumber = ctx.block.height;
        hab.timestamp = new Date(ctx.block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      }
    })
  )
}

export async function unreserveBalances_175178(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW';
  const event = {
    id: '0000175178-000000-df5fd',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(50000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 50000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(50000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_176408(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dDzJBHBMDk2WhoaRxPhXnf4EqdkE8aRDWR15epsT4Hd6ufakp';
  const event = {
    id: '0000176408-000000-6059b',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(5000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 5000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(5000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_178290(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW';
  const event = {
    id: '0000178290-000000-58224',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(50000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 50000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(50000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_179524(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW';
  const event = {
    id: '0000179524-000000-79a82',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(50000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 50000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(50000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_184820(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW';
  const event = {
    id: '0000184820-000000-d843f',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(50000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 50000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(50000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}

export async function unreserveBalances_204361(ctx: BlockHandlerContext<Store>) {
  const wIds = [
    'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW', 
    'dDzFGnwpyB9bWPsd9RoxZA6mW4MDNRVHvCFgnqhhE2f5yVJ8v',
  ];
  const event = {
    id: '0000204361-000000-e6cc2',
    name: 'PostHooks.BalancesUnreserved'
  }

  await Promise.all(
    wIds.map(async (wId) => {
      const acc = await ctx.store.get(Account, { where: { accountId: wId } })
      if (!acc) {
        return;
      }

      let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
      if (ab) {
        ab.balance = ab.balance + BigInt(82500000000);
        ab.value = Number(ab.balance);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        acc.pvalue = acc.pvalue + 82500000000;
        console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
        await ctx.store.save<Account>(acc);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + wId.substring(wId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = 'Unreserved';
        hab.assetId = ab.assetId;
        hab.dBalance = BigInt(82500000000);
        hab.balance = ab.balance;
        hab.dValue = Number(hab.dBalance);
        hab.value = Number(hab.balance);
        hab.pvalue = acc.pvalue;
        hab.blockNumber = ctx.block.height;
        hab.timestamp = new Date(ctx.block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      }
    })
  )
}

export async function unreserveBalances_211391(ctx: BlockHandlerContext<Store>) {
  const walletId = 'dE36Vywi4gzDkuoKrsetu5H4M37AydHAoB798658n9m5ekbmm';
  const event = {
    id: '0000211391-000000-f8b9f',
    name: 'PostHooks.BalancesUnreserved'
  }

  const acc = await ctx.store.get(Account, { where: { accountId: walletId } })
  if (!acc) {
    return;
  }

  let ab = await ctx.store.findOneBy(AccountBalance, { account: { accountId: acc.accountId }, assetId: 'Ztg' })
  if (ab) {
    ab.balance = ab.balance + BigInt(5000000000);
    ab.value = Number(ab.balance);
    console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    acc.pvalue = acc.pvalue + 5000000000;
    console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);

    let hab = new HistoricalAccountBalance();
    hab.id = event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = acc.accountId;
    hab.event = 'Unreserved';
    hab.assetId = ab.assetId;
    hab.dBalance = BigInt(5000000000);
    hab.balance = ab.balance;
    hab.dValue = Number(hab.dBalance);
    hab.value = Number(hab.balance);
    hab.pvalue = acc.pvalue;
    hab.blockNumber = ctx.block.height;
    hab.timestamp = new Date(ctx.block.timestamp);
    console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
}