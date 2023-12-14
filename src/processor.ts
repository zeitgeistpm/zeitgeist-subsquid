import {
  BatchContext,
  BatchProcessorCallItem,
  BatchProcessorEventItem,
  BatchProcessorItem,
  SubstrateBatchProcessor,
  SubstrateBlock,
} from '@subsquid/substrate-processor';
import {
  CallItem as _CallItem,
  EventItem as _EventItem,
} from '@subsquid/substrate-processor/lib/interfaces/dataSelection';
import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
import { authorityReported } from './mappings/authorized';
import { assetTxPaymentAssetTxFeePaidEvent } from './mappings/assetTxPayment';
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
import { currencyTransferred, currencyDeposited, currencyWithdrawn } from './mappings/currency';
import { initBalance, specVersion } from './mappings/helper';
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
  unreserveBalances_108949,
  unreserveBalances_155917,
  unreserveBalances_168378,
  unreserveBalances_175178,
  unreserveBalances_176408,
  unreserveBalances_178290,
  unreserveBalances_179524,
  unreserveBalances_184820,
  unreserveBalances_204361,
  unreserveBalances_211391,
  unreserveBalances_92128,
} from './mappings/postHooks/balancesUnreserved';
import { destroyMarkets } from './mappings/postHooks/marketDestroyed';
import { resolveMarket } from './mappings/postHooks/marketResolved';
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
  redeemSharesCall,
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

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`);

const callRangeOptions = {
  range: { from: 0, to: 1089818 },
} as const;

const eventOptions = {
  data: {
    event: {
      args: true,
    },
  },
} as const;

const eventExtrinsicOptions = {
  data: {
    event: {
      args: true,
      extrinsic: true,
    },
  },
} as const;

const eventRangeOptions = {
  range: { from: 0, to: 588249 },
  data: {
    event: {
      args: true,
      extrinsic: true,
    },
  },
} as const;

// @ts-ignore
const processor = new SubstrateBatchProcessor()
  .setDataSource({
    archive: process.env.INDEXER_ENDPOINT_URL ?? 'https://indexer.zeitgeist.pm/graphql',
    chain: process.env.WS_NODE_URL ?? 'wss://bsr.zeitgeist.pm',
  })
  .setTypesBundle('typesBundle.json')
  .addEvent('Authorized.AuthorityReported', eventOptions)
  .addEvent('AssetTxPayment.AssetTxFeePaid', eventExtrinsicOptions)
  .addEvent('Balances.BalanceSet', eventExtrinsicOptions)
  .addEvent('Balances.Deposit', eventExtrinsicOptions)
  .addEvent('Balances.DustLost', eventExtrinsicOptions)
  .addEvent('Balances.Reserved', eventExtrinsicOptions)
  .addEvent('Balances.ReserveRepatriated', eventExtrinsicOptions)
  .addEvent('Balances.Transfer', eventExtrinsicOptions)
  .addEvent('Balances.Unreserved', eventExtrinsicOptions)
  .addEvent('Balances.Withdraw', eventExtrinsicOptions)
  .addEvent('Court.MintedInCourt', eventOptions)
  .addEvent('Currency.Transferred', eventExtrinsicOptions)
  .addEvent('Currency.Deposited', eventExtrinsicOptions)
  .addEvent('Currency.Withdrawn', eventExtrinsicOptions)
  .addEvent('NeoSwaps.BuyExecuted', eventExtrinsicOptions)
  .addEvent('NeoSwaps.ExitExecuted', eventOptions)
  .addEvent('NeoSwaps.FeesWithdrawn', eventOptions)
  .addEvent('NeoSwaps.JoinExecuted', eventOptions)
  .addEvent('NeoSwaps.PoolDeployed', eventOptions)
  .addEvent('NeoSwaps.SellExecuted', eventExtrinsicOptions)
  .addEvent('ParachainStaking.Rewarded', eventOptions)
  .addEvent('PredictionMarkets.BoughtCompleteSet', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.GlobalDisputeStarted', eventOptions)
  .addEvent('PredictionMarkets.MarketApproved', eventOptions)
  .addEvent('PredictionMarkets.MarketClosed', eventOptions)
  .addEvent('PredictionMarkets.MarketCreated', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.MarketDestroyed', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.MarketDisputed', eventOptions)
  .addEvent('PredictionMarkets.MarketExpired', eventOptions)
  .addEvent('PredictionMarkets.MarketInsufficientSubsidy', eventOptions)
  .addEvent('PredictionMarkets.MarketRejected', eventOptions)
  .addEvent('PredictionMarkets.MarketReported', eventOptions)
  .addEvent('PredictionMarkets.MarketResolved', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.MarketStartedWithSubsidy', eventOptions)
  .addEvent('PredictionMarkets.SoldCompleteSet', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.TokensRedeemed', eventExtrinsicOptions)
  .addEvent('Styx.AccountCrossed', eventExtrinsicOptions)
  .addEvent('Swaps.ArbitrageBuyBurn', eventOptions)
  .addEvent('Swaps.ArbitrageMintSell', eventOptions)
  .addEvent('Swaps.MarketCreatorFeesPaid', eventOptions)
  .addEvent('Swaps.PoolActive', eventOptions)
  .addEvent('Swaps.PoolClosed', eventOptions)
  .addEvent('Swaps.PoolCreate', eventOptions)
  .addEvent('Swaps.PoolDestroyed', eventExtrinsicOptions)
  .addEvent('Swaps.PoolExit', eventOptions)
  .addEvent('Swaps.PoolExitWithExactAssetAmount', eventOptions)
  .addEvent('Swaps.PoolJoin', eventOptions)
  .addEvent('Swaps.PoolJoinWithExactAssetAmount', eventOptions)
  .addEvent('Swaps.SwapExactAmountIn', eventExtrinsicOptions)
  .addEvent('Swaps.SwapExactAmountOut', eventExtrinsicOptions)
  .addEvent('System.NewAccount', eventExtrinsicOptions)
  .addEvent('Tokens.BalanceSet', eventExtrinsicOptions)
  .addEvent('Tokens.Deposited', eventExtrinsicOptions)
  .addEvent('Tokens.Reserved', eventExtrinsicOptions)
  .addEvent('Tokens.Transfer', eventExtrinsicOptions)
  .addEvent('Tokens.Withdrawn', eventExtrinsicOptions);

if (process.env.WS_NODE_URL?.includes(`bs`)) {
  // @ts-ignore
  processor.addCall('PredictionMarkets.redeem_shares', callRangeOptions);
  // @ts-ignore
  processor.addCall('Swaps.pool_exit', callRangeOptions);
  // @ts-ignore
  processor.addEvent('System.ExtrinsicFailed', eventRangeOptions);
  // @ts-ignore
  processor.addEvent('System.ExtrinsicSuccess', eventRangeOptions);
}

export type Item = BatchProcessorItem<typeof processor>;
export type Ctx = BatchContext<Store, Item>;
export type CallItem = Exclude<BatchProcessorCallItem<typeof processor>, _CallItem<'*', false>>;
export type EventItem = Exclude<BatchProcessorEventItem<typeof processor>, _EventItem<'*', false>>;

const handleEvents = async (ctx: Ctx, block: SubstrateBlock, item: Item) => {
  switch (item.name) {
    case 'Authorized.AuthorityReported':
      return authorityReported(ctx, block, item);
    case 'PredictionMarkets.GlobalDisputeStarted':
      return globalDisputeStarted(ctx, block, item);
    case 'PredictionMarkets.MarketApproved':
      return marketApproved(ctx, block, item);
    case 'PredictionMarkets.MarketClosed':
      return marketClosed(ctx, block, item);
    case 'PredictionMarkets.MarketCreated':
      return marketCreated(ctx, block, item);
    case 'PredictionMarkets.MarketDestroyed':
      return marketDestroyed(ctx, block, item);
    case 'PredictionMarkets.MarketDisputed':
      return marketDisputed(ctx, block, item);
    case 'PredictionMarkets.MarketExpired':
      return marketExpired(ctx, block, item);
    case 'PredictionMarkets.MarketInsufficientSubsidy':
      return marketInsufficientSubsidy(ctx, block, item);
    case 'PredictionMarkets.MarketRejected':
      return marketRejected(ctx, block, item);
    case 'PredictionMarkets.MarketReported':
      return marketReported(ctx, block, item);
    case 'PredictionMarkets.MarketStartedWithSubsidy':
      return marketStartedWithSubsidy(ctx, block, item);
    case 'Styx.AccountCrossed':
      return accountCrossed(ctx, block, item);
    case 'System.NewAccount':
      return systemNewAccount(ctx, block, item);
  }
};

const handlePostHooks = async (ctx: Ctx, block: SubstrateBlock) => {
  switch (block.height) {
    case 35683:
      return resolveMarket(ctx, block, 21, '0');
    case 49326:
      return resolveMarket(ctx, block, 60, '1');
    case 72589:
      return resolveMarket(ctx, block, 1, '0');
    case 72601:
      return resolveMarket(ctx, block, 2, '2');
    case 72609:
      return resolveMarket(ctx, block, 3, '2');
    case 78711:
      return resolveMarket(ctx, block, 4, '1');
    case 82291:
      return resolveMarket(ctx, block, 69, '2');
    case 92128:
      await unreserveBalances_92128(ctx, block);
      await resolveMarket(ctx, block, 71, '2');
      return;
    case 93884:
      return resolveMarket(ctx, block, 23, '0');
    case 107221:
      return resolveMarket(ctx, block, 96, '0');
    case 108949:
      await unreserveBalances_108949(ctx, block);
      await resolveMarket(ctx, block, 79, '1');
      return;
    case 122516:
      return resolveMarket(ctx, block, 98, '0');
    case 122186:
      return resolveMarket(ctx, block, 5, '1');
    case 128525:
      return resolveMarket(ctx, block, 99, '0');
    case 114289:
      return resolveMarket(ctx, block, 97, '1');
    case 133189:
      return resolveMarket(ctx, block, 150, '1');
    case 133996:
      return resolveMarket(ctx, block, 6, '1');
    case 134565:
      return resolveMarket(ctx, block, 149, '1');
    case 155917:
      await unreserveBalances_155917(ctx, block);
      await resolveMarket(ctx, block, 129, '0');
      return;
    case 164057:
      return resolveMarket(ctx, block, 169, '1');
    case 167323:
      return resolveMarket(ctx, block, 224, '2');
    case 168378:
      await unreserveBalances_168378(ctx, block);
      await resolveMarket(ctx, block, 167, '0');
      return;
    case 168726:
      return resolveMarket(ctx, block, 7, '0');
    case 175178:
      await unreserveBalances_175178(ctx, block);
      await resolveMarket(ctx, block, 155, '0');
      return;
    case 176396:
      return resolveMarket(ctx, block, 224, '0');
    case 176408:
      await unreserveBalances_176408(ctx, block);
      await resolveMarket(ctx, block, 56, '2');
      return;
    case 178290:
      await unreserveBalances_178290(ctx, block);
      await resolveMarket(ctx, block, 222, '1');
      return;
    case 179524:
      await unreserveBalances_179524(ctx, block);
      await resolveMarket(ctx, block, 22, '1');
      return;
    case 182096:
      return resolveMarket(ctx, block, 14, '1');
    case 184820:
      await unreserveBalances_184820(ctx, block);
      await resolveMarket(ctx, block, 15, '1');
      return;
    case 204361:
      await unreserveBalances_204361(ctx, block);
      await resolveMarket(ctx, block, 176, '0');
      return;
    case 206797:
      return resolveMarket(ctx, block, 264, '1');
    case 211391:
      await unreserveBalances_211391(ctx, block);
      await resolveMarket(ctx, block, 317, '1');
      return;
    case 579140:
      return destroyMarkets(ctx, block);
  }
};

const makeKey = (walletId: string, assetId: string): string => {
  return walletId + '|' + assetId;
};

// @ts-ignore
processor.run(new TypeormDatabase(), async (ctx) => {
  const balanceAccounts = new Map<string, bigint>();
  const assetHistory: HistoricalAsset[] = [];
  const balanceHistory: HistoricalAccountBalance[] = [];
  const poolHistory: HistoricalPool[] = [];
  const swapHistory: HistoricalSwap[] = [];

  for (let block of ctx.blocks) {
    for (let item of block.items) {
      // @ts-ignore
      if (item.kind === 'call' && item.call.success && block.header.height < 1089818) {
        // @ts-ignore
        if (item.name === 'PredictionMarkets.redeem_shares') {
          await saveAccounts(ctx);
          await redeemSharesCall(ctx, block.header, item);
        }
        // @ts-ignore
        if (item.name === 'Swaps.pool_exit') {
          await saveAccounts(ctx);
          await poolExitCall(ctx, block.header, item);
        }
      }

      if (item.kind === 'event') {
        switch (item.name) {
          case 'AssetTxPayment.AssetTxFeePaid': {
            const habs = await assetTxPaymentAssetTxFeePaidEvent(ctx, block.header, item);
            if (!habs) break;
            await storeBalanceChanges(habs);
            break;
          }
          case 'Balances.BalanceSet': {
            await saveAccounts(ctx);
            await balancesBalanceSet(ctx, block.header, item);
            break;
          }
          case 'Balances.Deposit': {
            const hab = await balancesDeposit(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Balances.DustLost': {
            const hab = await balancesDustLost(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Balances.Reserved': {
            const hab = await balancesReserved(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Balances.ReserveRepatriated': {
            const hab = await balancesReserveRepatriated(ctx, block.header, item);
            if (!hab) break;
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Balances.Transfer': {
            const habs = await balancesTransfer(ctx, block.header, item);
            await storeBalanceChanges(habs);
            break;
          }
          case 'Balances.Unreserved': {
            const hab = await balancesUnreserved(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Balances.Withdraw': {
            const hab = await balancesWithdraw(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Court.MintedInCourt': {
            const hab = balanceHistory.pop();
            if (hab && hab.event === 'Deposit') {
              hab.id = item.event.id + hab.id.slice(-6);
              hab.event = item.event.name.split('.')[1];
              balanceHistory.push(hab);
            }
            break;
          }
          case 'Currency.Transferred': {
            const habs = await currencyTransferred(ctx, block.header, item);
            if (!habs) break;
            await storeBalanceChanges(habs);
            break;
          }
          case 'Currency.Deposited': {
            const hab = await currencyDeposited(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Currency.Withdrawn': {
            const hab = await currencyWithdrawn(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'NeoSwaps.BuyExecuted': {
            await saveAccounts(ctx);
            const res = await buyExecuted(ctx, block.header, item);
            if (!res) break;
            assetHistory.push(...res.historicalAssets);
            swapHistory.push(res.historicalSwap);
            poolHistory.push(res.historicalPool);
            break;
          }
          case 'NeoSwaps.ExitExecuted': {
            await saveAccounts(ctx);
            const historicalAssets = await exitExecuted(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'NeoSwaps.FeesWithdrawn': {
            const historicalPool = await feesWithdrawn(ctx, block.header, item);
            if (!historicalPool) break;
            poolHistory.push(historicalPool);
            break;
          }
          case 'NeoSwaps.JoinExecuted': {
            await saveAccounts(ctx);
            const historicalAssets = await joinExecuted(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'NeoSwaps.PoolDeployed': {
            await saveAccounts(ctx);
            const res = await poolDeployed(ctx, block.header, item);
            if (!res) break;
            assetHistory.push(...res.historicalAssets);
            poolHistory.push(res.historicalPool);
            break;
          }
          case 'NeoSwaps.SellExecuted': {
            await saveAccounts(ctx);
            const res = await sellExecuted(ctx, block.header, item);
            if (!res) break;
            assetHistory.push(...res.historicalAssets);
            swapHistory.push(res.historicalSwap);
            poolHistory.push(res.historicalPool);
            break;
          }
          case 'ParachainStaking.Rewarded': {
            if (specVersion(block.header.specId) < 33) {
              const hab = await parachainStakingRewarded(ctx, block.header, item);
              await storeBalanceChanges([hab]);
              break;
            }
            // Since specVersion:33, Balances.Deposit is always emitted with ParachainStaking.Rewarded
            // To avoid redundant addition, DepositEvent is being utilised for recording rewards
            const hab = balanceHistory.pop();
            if (hab && hab.event === 'Deposit') {
              hab.id = item.event.id + hab.id.slice(-6);
              hab.event = item.event.name.split('.')[1];
              balanceHistory.push(hab);
            }
            break;
          }
          case 'PredictionMarkets.BoughtCompleteSet': {
            const habs = await boughtCompleteSet(ctx, block.header, item);
            if (!habs) break;
            await storeBalanceChanges(habs);
            break;
          }
          case 'PredictionMarkets.MarketResolved': {
            await saveAccounts(ctx);
            await marketResolved(ctx, block.header, item);
            break;
          }
          case 'PredictionMarkets.SoldCompleteSet': {
            const habs = await soldCompleteSet(ctx, block.header, item);
            if (!habs) break;
            await storeBalanceChanges(habs);
            break;
          }
          case 'PredictionMarkets.TokensRedeemed': {
            const hab = await tokensRedeemed(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Swaps.PoolActive': {
            const hp = await poolActive(ctx, block.header, item);
            if (!hp) break;
            poolHistory.push(hp);
            break;
          }
          case 'Swaps.ArbitrageBuyBurn': {
            await saveAccounts(ctx);
            const historicalAssets = await arbitrageBuyBurn(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'Swaps.ArbitrageMintSell': {
            await saveAccounts(ctx);
            const historicalAssets = await arbitrageMintSell(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'Swaps.MarketCreatorFeesPaid': {
            const newHabs: HistoricalAccountBalance[] = [];
            for (let i = 0; i < 2; i++) {
              const hab = balanceHistory.pop();
              if (hab && hab.event === 'Transfer') {
                hab.id = item.event.id + hab.id.slice(-6);
                hab.event = item.event.name.split('.')[1];
                newHabs.push(hab);
              }
            }
            balanceHistory.push(...newHabs);
            break;
          }
          case 'Swaps.PoolClosed': {
            const hp = await poolClosed(ctx, block.header, item);
            if (!hp) break;
            poolHistory.push(hp);
            break;
          }
          case 'Swaps.PoolCreate': {
            await saveAccounts(ctx);
            const res = await poolCreate(ctx, block.header, item);
            if (!res) break;
            assetHistory.push(...res.historicalAssets);
            poolHistory.push(res.historicalPool);
            break;
          }
          case 'Swaps.PoolDestroyed': {
            await saveAccounts(ctx);
            const res = await poolDestroyed(ctx, block.header, item);
            if (!res) break;
            await storeBalanceChanges(res.historicalAccountBalances);
            assetHistory.push(...res.historicalAssets);
            poolHistory.push(res.historicalPool);
            break;
          }
          case 'Swaps.PoolExit': {
            await saveAccounts(ctx);
            const historicalAssets = await poolExit(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'Swaps.PoolExitWithExactAssetAmount': {
            await saveAccounts(ctx);
            const historicalAssets = await poolExitWithExactAssetAmount(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'Swaps.PoolJoin': {
            await saveAccounts(ctx);
            const historicalAssets = await poolJoin(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'Swaps.PoolJoinWithExactAssetAmount': {
            await saveAccounts(ctx);
            const historicalAssets = await poolJoinWithExactAssetAmount(ctx, block.header, item);
            if (!historicalAssets) break;
            assetHistory.push(...historicalAssets);
            break;
          }
          case 'Swaps.SwapExactAmountIn': {
            await saveAccounts(ctx);
            const res = await swapExactAmountIn(ctx, block.header, item);
            if (!res) break;
            assetHistory.push(...res.historicalAssets);
            swapHistory.push(res.historicalSwap);
            if (res.historicalPool) poolHistory.push(res.historicalPool);
            break;
          }
          case 'Swaps.SwapExactAmountOut': {
            await saveAccounts(ctx);
            const res = await swapExactAmountOut(ctx, block.header, item);
            if (!res) break;
            assetHistory.push(...res.historicalAssets);
            swapHistory.push(res.historicalSwap);
            if (res.historicalPool) poolHistory.push(res.historicalPool);
            break;
          }
          // @ts-ignore
          case 'System.ExtrinsicFailed': {
            const hab = await systemExtrinsicFailed(ctx, block.header, item);
            if (!hab) break;
            await storeBalanceChanges([hab]);
            break;
          }
          // @ts-ignore
          case 'System.ExtrinsicSuccess': {
            const hab = await systemExtrinsicSuccess(ctx, block.header, item);
            if (!hab) break;
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Tokens.BalanceSet': {
            await saveAccounts(ctx);
            await tokensBalanceSet(ctx, block.header, item);
            break;
          }
          case 'Tokens.Deposited': {
            const hab = await tokensDeposited(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Tokens.Reserved': {
            const hab = await tokensReserved(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          case 'Tokens.Transfer': {
            const habs = await tokensTransfer(ctx, block.header, item);
            await storeBalanceChanges(habs);
            break;
          }
          case 'Tokens.Withdrawn': {
            const hab = await tokensWithdrawn(ctx, block.header, item);
            await storeBalanceChanges([hab]);
            break;
          }
          default: {
            await handleEvents(ctx, block.header, item);
            break;
          }
        }
      }
    }
    if (process.env.WS_NODE_URL?.includes(`bs`)) {
      if (block.header.height < 215000 || block.header.height === 579140) {
        await saveAccounts(ctx);
        await handlePostHooks(ctx, block.header);
      }
    }
  }

  await saveAccounts(ctx);
  await saveHistory(ctx);
});

const storeBalanceChanges = async (habs: HistoricalAccountBalance[]) => {
  await Promise.all(
    habs.map(async (hab) => {
      const assetBalance = accounts.get(hab.accountId) ?? new Map<string, bigint>();
      assetBalance.set(hab.assetId, (assetBalance.get(hab.assetId) || BigInt(0)) + hab.dBalance);
      accounts.set(hab.accountId, assetBalance);
      balanceHistory.push(hab);
    })
  );
};

const saveAccounts = async (ctx: Ctx) => {
  await Promise.all(
    Array.from(accounts).map(async ([accountId, assetAmounts]) => {
      let account = await ctx.store.get(Account, { where: { accountId } });
      if (!account) {
        account = new Account({
          accountId,
          id: accountId,
        });
        console.log(`Saving account: ${JSON.stringify(account, null, 2)}`);
        await ctx.store.save<Account>(account);
        await initBalance(account, ctx.store);
      }

      await Promise.all(
        Array.from(assetAmounts).map(async ([assetId, amount]) => {
          let ab = await ctx.store.findOneBy(AccountBalance, {
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
          await ctx.store.save<AccountBalance>(ab);
        })
      );
    })
  );
  accounts.clear();
};

const saveAssetHistory = async (ctx: Ctx, assetHistory: HistoricalAsset[]) => {
  if (assetHistory.length === 0) return;
  console.log(`Saving historical assets: ${JSON.stringify(assetHistory, null, 2)}`);
  await ctx.store.save(assetHistory);
};

const saveBalanceHistory = async (ctx: Ctx, balanceHistory: HistoricalAccountBalance[]) => {
  if (balanceHistory.length === 0) return;
  console.log(`Saving historical account balances: ${JSON.stringify(balanceHistory, null, 2)}`);
  await ctx.store.save(balanceHistory);
};

const savePoolHistory = async (ctx: Ctx, poolHistory: HistoricalPool[]) => {
  if (poolHistory.length === 0) return;
  console.log(`Saving historical pools: ${JSON.stringify(poolHistory, null, 2)}`);
  await ctx.store.save(poolHistory);
};

const saveSwapHistory = async (ctx: Ctx, swapHistory: HistoricalSwap[]) => {
  if (swapHistory.length === 0) return;
  console.log(`Saving historical swaps: ${JSON.stringify(swapHistory, null, 2)}`);
  await ctx.store.save(swapHistory);
};
