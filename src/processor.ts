import {
  BatchContext,
  BatchProcessorEventItem,
  BatchProcessorItem,
  SubstrateBatchProcessor,
  SubstrateBlock,
} from '@subsquid/substrate-processor';
import { EventItem as _EventItem } from '@subsquid/substrate-processor/lib/interfaces/dataSelection';
import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
import {
  balancesBalanceSet,
  balancesDeposit,
  balancesDustLost,
  balancesEndowed,
  balancesReserved,
  balancesTransfer,
  balancesUnreserved,
  balancesWithdraw,
} from './mappings/balances';
import { currencyTransferred, currencyDeposited, currencyWithdrawn } from './mappings/currency';
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
import {
  boughtCompleteSet,
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
  poolExitWithExactAssetAmount,
  poolJoin,
  poolJoinWithExactAssetAmount,
  swapExactAmountIn,
  swapExactAmountOut,
} from './mappings/swaps';
import { systemExtrinsicFailed, systemExtrinsicSuccess, systemNewAccount } from './mappings/system';
import { tokensBalanceSet, tokensDeposited, tokensEndowed, tokensTransfer, tokensWithdrawn } from './mappings/tokens';
import { AccountBalance, HistoricalAccountBalance } from './model';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`);

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
  .addEvent('Balances.BalanceSet', eventOptions)
  .addEvent('Balances.Deposit', eventOptions)
  .addEvent('Balances.DustLost', eventOptions)
  .addEvent('Balances.Reserved', eventOptions)
  .addEvent('Balances.Transfer', eventOptions)
  .addEvent('Balances.Unreserved', eventOptions)
  .addEvent('Balances.Withdraw', eventOptions)
  .addEvent('Currency.Transferred', eventOptions)
  .addEvent('Currency.Deposited', eventOptions)
  .addEvent('Currency.Withdrawn', eventOptions)
  .addEvent('PredictionMarkets.BoughtCompleteSet', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.MarketApproved', eventOptions)
  .addEvent('PredictionMarkets.MarketClosed', eventOptions)
  .addEvent('PredictionMarkets.MarketCreated', eventOptions)
  .addEvent('PredictionMarkets.MarketDestroyed', eventOptions)
  .addEvent('PredictionMarkets.MarketDisputed', eventOptions)
  .addEvent('PredictionMarkets.MarketExpired', eventOptions)
  .addEvent('PredictionMarkets.MarketInsufficientSubsidy', eventOptions)
  .addEvent('PredictionMarkets.MarketRejected', eventOptions)
  .addEvent('PredictionMarkets.MarketReported', eventOptions)
  .addEvent('PredictionMarkets.MarketResolved', eventOptions)
  .addEvent('PredictionMarkets.MarketStartedWithSubsidy', eventOptions)
  .addEvent('PredictionMarkets.SoldCompleteSet', eventExtrinsicOptions)
  .addEvent('PredictionMarkets.TokensRedeemed', eventOptions)
  .addEvent('Styx.AccountCrossed', eventOptions)
  .addEvent('Swaps.ArbitrageBuyBurn', eventOptions)
  .addEvent('Swaps.ArbitrageMintSell', eventOptions)
  .addEvent('Swaps.PoolActive', eventOptions)
  .addEvent('Swaps.PoolClosed', eventOptions)
  .addEvent('Swaps.PoolCreate', eventOptions)
  .addEvent('Swaps.PoolDestroyed', eventOptions)
  .addEvent('Swaps.PoolExit', eventOptions)
  .addEvent('Swaps.PoolExitWithExactAssetAmount', eventOptions)
  .addEvent('Swaps.PoolJoin', eventOptions)
  .addEvent('Swaps.PoolJoinWithExactAssetAmount', eventOptions)
  .addEvent('Swaps.SwapExactAmountIn', eventExtrinsicOptions)
  .addEvent('Swaps.SwapExactAmountOut', eventExtrinsicOptions)
  .addEvent('System.NewAccount', eventOptions)
  .addEvent('Tokens.BalanceSet', eventOptions)
  .addEvent('Tokens.Deposited', eventOptions)
  .addEvent('Tokens.Endowed', eventOptions)
  .addEvent('Tokens.Transfer', eventOptions)
  .addEvent('Tokens.Withdrawn', eventOptions);

if (process.env.WS_NODE_URL?.includes(`bs`)) {
  // @ts-ignore
  processor.addEvent('ParachainStaking.Rewarded', eventRangeOptions);
  // @ts-ignore
  processor.addEvent('System.ExtrinsicFailed', eventRangeOptions);
  // @ts-ignore
  processor.addEvent('System.ExtrinsicSuccess', eventRangeOptions);
}

export type Item = BatchProcessorItem<typeof processor>;
export type Ctx = BatchContext<Store, Item>;
export type EventItem = Exclude<BatchProcessorEventItem<typeof processor>, _EventItem<'*', false>>;

const handleEvents = async (ctx: Ctx, block: SubstrateBlock, item: Item) => {
  switch (item.name) {
    case 'Currency.Transferred':
      return currencyTransferred(ctx, block, item);
    case 'Currency.Deposited':
      return currencyDeposited(ctx, block, item);
    case 'Currency.Withdrawn':
      return currencyWithdrawn(ctx, block, item);
    case 'PredictionMarkets.BoughtCompleteSet':
      return boughtCompleteSet(ctx, block, item);
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
    case 'PredictionMarkets.MarketResolved':
      return marketResolved(ctx, block, item);
    case 'PredictionMarkets.MarketStartedWithSubsidy':
      return marketStartedWithSubsidy(ctx, block, item);
    case 'PredictionMarkets.SoldCompleteSet':
      return soldCompleteSet(ctx, block, item);
    case 'PredictionMarkets.TokensRedeemed':
      return tokensRedeemed(ctx, block, item);
    case 'Styx.AccountCrossed':
      return accountCrossed(ctx, block, item);
    case 'Swaps.ArbitrageBuyBurn':
      return arbitrageBuyBurn(ctx, block, item);
    case 'Swaps.ArbitrageMintSell':
      return arbitrageMintSell(ctx, block, item);
    case 'Swaps.PoolActive':
      return poolActive(ctx, block, item);
    case 'Swaps.PoolClosed':
      return poolClosed(ctx, block, item);
    case 'Swaps.PoolCreate':
      return poolCreate(ctx, block, item);
    case 'Swaps.PoolDestroyed':
      return poolDestroyed(ctx, block, item);
    case 'Swaps.PoolExit':
      return poolExit(ctx, block, item);
    case 'Swaps.PoolExitWithExactAssetAmount':
      return poolExitWithExactAssetAmount(ctx, block, item);
    case 'Swaps.PoolJoin':
      return poolJoin(ctx, block, item);
    case 'Swaps.PoolJoinWithExactAssetAmount':
      return poolJoinWithExactAssetAmount(ctx, block, item);
    case 'Swaps.SwapExactAmountIn':
      return swapExactAmountIn(ctx, block, item);
    case 'Swaps.SwapExactAmountOut':
      return swapExactAmountOut(ctx, block, item);
    case 'System.NewAccount':
      return systemNewAccount(ctx, block, item);
    case 'Tokens.BalanceSet':
      return tokensBalanceSet(ctx, block, item);
    case 'Tokens.Deposited':
      return tokensDeposited(ctx, block, item);
    case 'Tokens.Endowed':
      return tokensEndowed(ctx, block, item);
    case 'Tokens.Transfer':
      return tokensTransfer(ctx, block, item);
    case 'Tokens.Withdrawn':
      return tokensWithdrawn(ctx, block, item);
  }
};

const handlePostHooks = async (ctx: Ctx, block: SubstrateBlock) => {
  switch (block.height) {
    case 92128:
      return unreserveBalances_92128(ctx, block);
    case 108949:
      return unreserveBalances_108949(ctx, block);
    case 155917:
      return unreserveBalances_155917(ctx, block);
    case 168378:
      return unreserveBalances_168378(ctx, block);
    case 175178:
      return unreserveBalances_175178(ctx, block);
    case 176408:
      return unreserveBalances_176408(ctx, block);
    case 178290:
      return unreserveBalances_178290(ctx, block);
    case 179524:
      return unreserveBalances_179524(ctx, block);
    case 184820:
      return unreserveBalances_184820(ctx, block);
    case 204361:
      return unreserveBalances_204361(ctx, block);
    case 211391:
      return unreserveBalances_211391(ctx, block);
    case 579140:
      return destroyMarkets(ctx, block);
  }
};

const makeKey = (walletId: string, assetId: string): string => {
  return walletId + '|' + assetId;
};

// @ts-ignore
processor.run(new TypeormDatabase(), async (ctx) => {
  let balanceAccounts = new Map<string, bigint>();
  let balanceHistory: HistoricalAccountBalance[] = [];

  for (let block of ctx.blocks) {
    for (let item of block.items) {
      if (item.kind === 'event') {
        switch (item.name) {
          case 'Balances.BalanceSet': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await balancesBalanceSet(ctx, block.header, item);
            break;
          }
          case 'Balances.Deposit': {
            const hab = await balancesDeposit(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Balances.DustLost': {
            const hab = await balancesDustLost(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Balances.Reserved': {
            const hab = await balancesReserved(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Balances.Transfer': {
            const res = await balancesTransfer(ctx, block.header, item);
            const fromKey = makeKey(res.fromHab.accountId, res.fromHab.assetId);
            const toKey = makeKey(res.toHab.accountId, res.toHab.assetId);
            balanceAccounts.set(fromKey, (balanceAccounts.get(fromKey) || BigInt(0)) + res.fromHab.dBalance);
            balanceAccounts.set(toKey, (balanceAccounts.get(toKey) || BigInt(0)) + res.toHab.dBalance);
            balanceHistory.push(res.fromHab);
            balanceHistory.push(res.toHab);
            break;
          }
          case 'Balances.Unreserved': {
            const hab = await balancesUnreserved(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Balances.Withdraw': {
            const hab = await balancesWithdraw(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          // @ts-ignore
          case 'ParachainStaking.Rewarded': {
            const hab = await parachainStakingRewarded(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          // @ts-ignore
          case 'System.ExtrinsicFailed': {
            const hab = await systemExtrinsicFailed(ctx, block.header, item);
            if (hab) {
              const key = makeKey(hab.accountId, hab.assetId);
              balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
              balanceHistory.push(hab);
            }
            break;
          }
          // @ts-ignore
          case 'System.ExtrinsicSuccess': {
            const hab = await systemExtrinsicSuccess(ctx, block.header, item);
            if (hab) {
              const key = makeKey(hab.accountId, hab.assetId);
              balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
              balanceHistory.push(hab);
            }
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
        await handlePostHooks(ctx, block.header);
      }
    }
  }
  await saveBalanceChanges(ctx, balanceAccounts);
  await saveBalanceHistory(ctx, balanceHistory);
});

const saveBalanceChanges = async (ctx: Ctx, balanceAccounts: Map<string, bigint>) => {
  const balanceAccountsArr = Array.from(balanceAccounts);
  await Promise.all(
    balanceAccountsArr.map(async ([key, amount]) => {
      const [walletId, assetId] = key.split('|');
      let ab = await ctx.store.findOneBy(AccountBalance, {
        account: { accountId: walletId },
        assetId: assetId,
      });
      if (!ab) return;
      ab.balance = ab.balance + amount;
      console.log(`Saving account balance: ${JSON.stringify(ab, null, 2)}`);
      await ctx.store.save<AccountBalance>(ab);
    })
  );
};

const saveBalanceHistory = async (ctx: Ctx, balanceHistory: HistoricalAccountBalance[]) => {
  if (balanceHistory.length === 0) return;
  console.log(`Saving historical account balances: ${JSON.stringify(balanceHistory, null, 2)}`);
  await ctx.store.save(balanceHistory);
};
