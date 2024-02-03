import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
import * as mappings from './mappings';
import {
  Account,
  AccountBalance,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalMarket,
  HistoricalPool,
  HistoricalSwap,
} from './model';
import * as postHooks from './post-hooks';
import { calls, events } from './types';
import { Pallet } from './consts';
import { initBalance, isBatteryStation, isEventOrderValid, isMainnet } from './helper';
import { processor, Event } from './processor';

const accounts = new Map<string, Map<string, bigint>>();
let assetHistory: HistoricalAsset[];
let balanceHistory: HistoricalAccountBalance[];
let marketHistory: HistoricalMarket[];
let poolHistory: HistoricalPool[];
let swapHistory: HistoricalSwap[];

processor.run(new TypeormDatabase(), async (ctx) => {
  assetHistory = [];
  balanceHistory = [];
  marketHistory = [];
  poolHistory = [];
  swapHistory = [];

  for (let block of ctx.blocks) {
    if (isBatteryStation() && block.header.height < 1089818) {
      for (let call of block.calls) {
        if (!call.success) continue;
        if (call.name === calls.predictionMarkets.redeemShares.name) {
          await saveAccounts(ctx.store);
          await mappings.predictionMarkets.redeemShares(ctx.store, call);
        } else if (call.name === calls.swaps.poolExit.name) {
          await saveAccounts(ctx.store);
          await mappings.swaps.poolExitCall(ctx.store, call);
        }
      }
    }
    for (let event of block.events) {
      switch (event.name.split('.')[0]) {
        case Pallet.AssetTxPayment:
          await mapAssetTxPayment(event);
          break;
        case Pallet.Authorized:
          await mapAuthorized(ctx.store, event);
          break;
        case Pallet.Balances:
          await mapBalances(ctx.store, event);
          break;
        case Pallet.Court:
          await mapCourt(event);
          break;
        case Pallet.Currency:
          await mapCurrency(event);
          break;
        case Pallet.NeoSwaps:
          await mapNeoSwaps(ctx.store, event);
          break;
        case Pallet.ParachainStaking:
          await mapParachainStaking(event);
          break;
        case Pallet.PredictionMarkets:
          await mapPredictionMarkets(ctx.store, event);
          break;
        case Pallet.Styx:
          await mapStyx(ctx.store, event);
          break;
        case Pallet.Swaps:
          await mapSwaps(ctx.store, event);
          break;
        case Pallet.System:
          await mapSystem(ctx.store, event);
          break;
        case Pallet.Tokens:
          await mapTokens(ctx.store, event);
          break;
      }
    }
    if (isBatteryStation()) {
      await handleBsrPostHooks(ctx.store, block.header.height);
    } else if (isMainnet()) {
      await handleMainPostHooks(ctx.store, block.header.height);
    }
  }
  await saveAccounts(ctx.store);
  await saveHistory(ctx.store);
});

const handleBsrPostHooks = async (store: Store, blockHeight: number) => {
  if (blockHeight >= 35683 && blockHeight <= 211391) {
    await saveAccounts(store);
    const historicalAccountBalances = await postHooks.unreserveBalances(blockHeight);
    await storeBalanceChanges(historicalAccountBalances);
    const historicalAssets = await postHooks.resolveMarkets(store, blockHeight);
    assetHistory.push(...historicalAssets);
  } else if (blockHeight === 579750) {
    await saveAccounts(store);
    await postHooks.destroyMarkets(store);
  } else if (blockHeight === 4772816) {
    await postHooks.migrateScoringRule(store);
  }
};

const handleMainPostHooks = async (store: Store, blockHeight: number) => {
  if (blockHeight === 4793019) {
    await postHooks.migrateScoringRule(store);
  }
};

const mapAssetTxPayment = async (event: Event) => {
  switch (event.name) {
    case events.assetTxPayment.assetTxFeePaid.name:
      const habs = await mappings.assetTxPayment.assetTxFeePaid(event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
  }
};

const mapAuthorized = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.authorized.authorityReported.name:
      await mappings.authorized.authorityReported(store, event);
      break;
  }
};

