import {
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
  DataHandlerContext,
} from '@subsquid/substrate-processor';
import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
import { lookupArchive } from '@subsquid/archive-registry';
import { balancesTransfer } from './mappings/balances';
import { initBalance } from './mappings/helper';
import {
  Account,
  AccountBalance,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalPool,
  HistoricalSwap,
} from './model';
import { events } from './types';

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
    name: [events.balances.transfer.name],
    extrinsic: true,
  })
  .setFields({
    event: {
      args: true,
    },
    extrinsic: {
      hash: true,
    },
    block: {
      timestamp: true,
    },
  });

export type Fields = SubstrateBatchProcessorFields<typeof processor>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;

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
      switch (event.name) {
        case events.balances.transfer.name: {
          const habs = await balancesTransfer(block.header, event);
          await storeBalanceChanges(habs);
          break;
        }
      }
    }
  }
  await saveAccounts(ctx);
  await saveHistory(ctx);
});

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

const saveAccounts = async (ctx: ProcessorContext<Store>) => {
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

const saveHistory = async (ctx: ProcessorContext<Store>) => {
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
