import { lookupArchive } from '@subsquid/archive-registry';
import {
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
  BlockHeader,
  Call as _Call,
  Event as _Event,
  Extrinsic as _Extrinsic,
} from '@subsquid/substrate-processor';
import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
import { assetTxFeePaid } from './mappings/assetTxPayment';
import { authorityReported } from './mappings/authorized';
import {
  balancesBalanceSet,
  balancesDeposit,
  balancesDustLost,
  balancesReserveRepatriated,
  balancesReserved,
  balancesTransfer,
  balancesUnreserved,
  balancesWithdraw,
} from './mappings/balances';
import { currencyDeposited, currencyTransferred, currencyWithdrawn } from './mappings/currency';
import {
  buyExecuted,
  exitExecuted,
  feesWithdrawn,
  joinExecuted,
  poolDeployed,
  sellExecuted,
} from './mappings/neoSwaps';
import { parachainStakingRewarded } from './mappings/parachainStaking';
import {
  boughtCompleteSet,
  globalDisputeStarted,
  marketApproved,
  marketClosed,
  marketCreated,
  marketDestroyed,
  marketDisputed,
  marketExpired,
  marketInsufficientSubsidy,
  marketRejected,
  marketReported,
  marketResolved,
  marketStartedWithSubsidy,
  redeemShares,
  soldCompleteSet,
  tokensRedeemed,
} from './mappings/predictionMarkets';
import { accountCrossed } from './mappings/styx';
import {
  arbitrageBuyBurn,
  arbitrageMintSell,
  poolActive,
  poolClosed,
  poolCreate,
  poolDestroyed,
  poolExit,
  poolExitCall,
  poolExitWithExactAssetAmount,
  poolJoin,
  poolJoinWithExactAssetAmount,
  swapExactAmountIn,
  swapExactAmountOut,
} from './mappings/swaps';
import { systemExtrinsicFailed, systemExtrinsicSuccess, systemNewAccount } from './mappings/system';
import { tokensBalanceSet, tokensDeposited, tokensReserved, tokensTransfer, tokensWithdrawn } from './mappings/tokens';
import {
  Account,
  AccountBalance,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalPool,
  HistoricalSwap,
} from './model';
import { calls, events } from './types';
import { Pallet, initBalance } from './helper';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`);

export const processor = new SubstrateBatchProcessor()
  .setDataSource({
    chain: process.env.WS_NODE_URL ?? 'wss://bsr.zeitgeist.pm',
    archive: lookupArchive('zeitgeist-testnet', { release: 'ArrowSquid' }),
  })
  .addCall({
    name: [calls.predictionMarkets.redeemShares.name, calls.swaps.poolExit.name],
    extrinsic: true,
  })
  .addEvent({
    name: [
      events.assetTxPayment.assetTxFeePaid.name,
      events.authorized.authorityReported.name,
      events.balances.balanceSet.name,
      events.balances.deposit.name,
      events.balances.dustLost.name,
      events.balances.transfer.name,
      events.balances.reserveRepatriated.name,
      events.balances.reserved.name,
      events.balances.transfer.name,
      events.balances.unreserved.name,
      events.balances.withdraw.name,
      events.currency.deposited.name,
      events.currency.transferred.name,
      events.currency.withdrawn.name,
      events.neoSwaps.buyExecuted.name,
      events.neoSwaps.exitExecuted.name,
      events.neoSwaps.feesWithdrawn.name,
      events.neoSwaps.joinExecuted.name,
      events.neoSwaps.poolDeployed.name,
      events.neoSwaps.sellExecuted.name,
      events.parachainStaking.rewarded.name,
      events.predictionMarkets.boughtCompleteSet.name,
      events.predictionMarkets.globalDisputeStarted.name,
      events.predictionMarkets.marketApproved.name,
      events.predictionMarkets.marketClosed.name,
      events.predictionMarkets.marketCreated.name,
      events.predictionMarkets.marketDestroyed.name,
      events.predictionMarkets.marketDisputed.name,
      events.predictionMarkets.marketExpired.name,
      events.predictionMarkets.marketInsufficientSubsidy.name,
      events.predictionMarkets.marketRejected.name,
      events.predictionMarkets.marketReported.name,
      events.predictionMarkets.marketResolved.name,
      events.predictionMarkets.marketStartedWithSubsidy.name,
      events.predictionMarkets.soldCompleteSet.name,
      events.predictionMarkets.tokensRedeemed.name,
      events.styx.accountCrossed.name,
      events.swaps.arbitrageBuyBurn.name,
      events.swaps.arbitrageMintSell.name,
      events.swaps.arbitrageBuyBurn.name,
      events.swaps.marketCreatorFeesPaid.name,
      events.swaps.poolClosed.name,
      events.swaps.poolCreate.name,
      events.swaps.poolDestroyed.name,
      events.swaps.poolExit.name,
      events.swaps.poolExitWithExactAssetAmount.name,
      events.swaps.poolJoin.name,
      events.swaps.poolJoinWithExactAssetAmount.name,
      events.swaps.swapExactAmountIn.name,
      events.swaps.swapExactAmountOut.name,
      events.system.extrinsicFailed.name,
      events.system.extrinsicSuccess.name,
      events.system.newAccount.name,
      events.tokens.balanceSet.name,
      events.tokens.deposited.name,
      events.tokens.reserved.name,
      events.tokens.transfer.name,
      events.tokens.withdrawn.name,
    ],
    call: true,
    extrinsic: true,
  })
  .setFields({
    call: {
      name: true,
      origin: true,
      success: true,
    },
    event: {
      args: true,
    },
    extrinsic: {
      hash: true,
      signature: true,
    },
    block: {
      timestamp: true,
    },
  });

type Fields = SubstrateBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Call = _Call<Fields>;
export type Event = _Event<Fields>;
export type Extrinsic = _Extrinsic<Fields>;

const accounts = new Map<string, Map<string, bigint>>();
let assetHistory: HistoricalAsset[];
let balanceHistory: HistoricalAccountBalance[];
let poolHistory: HistoricalPool[];
let swapHistory: HistoricalSwap[];

processor.run(new TypeormDatabase(), async (ctx) => {
  assetHistory = [];
  balanceHistory = [];
  poolHistory = [];
  swapHistory = [];

  for (let block of ctx.blocks) {
    for (let call of block.calls) {
      if (call.success && block.header.height < 1089818) {
        if (call.name === calls.predictionMarkets.redeemShares.name) {
          await saveAccounts(ctx.store);
          await redeemShares(ctx.store, block.header, call);
        } else if (call.name === calls.swaps.poolExit.name) {
          await saveAccounts(ctx.store);
          await poolExitCall(ctx.store, block.header, call);
        }
      }
    }
    for (let event of block.events) {
      switch (event.name.split('.')[0]) {
        case Pallet.AssetTxPayment:
          await mapAssetTxPayment(block.header, event);
          break;
        case Pallet.Authorized:
          await mapAuthorized(ctx.store, block.header, event);
          break;
        case Pallet.Balances:
          await mapBalances(ctx.store, block.header, event);
          break;
        case Pallet.Currency:
          await mapCurrency(block.header, event);
          break;
        case Pallet.NeoSwaps:
          await mapNeoSwaps(ctx.store, block.header, event);
          break;
        case Pallet.ParachainStaking:
          await mapParachainStaking(block.header, event);
          break;
        case Pallet.PredictionMarkets:
          await mapPredictionMarkets(ctx.store, block.header, event);
          break;
        case Pallet.Styx:
          await mapStyx(ctx.store, block.header, event);
          break;
        case Pallet.Swaps:
          await mapSwaps(ctx.store, block.header, event);
          break;
        case Pallet.System:
          await mapSystem(ctx.store, block.header, event);
          break;
        case Pallet.Tokens:
          await mapTokens(ctx.store, block.header, event);
          break;
      }
    }
  }
  await saveAccounts(ctx.store);
  await saveHistory(ctx.store);
});

const mapAssetTxPayment = async (block: Block, event: Event) => {
  switch (event.name) {
    case events.assetTxPayment.assetTxFeePaid.name:
      const habs = await assetTxFeePaid(block, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
  }
};

const mapAuthorized = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.authorized.authorityReported.name:
      await authorityReported(store, block, event);
      break;
  }
};

const mapBalances = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.balances.balanceSet.name: {
      await saveAccounts(store);
      await balancesBalanceSet(store, block, event);
      break;
    }
    case events.balances.deposit.name: {
      const hab = await balancesDeposit(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.dustLost.name: {
      const hab = await balancesDustLost(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.reserveRepatriated.name: {
      const hab = await balancesReserveRepatriated(block, event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.reserved.name: {
      const hab = await balancesReserved(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.transfer.name: {
      const habs = await balancesTransfer(block, event);
      await storeBalanceChanges(habs);
      break;
    }
    case events.balances.unreserved.name: {
      const hab = await balancesUnreserved(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.withdraw.name: {
      const hab = await balancesWithdraw(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapCurrency = async (block: Block, event: Event) => {
  switch (event.name) {
    case events.currency.deposited.name: {
      const hab = await currencyDeposited(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.currency.transferred.name: {
      const habs = await currencyTransferred(block, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.currency.withdrawn.name: {
      const hab = await currencyWithdrawn(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapNeoSwaps = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.neoSwaps.buyExecuted.name: {
      await saveAccounts(store);
      const res = await buyExecuted(store, block, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      poolHistory.push(res.historicalPool);
      break;
    }
    case events.neoSwaps.exitExecuted.name: {
      await saveAccounts(store);
      const historicalAssets = await exitExecuted(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.neoSwaps.feesWithdrawn.name: {
      const historicalPool = await feesWithdrawn(store, block, event);
      if (!historicalPool) break;
      poolHistory.push(historicalPool);
      break;
    }
    case events.neoSwaps.joinExecuted.name: {
      await saveAccounts(store);
      const historicalAssets = await joinExecuted(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.neoSwaps.poolDeployed.name: {
      await saveAccounts(store);
      const res = await poolDeployed(store, block, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      poolHistory.push(res.historicalPool);
      break;
    }
    case events.neoSwaps.sellExecuted.name: {
      await saveAccounts(store);
      const res = await sellExecuted(store, block, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      poolHistory.push(res.historicalPool);
      break;
    }
  }
};

const mapParachainStaking = async (block: Block, event: Event) => {
  switch (event.name) {
    case events.parachainStaking.rewarded.name: {
      if (block.specVersion < 33) {
        const hab = await parachainStakingRewarded(block, event);
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

const mapPredictionMarkets = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.predictionMarkets.boughtCompleteSet.name: {
      const habs = await boughtCompleteSet(store, block, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.predictionMarkets.globalDisputeStarted.name: {
      await globalDisputeStarted(store, block, event);
      break;
    }
    case events.predictionMarkets.marketApproved.name: {
      await marketApproved(store, block, event);
      break;
    }
    case events.predictionMarkets.marketClosed.name: {
      await marketClosed(store, block, event);
      break;
    }
    case events.predictionMarkets.marketCreated.name: {
      await marketCreated(store, block, event);
      break;
    }
    case events.predictionMarkets.marketDestroyed.name: {
      await marketDestroyed(store, block, event);
      break;
    }
    case events.predictionMarkets.marketDisputed.name: {
      await marketDisputed(store, block, event);
      break;
    }
    case events.predictionMarkets.marketExpired.name: {
      await marketExpired(store, block, event);
      break;
    }
    case events.predictionMarkets.marketInsufficientSubsidy.name: {
      await marketInsufficientSubsidy(store, block, event);
      break;
    }
    case events.predictionMarkets.marketRejected.name: {
      await marketRejected(store, block, event);
      break;
    }
    case events.predictionMarkets.marketReported.name: {
      await marketReported(store, block, event);
      break;
    }
    case events.predictionMarkets.marketResolved.name: {
      await saveAccounts(store);
      await marketResolved(store, block, event);
      break;
    }
    case events.predictionMarkets.marketStartedWithSubsidy.name: {
      await marketStartedWithSubsidy(store, block, event);
      break;
    }
    case events.predictionMarkets.soldCompleteSet.name: {
      const habs = await soldCompleteSet(store, block, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.predictionMarkets.tokensRedeemed.name: {
      const hab = await tokensRedeemed(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapStyx = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.styx.accountCrossed.name:
      await accountCrossed(store, block, event);
      break;
  }
};

const mapSwaps = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.swaps.arbitrageBuyBurn.name: {
      await saveAccounts(store);
      const historicalAssets = await arbitrageBuyBurn(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.swaps.arbitrageMintSell.name: {
      await saveAccounts(store);
      const historicalAssets = await arbitrageMintSell(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.swaps.marketCreatorFeesPaid.name: {
      // Refurbishes changes from two Balances.Transfer events accompanying before this event
      if (balanceHistory.length < 2) break;
      for (let i = 1; i < 3; i++) {
        const hab = balanceHistory[balanceHistory.length - i];
        if (hab.event === 'Transfer') {
          hab.id = event.id + hab.id.slice(-6);
          hab.event = event.name.split('.')[1];
          balanceHistory[balanceHistory.length - i] = hab;
        }
      }
      break;
    }
    case events.swaps.poolActive.name: {
      const hp = await poolActive(store, block, event);
      if (!hp) break;
      poolHistory.push(hp);
      break;
    }
    case events.swaps.poolClosed.name: {
      const hp = await poolClosed(store, block, event);
      if (!hp) break;
      poolHistory.push(hp);
      break;
    }
    case events.swaps.poolCreate.name: {
      await saveAccounts(store);
      const res = await poolCreate(store, block, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      poolHistory.push(res.historicalPool);
      break;
    }
    case events.swaps.poolDestroyed.name: {
      await saveAccounts(store);
      const res = await poolDestroyed(store, block, event);
      if (!res) break;
      await storeBalanceChanges(res.historicalAccountBalances);
      assetHistory.push(...res.historicalAssets);
      poolHistory.push(res.historicalPool);
      break;
    }
    case events.swaps.poolExit.name: {
      await saveAccounts(store);
      const historicalAssets = await poolExit(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.swaps.poolExitWithExactAssetAmount.name: {
      await saveAccounts(store);
      const historicalAssets = await poolExitWithExactAssetAmount(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.swaps.poolJoin.name: {
      await saveAccounts(store);
      const historicalAssets = await poolJoin(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.swaps.poolJoinWithExactAssetAmount.name: {
      await saveAccounts(store);
      const historicalAssets = await poolJoinWithExactAssetAmount(store, block, event);
      if (!historicalAssets) break;
      assetHistory.push(...historicalAssets);
      break;
    }
    case events.swaps.swapExactAmountIn.name: {
      await saveAccounts(store);
      const res = await swapExactAmountIn(store, block, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      if (res.historicalPool) poolHistory.push(res.historicalPool);
      break;
    }
    case events.swaps.swapExactAmountOut.name: {
      await saveAccounts(store);
      const res = await swapExactAmountOut(store, block, event);
      if (!res) break;
      assetHistory.push(...res.historicalAssets);
      swapHistory.push(res.historicalSwap);
      if (res.historicalPool) poolHistory.push(res.historicalPool);
      break;
    }
  }
};

const mapSystem = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.system.extrinsicFailed.name: {
      if (block.height >= 588249) break;
      const hab = await systemExtrinsicFailed(block, event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.system.extrinsicSuccess.name: {
      if (block.height >= 588249) break;
      const hab = await systemExtrinsicSuccess(block, event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.system.newAccount.name: {
      await systemNewAccount(store, block, event);
      break;
    }
  }
};

const mapTokens = async (store: Store, block: Block, event: Event) => {
  switch (event.name) {
    case events.tokens.balanceSet.name: {
      await saveAccounts(store);
      await tokensBalanceSet(store, block, event);
      break;
    }
    case events.tokens.deposited.name: {
      const hab = await tokensDeposited(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.tokens.reserved.name: {
      const hab = await tokensReserved(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.tokens.transfer.name: {
      const habs = await tokensTransfer(block, event);
      await storeBalanceChanges(habs);
      break;
    }
    case events.tokens.withdrawn.name: {
      const hab = await tokensWithdrawn(block, event);
      await storeBalanceChanges([hab]);
      break;
    }
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
    await store.save(assetHistory);
  }
  if (balanceHistory.length > 0) {
    console.log(`Saving historical account balances: ${JSON.stringify(balanceHistory, null, 2)}`);
    await store.save(balanceHistory);
  }
  if (poolHistory.length > 0) {
    console.log(`Saving historical pools: ${JSON.stringify(poolHistory, null, 2)}`);
    await store.save(poolHistory);
  }
  if (swapHistory.length > 0) {
    console.log(`Saving historical swaps: ${JSON.stringify(swapHistory, null, 2)}`);
    await store.save(swapHistory);
  }
};