const mapBalances = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.balances.balanceSet.name: {
      await saveAccounts(store);
      await mappings.balances.balanceSet(store, event);
      break;
    }
    case events.balances.deposit.name: {
      const hab = await mappings.balances.deposit(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.dustLost.name: {
      const hab = await mappings.balances.dustLost(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.reserveRepatriated.name: {
      const hab = await mappings.balances.reserveRepatriated(event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.reserved.name: {
      const hab = await mappings.balances.reserved(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.transfer.name: {
      const habs = await mappings.balances.transfer(event);
      await storeBalanceChanges(habs);
      break;
    }
    case events.balances.unreserved.name: {
      const hab = await mappings.balances.unreserved(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.withdraw.name: {
      const hab = await mappings.balances.withdraw(event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapCourt = async (event: Event) => {
  switch (event.name) {
    case events.court.mintedInCourt.name:
      const hab = balanceHistory.pop();
      if (hab && hab.event === 'Deposit') {
        hab.id = event.id + hab.id.slice(-6);
        hab.event = event.name.split('.')[1];
        balanceHistory.push(hab);
      }
      break;
  }
};

const mapCurrency = async (event: Event) => {
  switch (event.name) {
    case events.currency.deposited.name: {
      const hab = await mappings.currency.deposited(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.currency.transferred.name: {
      const habs = await mappings.currency.transferred(event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.currency.withdrawn.name: {
      const hab = await mappings.currency.withdrawn(event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapNeoSwaps = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.neoSwaps.buyExecuted.name: {
      await saveAccounts(store);
      const res = await mappings.neoSwaps.buyExecuted(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.neoSwaps.exitExecuted.name: {
      await saveAccounts(store);
      const res = await mappings.neoSwaps.exitExecuted(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.neoSwaps.feesWithdrawn.name: {
      await mappings.neoSwaps.feesWithdrawn(store, event);
      break;
    }
    case events.neoSwaps.joinExecuted.name: {
      await saveAccounts(store);
      const res = await mappings.neoSwaps.joinExecuted(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.neoSwaps.poolDeployed.name: {
      await saveAccounts(store);
      const res = await mappings.neoSwaps.poolDeployed(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.neoSwaps.sellExecuted.name: {
      await saveAccounts(store);
      const res = await mappings.neoSwaps.sellExecuted(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      marketHistory.push(res.historicalMarket);
      break;
    }
  }
};

const mapParachainStaking = async (event: Event) => {
  switch (event.name) {
    case events.parachainStaking.rewarded.name: {
      if (event.block.specVersion < 33) {
        const hab = await mappings.parachainStaking.rewarded(event);
        await storeBalanceChanges([hab]);
        break;
      }
      // Since specVersion:33, Balances.Deposit is always emitted with ParachainStaking.Rewarded
      // To avoid redundant addition, DepositEvent is being utilised for recording rewards
      const hab = balanceHistory.pop();
      if (hab && hab.event === 'Deposit') {
        hab.event = event.name.split('.')[1];
        hab.id = event.id + hab.id.slice(-6);
        balanceHistory.push(hab);
      }
      break;
    }
  }
};

const mapPredictionMarkets = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.predictionMarkets.boughtCompleteSet.name: {
      const habs = await mappings.predictionMarkets.boughtCompleteSet(store, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.predictionMarkets.globalDisputeStarted.name: {
      await mappings.predictionMarkets.globalDisputeStarted(store, event);
      break;
    }
    case events.predictionMarkets.marketApproved.name: {
      await mappings.predictionMarkets.marketApproved(store, event);
      break;
    }
    case events.predictionMarkets.marketClosed.name: {
      await mappings.predictionMarkets.marketClosed(store, event);
      break;
    }
    case events.predictionMarkets.marketCreated.name: {
      await mappings.predictionMarkets.marketCreated(store, event);
      break;
    }
    case events.predictionMarkets.marketDestroyed.name: {
      await mappings.predictionMarkets.marketDestroyed(store, event);
      break;
    }
    case events.predictionMarkets.marketDisputed.name: {
      await mappings.predictionMarkets.marketDisputed(store, event);
      break;
    }
    case events.predictionMarkets.marketEarlyCloseScheduled.name: {
      await mappings.predictionMarkets.marketEarlyCloseScheduled(store, event);
      break;
    }
    case events.predictionMarkets.marketExpired.name: {
      await mappings.predictionMarkets.marketExpired(store, event);
      break;
    }
    case events.predictionMarkets.marketInsufficientSubsidy.name: {
      await mappings.predictionMarkets.marketInsufficientSubsidy(store, event);
      break;
    }
    case events.predictionMarkets.marketRejected.name: {
      await mappings.predictionMarkets.marketRejected(store, event);
      break;
    }
    case events.predictionMarkets.marketReported.name: {
      await mappings.predictionMarkets.marketReported(store, event);
      break;
    }
    case events.predictionMarkets.marketResolved.name: {
      await saveAccounts(store);
      await mappings.predictionMarkets.marketResolved(store, event);
      break;
    }
    case events.predictionMarkets.marketStartedWithSubsidy.name: {
      await mappings.predictionMarkets.marketStartedWithSubsidy(store, event);
      break;
    }
    case events.predictionMarkets.soldCompleteSet.name: {
      const habs = await mappings.predictionMarkets.soldCompleteSet(store, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.predictionMarkets.tokensRedeemed.name: {
      const hab = await mappings.predictionMarkets.tokensRedeemed(event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapStyx = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.styx.accountCrossed.name:
      await mappings.styx.accountCrossed(store, event);
      break;
  }
};

const mapSwaps = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.swaps.arbitrageBuyBurn.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.arbitrageBuyBurn(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.arbitrageMintSell.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.arbitrageMintSell(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.marketCreatorFeesPaid.name: {
      // Refurbishes changes from two Balances.Transfer events accompanying before this event
      if (balanceHistory.length < 2) break;
      for (let i = 1; i < 3; i++) {
        const hab = balanceHistory[balanceHistory.length - i];
        if (hab.event === 'Transfer' && isEventOrderValid(event.id, hab.id.slice(0, -6))) {
          hab.id = event.id + hab.id.slice(-6);
          hab.event = event.name.split('.')[1];
          balanceHistory[balanceHistory.length - i] = hab;
        }
      }
      break;
    }
    case events.swaps.poolActive.name: {
      const hp = await mappings.swaps.poolActive(store, event);
      if (!hp) break;
      poolHistory.push(hp);
      break;
    }
    case events.swaps.poolClosed.name: {
      const hp = await mappings.swaps.poolClosed(store, event);
      if (!hp) break;
      poolHistory.push(hp);
      break;
    }
    case events.swaps.poolCreate.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.poolCreate(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      poolHistory.push(res.historicalPool);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.poolDestroyed.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.poolDestroyed(store, event);
      if (!res) break;
      await storeBalanceChanges(res.historicalAccountBalances);
      assetHistory.push(...res.historicalAssets);
      poolHistory.push(res.historicalPool);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.poolExit.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.poolExit(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.poolExitWithExactAssetAmount.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.poolExitWithExactAssetAmount(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.poolJoin.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.poolJoin(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.poolJoinWithExactAssetAmount.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.poolJoinWithExactAssetAmount(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.swapExactAmountIn.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.swapExactAmountIn(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      marketHistory.push(res.historicalMarket);
      break;
    }
    case events.swaps.swapExactAmountOut.name: {
      await saveAccounts(store);
      const res = await mappings.swaps.swapExactAmountOut(store, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      marketHistory.push(res.historicalMarket);
      break;
    }
  }
};

const mapSystem = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.system.extrinsicFailed.name: {
      const hab = await mappings.system.extrinsicFailed(event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.system.extrinsicSuccess.name: {
      const hab = await mappings.system.extrinsicSuccess(event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.system.newAccount.name: {
      await mappings.system.newAccount(store, event);
      break;
    }
  }
};

const mapTokens = async (store: Store, event: Event) => {
  switch (event.name) {
    case events.tokens.balanceSet.name: {
      await saveAccounts(store);
      await mappings.tokens.balanceSet(store, event);
      break;
    }
    case events.tokens.deposited.name: {
      const hab = await mappings.tokens.deposited(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.tokens.reserved.name: {
      const hab = await mappings.tokens.reserved(event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.tokens.transfer.name: {
      const habs = await mappings.tokens.transfer(event);
      await storeBalanceChanges(habs);
      break;
    }
    case events.tokens.withdrawn.name: {
      const hab = await mappings.tokens.withdrawn(event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const saveAccounts = async (store: Store) => {
  await Promise.all(
    Array.from(accounts).map(async ([accountId, balances]) => {
      let account = await store.get(Account, { where: { accountId } });
      if (!account) {
        account = new Account({
          accountId,
          id: accountId,
        });
        console.log(`Saving account: ${JSON.stringify(account, null, 2)}`);
        await store.save<Account>(account);
        await initBalance(account, store);
      }

      await Promise.all(
        Array.from(balances).map(async ([assetId, amount]) => {
          let ab = await store.findOneBy(AccountBalance, {
            account: { accountId },
            assetId,
          });
          if (!ab) {
            ab = new AccountBalance({
              account,
              assetId,
              balance: BigInt(0),
              id: accountId + '-' + assetId,
            });
          }
          ab.balance += amount;
          console.log(`Saving account balance: ${JSON.stringify(ab, null, 2)}`);
          await store.save<AccountBalance>(ab);
        })
      );
    })
  );
  accounts.clear();
};

const saveHistory = async (store: Store) => {
  if (assetHistory.length > 0) {
    console.log(`Saving historical assets: ${JSON.stringify(assetHistory, null, 2)}`);
    await store.save<HistoricalAsset>(assetHistory);
  }
  if (balanceHistory.length > 0) {
    console.log(`Saving historical account balances: ${JSON.stringify(balanceHistory, null, 2)}`);
    await store.save<HistoricalAccountBalance>(balanceHistory);
  }
  if (marketHistory.length > 0) {
    console.log(`Saving historical markets: ${JSON.stringify(marketHistory, null, 2)}`);
    await store.save<HistoricalMarket>(marketHistory);
  }
  if (poolHistory.length > 0) {
    console.log(`Saving historical pools: ${JSON.stringify(poolHistory, null, 2)}`);
    await store.save<HistoricalPool>(poolHistory);
  }
  if (swapHistory.length > 0) {
    console.log(`Saving historical swaps: ${JSON.stringify(swapHistory, null, 2)}`);
    await store.save<HistoricalSwap>(swapHistory);
  }
};

const storeBalanceChanges = async (habs: HistoricalAccountBalance[]) => {
  await Promise.all(
    habs.map(async (hab) => {
      const balances = accounts.get(hab.accountId) ?? new Map<string, bigint>();
      balances.set(hab.assetId, (balances.get(hab.assetId) || BigInt(0)) + hab.dBalance);
      accounts.set(hab.accountId, balances);
    })
  );
  balanceHistory.push(...habs);
};
