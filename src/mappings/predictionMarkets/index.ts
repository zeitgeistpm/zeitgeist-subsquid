import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
import * as ss58 from '@subsquid/ss58';
import { util } from '@zeitgeistpm/sdk';
import { Like } from 'typeorm';
import { Ctx, EventItem } from '../../processor';
import { MarketCommonsMarketsStorage } from '../../types/storage';
import {
  Account,
  AccountBalance,
  Asset,
  CategoryMetadata,
  Extrinsic,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalMarket,
  Market,
  MarketBond,
  MarketBonds,
  MarketCreation,
  MarketDeadlines,
  MarketPeriod,
  MarketReport,
  MarketStatus,
  MarketType,
  OutcomeReport,
} from '../../model';
import {
  createAssetsForMarket,
  decodeMarketMetadata,
  extrinsicFromEvent,
  formatMarketCreation,
  formatMarketEvent,
  getAssetId,
  getMarketStatus,
  initBalance,
  rescale,
  specVersion,
} from '../helper';
import { Tools } from '../util';
import {
  getBoughtCompleteSetEvent,
  getGlobalDisputeStartedEvent,
  getMarketApprovedEvent,
  getMarketClosedEvent,
  getMarketCreatedEvent,
  getMarketDestroyedEvent,
  getMarketDisputedEvent,
  getMarketExpiredEvent,
  getMarketInsufficientSubsidyEvent,
  getMarketRejectedEvent,
  getMarketReportedEvent,
  getMarketResolvedEvent,
  getMarketStartedWithSubsidyEvent,
  getRedeemSharesCall,
  getSoldCompleteSetEvent,
  getTokensRedeemedEvent,
} from './types';

export const boughtCompleteSet = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { marketId, amount, walletId } = getBoughtCompleteSetEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market || specVersion(block.specId) > 35) return;

  // Setting it as default in case the amount is not retained from event or extrinsic
  // This has been noticed for PredictionMarketsCreateCpmmMarketAndDeployAssetsCall on testnet before specVersion:34
  let amt = BigInt(1000000000000);
  if (amount !== BigInt(0)) {
    amt = amount;
    // @ts-ignore
  } else if (item.event.extrinsic) {
    // @ts-ignore
    if (item.event.extrinsic.call.args.amount) {
      // @ts-ignore
      const amount = item.event.extrinsic.call.args.amount.toString();
      amt = BigInt(amount);
      // @ts-ignore
    } else if (item.event.extrinsic.call.args.calls) {
      // @ts-ignore
      for (let ext of item.event.extrinsic.call.args.calls as Array<{
        __kind: string;
        value: { __kind: string; amount: string; marketId: string };
      }>) {
        const {
          __kind: extrinsic,
          value: { __kind: method, amount: amount, marketId: id },
        } = ext;
        if (extrinsic == 'PredictionMarkets' && method == 'buy_complete_set' && +id == marketId) {
          amt = BigInt(amount);
          break;
        }
      }
    }
  }

  let acc = await ctx.store.get(Account, { where: { accountId: walletId } });
  if (!acc) {
    acc = new Account();
    acc.id = walletId;
    acc.accountId = walletId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
    await initBalance(acc, ctx.store, block, item);
  }

  const habs: HistoricalAccountBalance[] = [];
  for (let i = 0; i < market.outcomeAssets.length; i++) {
    const assetId = market.outcomeAssets[i]!;

    const hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + marketId + i + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = walletId;
    hab.event = item.event.name.split('.')[1];
    hab.extrinsic = extrinsicFromEvent(item.event);
    hab.assetId = assetId;
    hab.dBalance = amt;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);

    habs.push(hab);
  }
  return habs;
};

