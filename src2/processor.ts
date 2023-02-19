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
  balancesTransferOld,
  balancesUnreserved,
  balancesWithdraw,
} from './mappings/balances';
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
import { accountCrossed } from './mappings/styx';
import {
  systemExtrinsicFailed,
  systemExtrinsicSuccess,
  systemNewAccount,
} from './mappings/system';

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

const eventRangeOptions = {
  range: { from: 0, to: 588249 },
  data: {
    event: {
      args: true,
      extrinsic: true,
    },
  },
} as const;

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    archive:
      process.env.INDEXER_ENDPOINT_URL ??
      'https://indexer.zeitgeist.pm/graphql',
    chain: process.env.WS_NODE_URL ?? 'wss://bsr.zeitgeist.pm',
  })
  .setTypesBundle('typesBundle.json')
  .addEvent('Balances.BalanceSet', eventOptions)
  .addEvent('Balances.Deposit', eventOptions)
  .addEvent('Balances.DustLost', eventOptions)
  .addEvent('Balances.Endowed', eventOptions)
  .addEvent('Balances.Reserved', eventOptions)
  .addEvent('Balances.Transfer', eventOptions)
  .addEvent('Balances.Unreserved', eventOptions)
  .addEvent('Balances.Withdraw', eventOptions)
  .addEvent('ParachainStaking.Rewarded', eventRangeOptions)
  .addEvent('Styx.AccountCrossed', eventOptions)
  .addEvent('System.ExtrinsicFailed', eventRangeOptions)
  .addEvent('System.ExtrinsicSuccess', eventRangeOptions)
  .addEvent('System.NewAccount', eventOptions);

export type Item = BatchProcessorItem<typeof processor>;
export type Ctx = BatchContext<Store, Item>;
export type EventItem = Exclude<
  BatchProcessorEventItem<typeof processor>,
  _EventItem<'*', false>
>;

const handleEvents = async (ctx: Ctx, block: SubstrateBlock, item: Item) => {
  switch (item.name) {
    case 'Balances.BalanceSet':
      return balancesBalanceSet(ctx, block, item);
    case 'Balances.Deposit':
      return balancesDeposit(ctx, block, item);
    case 'Balances.DustLost':
      return balancesDustLost(ctx, block, item);
    case 'Balances.Endowed':
      return balancesEndowed(ctx, block, item);
    case 'Balances.Reserved':
      return balancesReserved(ctx, block, item);
    case 'Balances.Transfer':
      if (block.height < 588249) return balancesTransferOld(ctx, block, item);
      else return balancesTransfer(ctx, block, item);
    case 'Balances.Unreserved':
      return balancesUnreserved(ctx, block, item);
    case 'Balances.Withdraw':
      return balancesWithdraw(ctx, block, item);
    case 'ParachainStaking.Rewarded':
      return parachainStakingRewarded(ctx, block, item);
    case 'Styx.AccountCrossed':
      return accountCrossed(ctx, block, item);
    case 'System.NewAccount':
      return systemNewAccount(ctx, block, item);
    case 'System.ExtrinsicFailed':
      return systemExtrinsicFailed(ctx, block, item);
    case 'System.ExtrinsicSuccess':
      return systemExtrinsicSuccess(ctx, block, item);
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
  }
};

processor.run(new TypeormDatabase(), async (ctx) => {
  for (let block of ctx.blocks) {
    for (let item of block.items) {
      if (item.kind === 'event') await handleEvents(ctx, block.header, item);
    }
    if (block.header.height < 215000) await handlePostHooks(ctx, block.header);
  }
});
