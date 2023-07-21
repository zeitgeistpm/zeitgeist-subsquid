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
import {
  balancesBalanceSet,
  balancesDeposit,
  balancesDustLost,
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
import { tokensBalanceSet, tokensDeposited, tokensTransfer, tokensWithdrawn } from './mappings/tokens';
import { Account, AccountBalance, HistoricalAccountBalance } from './model';
import { resolveMarket } from './mappings/postHooks/marketResolved';
import { specVersion } from './mappings/helper';

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
  .addEvent('Balances.BalanceSet', eventExtrinsicOptions)
  .addEvent('Balances.Deposit', eventExtrinsicOptions)
  .addEvent('Balances.DustLost', eventExtrinsicOptions)
  .addEvent('Balances.Reserved', eventExtrinsicOptions)
  .addEvent('Balances.Transfer', eventExtrinsicOptions)
  .addEvent('Balances.Unreserved', eventExtrinsicOptions)
  .addEvent('Balances.Withdraw', eventExtrinsicOptions)
  .addEvent('Currency.Transferred', eventExtrinsicOptions)
  .addEvent('Currency.Deposited', eventExtrinsicOptions)
  .addEvent('Currency.Withdrawn', eventExtrinsicOptions)
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
    case 'Swaps.PoolActive':
      return poolActive(ctx, block, item);
    case 'Swaps.PoolClosed':
      return poolClosed(ctx, block, item);
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
  let balanceAccounts = new Map<string, bigint>();
  let balanceHistory: HistoricalAccountBalance[] = [];

  for (let block of ctx.blocks) {
    for (let item of block.items) {
      // @ts-ignore
      if (item.kind === 'call' && item.call.success && block.header.height < 1089818) {
        // @ts-ignore
        if (item.name === 'PredictionMarkets.redeem_shares') {
          await saveBalanceChanges(ctx, balanceAccounts);
          balanceAccounts.clear();
          await redeemSharesCall(ctx, block.header, item);
        }
        // @ts-ignore
        if (item.name === 'Swaps.pool_exit') {
          await saveBalanceChanges(ctx, balanceAccounts);
          balanceAccounts.clear();
          await poolExitCall(ctx, block.header, item);
        }
      }

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
          case 'Currency.Transferred': {
            const res = await currencyTransferred(ctx, block.header, item);
            if (res) {
              const fromKey = makeKey(res.fromHab.accountId, res.fromHab.assetId);
              const toKey = makeKey(res.toHab.accountId, res.toHab.assetId);
              balanceAccounts.set(fromKey, (balanceAccounts.get(fromKey) || BigInt(0)) + res.fromHab.dBalance);
              balanceAccounts.set(toKey, (balanceAccounts.get(toKey) || BigInt(0)) + res.toHab.dBalance);
              balanceHistory.push(res.fromHab);
              balanceHistory.push(res.toHab);
            }
            break;
          }
          case 'Currency.Deposited': {
            const hab = await currencyDeposited(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Currency.Withdrawn': {
            const hab = await currencyWithdrawn(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'ParachainStaking.Rewarded': {
            if (specVersion(block.header.specId) < 33) {
              const hab = await parachainStakingRewarded(ctx, block.header, item);
              const key = makeKey(hab.accountId, hab.assetId);
              balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
              balanceHistory.push(hab);
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
            if (habs) {
              await Promise.all(
                habs.map(async (hab) => {
                  const key = makeKey(hab.accountId, hab.assetId);
                  balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
                  balanceHistory.push(hab);
                })
              );
            }
            break;
          }
          case 'PredictionMarkets.MarketResolved': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await marketResolved(ctx, block.header, item);
            break;
          }
          case 'PredictionMarkets.SoldCompleteSet': {
            const habs = await soldCompleteSet(ctx, block.header, item);
            if (habs) {
              await Promise.all(
                habs.map(async (hab) => {
                  const key = makeKey(hab.accountId, hab.assetId);
                  balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
                  balanceHistory.push(hab);
                })
              );
            }
            break;
          }
          case 'PredictionMarkets.TokensRedeemed': {
            const hab = await tokensRedeemed(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Swaps.ArbitrageBuyBurn': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await arbitrageBuyBurn(ctx, block.header, item);
            break;
          }
          case 'Swaps.ArbitrageMintSell': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await arbitrageMintSell(ctx, block.header, item);
            break;
          }
          case 'Swaps.PoolCreate': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await poolCreate(ctx, block.header, item);
            break;
          }
          case 'Swaps.PoolDestroyed': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await poolDestroyed(ctx, block.header, item);
            break;
          }
          case 'Swaps.PoolExit': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await poolExit(ctx, block.header, item);
            break;
          }
          case 'Swaps.PoolExitWithExactAssetAmount': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await poolExitWithExactAssetAmount(ctx, block.header, item);
            break;
          }
          case 'Swaps.PoolJoin': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await poolJoin(ctx, block.header, item);
            break;
          }
          case 'Swaps.PoolJoinWithExactAssetAmount': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await poolJoinWithExactAssetAmount(ctx, block.header, item);
            break;
          }
          case 'Swaps.SwapExactAmountIn': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await swapExactAmountIn(ctx, block.header, item);
            break;
          }
          case 'Swaps.SwapExactAmountOut': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await swapExactAmountOut(ctx, block.header, item);
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
          case 'Tokens.BalanceSet': {
            await saveBalanceChanges(ctx, balanceAccounts);
            balanceAccounts.clear();
            await tokensBalanceSet(ctx, block.header, item);
            break;
          }
          case 'Tokens.Deposited': {
            const hab = await tokensDeposited(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
            break;
          }
          case 'Tokens.Transfer': {
            const res = await tokensTransfer(ctx, block.header, item);
            const fromKey = makeKey(res.fromHab.accountId, res.fromHab.assetId);
            const toKey = makeKey(res.toHab.accountId, res.toHab.assetId);
            balanceAccounts.set(fromKey, (balanceAccounts.get(fromKey) || BigInt(0)) + res.fromHab.dBalance);
            balanceAccounts.set(toKey, (balanceAccounts.get(toKey) || BigInt(0)) + res.toHab.dBalance);
            balanceHistory.push(res.fromHab);
            balanceHistory.push(res.toHab);
            break;
          }
          case 'Tokens.Withdrawn': {
            const hab = await tokensWithdrawn(ctx, block.header, item);
            const key = makeKey(hab.accountId, hab.assetId);
            balanceAccounts.set(key, (balanceAccounts.get(key) || BigInt(0)) + hab.dBalance);
            balanceHistory.push(hab);
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
        await saveBalanceChanges(ctx, balanceAccounts);
        balanceAccounts.clear();
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
      if (!ab && assetId === 'Ztg') return;
      if (ab) {
        ab.balance = ab.balance + amount;
      } else {
        const acc = await ctx.store.get(Account, { where: { accountId: walletId } });
        if (!acc) return;

        ab = new AccountBalance();
        ab.id = walletId + '-' + assetId;
        ab.account = acc;
        ab.assetId = assetId;
        ab.balance = amount;
      }
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