export const globalDisputeStarted = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getGlobalDisputeStartedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketApproved = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status } = getMarketApprovedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = status
    ? getMarketStatus(status)
    : market.scoringRule === 'CPMM'
    ? MarketStatus.Active
    : MarketStatus.CollectingSubsidy;
  if (market.bonds && market.creation === MarketCreation.Advised) {
    market.bonds.creation.isSettled = true;
  }
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketClosed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getMarketClosedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Closed;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketCreated = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, marketAccountId, market } = getMarketCreatedEvent(ctx, item, specVersion(block.specId));

  if (marketAccountId.length > 0) {
    const acc = await ctx.store.findOneBy(Account, {
      accountId: marketAccountId,
    });
    if (acc) {
      acc.marketId = +marketId.toString();
      console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
      await ctx.store.save<Account>(acc);
    } else {
      const acc = new Account();
      acc.id = marketAccountId.toString();
      acc.accountId = marketAccountId.toString();
      acc.marketId = +marketId.toString();
      console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
      await ctx.store.save<Account>(acc);

      const ab = new AccountBalance();
      ab.id = item.event.id + '-' + marketAccountId.substring(marketAccountId.length - 5);
      ab.account = acc;
      ab.assetId = 'Ztg';
      ab.balance = BigInt(0);
      console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
      await ctx.store.save<AccountBalance>(ab);

      const hab = new HistoricalAccountBalance();
      hab.id = item.event.id + '-' + marketAccountId.substring(marketAccountId.length - 5);
      hab.accountId = acc.accountId;
      hab.event = item.event.name.split('.')[1];
      hab.extrinsic = extrinsicFromEvent(item.event);
      hab.assetId = ab.assetId;
      hab.dBalance = BigInt(0);
      hab.blockNumber = block.height;
      hab.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(hab);
    }
  }

  const newMarket = new Market();
  newMarket.id = item.event.id + '-' + marketId;
  newMarket.marketId = +marketId;
  newMarket.baseAsset = market.baseAsset ? getAssetId(market.baseAsset) : 'Ztg';
  newMarket.creator = encodeAddress(market.creator, 73);
  newMarket.creation = formatMarketCreation(market.creation);
  newMarket.creatorFee = +market.creatorFee.toString();
  newMarket.oracle = encodeAddress(market.oracle, 73);
  newMarket.scoringRule = market.scoringRule.__kind;
  newMarket.status = getMarketStatus(market.status);
  newMarket.outcomeAssets = (await createAssetsForMarket(marketId, market.marketType)) as string[];
  newMarket.metadata = market.metadata.toString();

  const d = market.disputeMechanism;
  newMarket.disputeMechanism = d.__kind;
  if (d.__kind === 'Authorized') {
    newMarket.authorizedAddress = d.value ? encodeAddress(d.value, 73) : null;
  }

  let hasValidMetaCategories = true;
  const metadata = await decodeMarketMetadata(market.metadata.toString());
  if (metadata) {
    newMarket.slug = metadata.slug;
    newMarket.question = metadata.question;
    newMarket.description = metadata.description;
    newMarket.img = metadata.img;

    if (market.marketType.__kind == 'Scalar') {
      newMarket.scalarType = metadata.scalarType;
    }

    if (metadata.categories) {
      newMarket.categories = [];
      for (let i = 0; i < metadata.categories.length; i++) {
        let cm = new CategoryMetadata();
        cm.name = metadata.categories[i].name;
        cm.ticker = metadata.categories[i].ticker;
        cm.img = metadata.categories[i].img;
        cm.color = metadata.categories[i].color;
        newMarket.categories.push(cm);
        if (!cm.name) {
          hasValidMetaCategories = false;
        }
      }
    }

    if (metadata.tags) {
      newMarket.tags = [];
      for (let i = 0; i < metadata.tags.length; i++) {
        newMarket.tags.push(metadata.tags[i]);
      }
    }
  }
  newMarket.hasValidMetaCategories = hasValidMetaCategories;

  if (market.deadlines) {
    const deadlines = new MarketDeadlines();
    deadlines.disputeDuration = market.deadlines.disputeDuration;
    deadlines.gracePeriod = market.deadlines.gracePeriod;
    deadlines.oracleDuration = market.deadlines.oracleDuration;
    newMarket.deadlines = deadlines;
  }

  const marketType = new MarketType();
  const type = market.marketType;
  if (type.__kind == 'Categorical') {
    marketType.categorical = type.value.toString();
  } else if (type.__kind == 'Scalar') {
    marketType.scalar = [];
    if (specVersion(block.specId) < 41) {
      if (type.value.start) {
        marketType.scalar.push(rescale(type.value.start.toString()));
        marketType.scalar.push(rescale(type.value.end.toString()));
      } else {
        const [start, end] = type.value.toString().split(`,`);
        marketType.scalar.push(rescale(start));
        marketType.scalar.push(rescale(end));
      }
    } else {
      marketType.scalar.push(type.value.start.toString());
      marketType.scalar.push(type.value.end.toString());
    }
  }
  newMarket.marketType = marketType;

  const period = new MarketPeriod();
  const p = market.period;
  if (p.__kind == 'Block') {
    const sdk = await Tools.getSDK();
    const now = BigInt((await sdk.api.query.timestamp.now()).toString());
    const headBlock = (await sdk.api.rpc.chain.getHeader()).number.toBigInt();
    const blockCreationPeriod = BigInt(2 * Number(sdk.api.consts.timestamp.minimumPeriod));
    const startDiffInMs = blockCreationPeriod * (BigInt(p.start) - headBlock);
    const endDiffInMs = blockCreationPeriod * (BigInt(p.end) - headBlock);

    period.block = [];
    period.block.push(BigInt(p.start));
    period.block.push(BigInt(p.end));
    period.start = now + startDiffInMs;
    period.end = now + endDiffInMs;
  } else if (p.__kind == 'Timestamp') {
    period.timestamp = [];
    period.timestamp.push(BigInt(p.start));
    period.timestamp.push(BigInt(p.end));
    period.start = BigInt(p.start);
    period.end = BigInt(p.end);
  }
  newMarket.period = period;

  if (market.bonds) {
    const marketBonds = new MarketBonds();
    if (market.bonds.creation) {
      const creationBond = market.bonds.creation;
      const bond = new MarketBond();
      bond.who = encodeAddress(creationBond.who, 73);
      bond.value = creationBond.value;
      bond.isSettled = creationBond.isSettled;
      marketBonds.creation = bond;
    }
    if (market.bonds.oracle) {
      const oracleBond = market.bonds.oracle;
      const bond = new MarketBond();
      bond.who = encodeAddress(oracleBond.who, 73);
      bond.value = oracleBond.value;
      bond.isSettled = oracleBond.isSettled;
      marketBonds.oracle = bond;
    }
    newMarket.bonds = marketBonds;
  }
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(newMarket, null, 2)}`);
  await ctx.store.save<Market>(newMarket);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + newMarket.marketId;
  hm.marketId = newMarket.marketId;
  hm.status = newMarket.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketDestroyed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getMarketDestroyedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Destroyed;
  if (market.bonds) {
    market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
    if (market.bonds.outsider) market.bonds.outsider.isSettled = true;
  }
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  const acc = await ctx.store.get(Account, {
    where: { marketId: market.marketId },
  });
  if (!acc) return;

  const ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: acc.accountId },
    assetId: market.baseAsset,
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  const newBalance = BigInt(0);
  ab.balance = newBalance;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const marketDisputed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status, report } = getMarketDisputedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  if (!market.disputes) market.disputes = [];

  const ocr = new OutcomeReport();
  if (report.outcome.__kind == 'Categorical') {
    ocr.categorical = report.outcome.value;
  } else if (report.outcome.__kind == 'Scalar') {
    ocr.scalar = report.outcome.value;
  }

  const mr = new MarketReport();
  mr.outcome = ocr;
  if (report.at) mr.at = +report.at.toString();
  if (report.by) mr.by = ss58.codec('zeitgeist').encode(report.by);

  market.status = status ? getMarketStatus(status) : MarketStatus.Disputed;
  market.disputes.push(mr);
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.by = mr.by;
  hm.outcome = ocr;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketExpired = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getMarketExpiredEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Expired;
  if (market.bonds && market.creation === MarketCreation.Advised) {
    market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
  }
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketInsufficientSubsidy = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status } = getMarketInsufficientSubsidyEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = status ? getMarketStatus(status) : MarketStatus.InsufficientSubsidy;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketRejected = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, reason } = getMarketRejectedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Rejected;
  market.rejectReason = reason.toString();
  if (market.bonds && market.creation === MarketCreation.Advised) {
    market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
  }
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketReported = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status, report } = getMarketReportedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;

  const ocr = new OutcomeReport();
  if (report.outcome.__kind == 'Categorical') {
    ocr.categorical = report.outcome.value;
  } else if (report.outcome.__kind == 'Scalar') {
    ocr.scalar = report.outcome.value;
  }

  const mr = new MarketReport();
  if (report.at) mr.at = +report.at.toString();
  if (report.by) mr.by = ss58.codec('zeitgeist').encode(report.by);
  mr.outcome = ocr;

  if (mr.by !== market.oracle && specVersion(block.specId) >= 46) {
    const storage = new MarketCommonsMarketsStorage(ctx, block);
    const onChainMarket = await storage.asV46.get(BigInt(marketId));
    if (onChainMarket && onChainMarket.bonds.outsider && market.bonds) {
      const outsiderBond = onChainMarket.bonds.outsider;
      const bond = new MarketBond();
      bond.who = encodeAddress(outsiderBond.who, 73);
      bond.value = outsiderBond.value;
      bond.isSettled = outsiderBond.isSettled;
      market.bonds.outsider = bond;
    }
  }

  market.status = status ? getMarketStatus(status) : MarketStatus.Reported;
  market.report = mr;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.by = mr.by;
  hm.outcome = ocr;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketResolved = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status, report } = getMarketResolvedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.resolvedOutcome =
    market.marketType.scalar && specVersion(block.specId) < 41
      ? rescale(report.value.toString())
      : report.value.toString();
  market.status = status ? getMarketStatus(status) : MarketStatus.Resolved;
  if (market.bonds) {
    if (market.creation === MarketCreation.Permissionless) market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
    if (market.bonds.outsider) market.bonds.outsider.isSettled = true;
  }
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  await Promise.all(
    market.outcomeAssets.map(async (outcomeAsset, i) => {
      if (market.marketType.categorical && specVersion(block.specId) < 40 && i !== +market.resolvedOutcome!) {
        const abs = await ctx.store.find(AccountBalance, {
          where: { assetId: outcomeAsset! },
        });
        abs.map(async (ab) => {
          const accLookupKey = ab.id.substring(0, ab.id.indexOf('-'));
          const acc = await ctx.store.get(Account, {
            where: { id: Like(`%${accLookupKey}%`) },
          });
          if (!acc || ab.balance === BigInt(0)) return;
          const oldBalance = ab.balance;
          const newBalance = BigInt(0);
          ab.balance = newBalance;
          console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
          await ctx.store.save<AccountBalance>(ab);

          const hab = new HistoricalAccountBalance();
          hab.id = item.event.id + '-' + market.marketId + i + '-' + acc.accountId.substring(acc.accountId.length - 5);
          hab.accountId = acc.accountId;
          hab.event = item.event.name.split('.')[1];
          hab.extrinsic = extrinsicFromEvent(item.event);
          hab.assetId = ab.assetId;
          hab.dBalance = newBalance - oldBalance;
          hab.blockNumber = block.height;
          hab.timestamp = new Date(block.timestamp);
          console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
          await ctx.store.save<HistoricalAccountBalance>(hab);
        });
      }

      const asset = await ctx.store.get(Asset, {
        where: { assetId: market.outcomeAssets[i]! },
      });
      if (!asset) return;
      const oldPrice = asset.price;
      const oldAssetQty = asset.amountInPool;
      let newPrice = oldPrice;
      let newAssetQty = oldAssetQty;

      if (market.marketType.scalar) {
        const lowerBound = Number(market.marketType.scalar[0]);
        const upperBound = Number(market.marketType.scalar[1]);
        if (asset.assetId.includes('Long')) {
          newPrice = (+market.resolvedOutcome! - lowerBound) / (upperBound - lowerBound);
        } else if (asset.assetId.includes('Short')) {
          newPrice = (upperBound - +market.resolvedOutcome!) / (upperBound - lowerBound);
        }
      } else {
        newPrice = i == +market.resolvedOutcome! ? 1 : 0;
        if (specVersion(block.specId) < 40) {
          newAssetQty = i == +market.resolvedOutcome! ? oldAssetQty : BigInt(0);
        }
      }
      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset();
      ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
      ha.assetId = asset.assetId;
      ha.newPrice = newPrice;
      ha.newAmountInPool = newAssetQty;
      ha.dPrice = newPrice - oldPrice;
      ha.dAmountInPool = newAssetQty - oldAssetQty;
      ha.event = item.event.name.split('.')[1];
      ha.blockNumber = block.height;
      ha.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
      await ctx.store.save<HistoricalAsset>(ha);
    })
  );
};

export const marketStartedWithSubsidy = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status } = getMarketStartedWithSubsidyEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = status ? getMarketStatus(status) : MarketStatus.Active;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const redeemSharesCall = async (ctx: Ctx, block: SubstrateBlock, item: any) => {
  // @ts-ignore
  const accountId =
    item.call.origin !== undefined ? item.call.origin.value.value : item.extrinsic.signature.address.value;
  const walletId = encodeAddress(accountId, 73);
  // @ts-ignore
  const { marketId } = getRedeemSharesCall(ctx, item.call);
  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;

  const ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: JSON.stringify(util.AssetIdFromString(`[${marketId},${market.resolvedOutcome}]`)),
  });
  if (!ab) return;

  const oldBalance = ab.balance;
  const newBalance = BigInt(0);
  ab.balance = newBalance;
  // @ts-ignore
  console.log(`[${item.call.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance();
  // @ts-ignore
  hab.id = item.call.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = walletId;
  // @ts-ignore
  hab.event = item.call.name.split('.')[1];
  hab.extrinsic = item.extrinsic ? new Extrinsic({ name: item.call.name, hash: item.extrinsic.hash }) : null;
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  // @ts-ignore
  console.log(`[${item.call.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const soldCompleteSet = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { marketId, amount, walletId } = getSoldCompleteSetEvent(ctx, item);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
  });
  if (!market) return;

  let amt = BigInt(0);
  if (amount !== BigInt(0)) {
    amt = amount;
    // @ts-ignore
  } else if (item.event.extrinsic) {
    // @ts-ignore
    if (item.event.extrinsic.call.args.amount) {
      // @ts-ignore
      const amount = item.event.extrinsic.call.args.amount.toString();
      amt = BigInt(amount);
      // @ts-ignore
    } else if (item.event.extrinsic.call.args.calls) {
      // @ts-ignore
      for (let ext of item.event.extrinsic.call.args.calls as Array<{
        __kind: string;
        value: { __kind: string; amount: string; marketId: string };
      }>) {
        const {
          __kind: extrinsic,
          value: { __kind: method, amount: amount, marketId: id },
        } = ext;
        if (extrinsic == 'PredictionMarkets' && method == 'sell_complete_set' && +id == marketId) {
          amt = BigInt(amount);
          break;
        }
      }
    }
  }

  const habs: HistoricalAccountBalance[] = [];
  for (let i = 0; i < market.outcomeAssets.length; i++) {
    const assetId = market.outcomeAssets[i]!;

    const hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + marketId + i + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = walletId;
    hab.event = item.event.name.split('.')[1];
    hab.extrinsic = extrinsicFromEvent(item.event);
    hab.assetId = assetId;
    hab.dBalance = -amt;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);

    habs.push(hab);
  }
  return habs;
};

export const tokensRedeemed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAccountBalance> => {
  const { assetId, amtRedeemed, walletId } = getTokensRedeemedEvent(ctx, item);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = assetId;
  hab.dBalance = -amtRedeemed;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);

  return hab;
};
