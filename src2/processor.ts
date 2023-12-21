import { lookupArchive } from '@subsquid/archive-registry';
import {
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
  DataHandlerContext,
  BlockHeader,
  Event as _Event,
  Extrinsic as _Extrinsic,
} from '@subsquid/substrate-processor';
import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
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
import { parachainStakingRewarded } from './mappings/parachainStaking';
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
import { events } from './types';
import { Pallet, initBalance } from './helper';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`);

export const processor = new SubstrateBatchProcessor()
  .setDataSource({
    chain: 'wss://bsr.zeitgeist.pm',
    archive: lookupArchive('zeitgeist-testnet', { release: 'ArrowSquid' }),
  })
  .addEvent({
    name: [
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
      events.parachainStaking.rewarded.name,
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
export type Ctx = DataHandlerContext<Store, Fields>;
export type Block = BlockHeader<Fields>;
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
    for (let event of block.events) {
      switch (event.name.split('.')[0]) {
        case Pallet.Balances:
          await mapBalances(ctx, block, event);
          break;
        case Pallet.Currency:
          await mapCurrency(block, event);
          break;
        case Pallet.ParachainStaking:
          await mapParachainStaking(block, event);
          break;
        case Pallet.System:
          await mapSystem(ctx, block.header, event);
          break;
        case Pallet.Tokens:
          await mapTokens(ctx, block, event);
          break;
      }
    }
  }
  await saveAccounts(ctx);
  await saveHistory(ctx);
});

const mapBalances = async (ctx: Ctx, block: any, event: Event) => {
  switch (event.name) {
    case events.balances.balanceSet.name: {
      await saveAccounts(ctx);
      await balancesBalanceSet(ctx, block.header, event);
      break;
    }
    case events.balances.deposit.name: {
      const hab = await balancesDeposit(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.dustLost.name: {
      const hab = await balancesDustLost(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.reserveRepatriated.name: {
      const hab = await balancesReserveRepatriated(block.header, event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.reserved.name: {
      const hab = await balancesReserved(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.transfer.name: {
      const habs = await balancesTransfer(block.header, event);
      await storeBalanceChanges(habs);
      break;
    }
    case events.balances.unreserved.name: {
      const hab = await balancesUnreserved(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.balances.withdraw.name: {
      const hab = await balancesWithdraw(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapCurrency = async (block: any, event: Event) => {
  switch (event.name) {
    case events.currency.deposited.name: {
      const hab = await currencyDeposited(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.currency.transferred.name: {
      const habs = await currencyTransferred(block.header, event);
      if (!habs) break;
      await storeBalanceChanges(habs);
      break;
    }
    case events.currency.withdrawn.name: {
      const hab = await currencyWithdrawn(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
  }
};

const mapParachainStaking = async (block: any, event: Event) => {
  switch (event.name) {
    case events.parachainStaking.rewarded.name: {
      if (block.header.specVersion < 33) {
        const hab = await parachainStakingRewarded(block.header, event);
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

const mapSystem = async (ctx: Ctx, block: Block, event: Event) => {
  switch (event.name) {
    case events.system.extrinsicFailed.name: {
      const hab = await systemExtrinsicFailed(block, event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.system.extrinsicSuccess.name: {
      const hab = await systemExtrinsicSuccess(block, event);
      if (!hab) break;
      await storeBalanceChanges([hab]);
      break;
    }
    case events.system.newAccount.name: {
      await systemNewAccount(ctx, block, event);
      break;
    }
  }
};

const mapTokens = async (ctx: Ctx, block: any, event: Event) => {
  switch (event.name) {
    case events.tokens.balanceSet.name: {
      await saveAccounts(ctx);
      await tokensBalanceSet(ctx, block.header, event);
      break;
    }
    case events.tokens.deposited.name: {
      const hab = await tokensDeposited(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.tokens.reserved.name: {
      const hab = await tokensReserved(block.header, event);
      await storeBalanceChanges([hab]);
      break;
    }
    case events.tokens.transfer.name: {
      const habs = await tokensTransfer(block.header, event);
      await storeBalanceChanges(habs);
      break;
    }
    case events.tokens.withdrawn.name: {
      const hab = await tokensWithdrawn(block.header, event);
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

const saveAccounts = async (ctx: Ctx) => {
  await Promise.all(
    Array.from(accounts).map(async ([accountId, balances]) => {
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
        Array.from(balances).map(async ([assetId, amount]) => {
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

const saveHistory = async (ctx: Ctx) => {
  if (assetHistory.length > 0) {
    console.log(`Saving historical assets: ${JSON.stringify(assetHistory, null, 2)}`);
    await ctx.store.save(assetHistory);
  }
  if (balanceHistory.length > 0) {
    console.log(`Saving historical account balances: ${JSON.stringify(balanceHistory, null, 2)}`);
    await ctx.store.save(balanceHistory);
  }
  if (poolHistory.length > 0) {
    console.log(`Saving historical pools: ${JSON.stringify(poolHistory, null, 2)}`);
    await ctx.store.save(poolHistory);
  }
  if (swapHistory.length > 0) {
    console.log(`Saving historical swaps: ${JSON.stringify(swapHistory, null, 2)}`);
    await ctx.store.save(swapHistory);
  }
};
