import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
import * as ss58 from '@subsquid/ss58';
import { util } from '@zeitgeistpm/sdk';
import { Like } from 'typeorm';
import { Ctx, EventItem } from '../../processor';
import {
  Account,
  AccountBalance,
  Asset,
  CategoryMetadata,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalMarket,
  Market,
  MarketBond,
  MarketBonds,
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
  formatMarketCreation,
  getAssetId,
  getMarketEvent,
  getMarketStatus,
  rescale,
  specVersion,
} from '../helper';
import { Tools } from '../util';
import {
  getBoughtCompleteSetEvent,
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

export const boughtCompleteSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, amount, walletId } = getBoughtCompleteSetEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market || specVersion(block.specId) > 35) return;

  const len = market.outcomeAssets.length;
  for (let i = 0; i < len; i++) {
    const currencyId = market.outcomeAssets[i]!;
    let ab = await ctx.store.findOneBy(AccountBalance, {
      account: { accountId: walletId },
      assetId: currencyId,
    });
    if (!ab) return;

    let hab = await ctx.store.get(HistoricalAccountBalance, {
      where: {
        accountId: walletId,
        assetId: currencyId,
        event: 'Endowed',
        blockNumber: block.height,
      },
    });
    if (hab) {
      hab.event = hab.event.concat(item.event.name.split('.')[1]);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(hab);
    } else {
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
            if (extrinsic == 'PredictionMarkets' && method == 'buy_complete_set' && +id == marketId) {
              amt = BigInt(amount);
              break;
            }
          }
        }
      }
      ab.balance = ab.balance + amt;
      console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
      await ctx.store.save<AccountBalance>(ab);

      hab = new HistoricalAccountBalance();
      hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
      hab.accountId = walletId;
      hab.event = item.event.name.split('.')[1];
      hab.assetId = ab.assetId;
      hab.dBalance = amt;
      hab.blockNumber = block.height;
      hab.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(hab);
    }
  }
};

export const marketApproved = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status } = getMarketApprovedEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = status
    ? getMarketStatus(status)
    : market.scoringRule === 'CPMM'
    ? MarketStatus.Active
    : MarketStatus.CollectingSubsidy;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketClosed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getMarketClosedEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Closed;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketCreated = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, marketAccountId, market } = getMarketCreatedEvent(ctx, item, specVersion(block.specId));

  if (marketAccountId.length > 0) {
    let acc = await ctx.store.findOneBy(Account, {
      accountId: marketAccountId,
    });
    if (acc) {
      acc.marketId = +marketId.toString();
      console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
      await ctx.store.save<Account>(acc);
    } else {
      let acc = new Account();
      acc.id = item.event.id + '-' + marketAccountId.substring(marketAccountId.length - 5);
      acc.accountId = marketAccountId.toString();
      acc.marketId = +marketId.toString();
      console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
      await ctx.store.save<Account>(acc);

      let ab = new AccountBalance();
      ab.id = item.event.id + '-' + marketAccountId.substring(marketAccountId.length - 5);
      ab.account = acc;
      ab.assetId = 'Ztg';
      ab.balance = BigInt(0);
      console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
      await ctx.store.save<AccountBalance>(ab);

      let hab = new HistoricalAccountBalance();
      hab.id = item.event.id + '-' + marketAccountId.substring(marketAccountId.length - 5);
      hab.accountId = acc.accountId;
      hab.event = item.event.name.split('.')[1];
      hab.assetId = ab.assetId;
      hab.dBalance = BigInt(0);
      hab.blockNumber = block.height;
      hab.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await ctx.store.save<HistoricalAccountBalance>(hab);
    }
  }

  let newMarket = new Market();
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

  let isMetaComplete = true;
  let hasValidMetaCategories = true;
  const metadata = await decodeMarketMetadata(market.metadata.toString());
  if (!metadata) {
    isMetaComplete = false;
  } else {
    newMarket.slug = metadata.slug;
    newMarket.question = metadata.question;
    newMarket.description = metadata.description;
    newMarket.img = metadata.img;

    if (market.marketType.__kind == 'Scalar') {
      newMarket.scalarType = metadata.scalarType;
    }

    if (!metadata.categories) {
      isMetaComplete = false;
    } else {
      newMarket.categories = [];
      for (let i = 0; i < metadata.categories.length; i++) {
        let cm = new CategoryMetadata();
        cm.name = metadata.categories[i].name;
        cm.ticker = metadata.categories[i].ticker;
        cm.img = metadata.categories[i].img;
        cm.color = metadata.categories[i].color;
        newMarket.categories.push(cm);
        if (!cm.name) {
          isMetaComplete = false;
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
  newMarket.isMetaComplete = isMetaComplete;
  newMarket.hasValidMetaCategories = hasValidMetaCategories;

  if (market.deadlines) {
    let deadlines = new MarketDeadlines();
    deadlines.disputeDuration = market.deadlines.disputeDuration;
    deadlines.gracePeriod = market.deadlines.gracePeriod;
    deadlines.oracleDuration = market.deadlines.oracleDuration;
    newMarket.deadlines = deadlines;
  }

  let marketType = new MarketType();
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

  let period = new MarketPeriod();
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

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + newMarket.marketId;
  hm.marketId = newMarket.marketId;
  hm.status = newMarket.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketDestroyed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getMarketDestroyedEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Destroyed;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  let acc = await ctx.store.get(Account, {
    where: { marketId: market.marketId },
  });
  if (!acc) return;

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: acc.accountId },
    assetId: market.baseAsset,
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  const newBalance = BigInt(0);
  ab.balance = newBalance;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const marketDisputed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status, report } = getMarketDisputedEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  if (!market.disputes) market.disputes = [];

  let ocr = new OutcomeReport();
  if (report.outcome.__kind == 'Categorical') {
    ocr.categorical = report.outcome.value;
  } else if (report.outcome.__kind == 'Scalar') {
    ocr.scalar = report.outcome.value;
  }

  let mr = new MarketReport();
  mr.outcome = ocr;
  if (report.at) mr.at = +report.at.toString();
  if (report.by) mr.by = ss58.codec('zeitgeist').encode(report.by);

  market.status = status ? getMarketStatus(status) : MarketStatus.Disputed;
  market.disputes.push(mr);
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.by = mr.by;
  hm.outcome = ocr;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketExpired = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId } = getMarketExpiredEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Expired;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketInsufficientSubsidy = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status } = getMarketInsufficientSubsidyEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = status ? getMarketStatus(status) : MarketStatus.InsufficientSubsidy;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketRejected = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, reason } = getMarketRejectedEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = MarketStatus.Rejected;
  market.rejectReason = reason.toString();
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const marketReported = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status, report } = getMarketReportedEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;

  let ocr = new OutcomeReport();
  if (report.outcome.__kind == 'Categorical') {
    ocr.categorical = report.outcome.value;
  } else if (report.outcome.__kind == 'Scalar') {
    ocr.scalar = report.outcome.value;
  }

  let mr = new MarketReport();
  if (report.at) mr.at = +report.at.toString();
  if (report.by) mr.by = ss58.codec('zeitgeist').encode(report.by);
  mr.outcome = ocr;

  market.status = status ? getMarketStatus(status) : MarketStatus.Reported;
  market.report = mr;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.by = mr.by;
  hm.outcome = ocr;
  hm.event = getMarketEvent(item.event.name);
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
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
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
        newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      } else if (asset.assetId.includes('Short')) {
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
      }
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      if (specVersion(block.specId) < 40) {
        newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
      }
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
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

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance < BigInt(0)) return;

        const oldBalance = ab.balance;

        if (market.marketType.categorical && specVersion(block.specId) < 40) {
          ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        }
        console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = item.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = item.event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const marketStartedWithSubsidy = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, status } = getMarketStartedWithSubsidyEvent(ctx, item);

  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.status = status ? getMarketStatus(status) : MarketStatus.Active;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.event = getMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const redeemShares = async (ctx: Ctx, block: SubstrateBlock, item: any) => {
  // @ts-ignore
  const accountId =
    item.call.origin !== undefined ? item.call.origin.value.value : item.extrinsic.signature.address.value;
  const walletId = encodeAddress(accountId, 73);
  // @ts-ignore
  const { marketId } = getRedeemSharesCall(ctx, item.call);
  let market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;

  let ab = await ctx.store.findOneBy(AccountBalance, {
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

  let hab = new HistoricalAccountBalance();
  // @ts-ignore
  hab.id = item.call.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = walletId;
  // @ts-ignore
  hab.event = item.call.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  // @ts-ignore
  console.log(`[${item.call.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const soldCompleteSet = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, amount, walletId } = getSoldCompleteSetEvent(ctx, item);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
  });
  if (!market) return;

  const len = market.outcomeAssets.length;
  for (let i = 0; i < len; i++) {
    const currencyId = market.outcomeAssets[i]!;
    let ab = await ctx.store.findOneBy(AccountBalance, {
      account: { accountId: walletId },
      assetId: currencyId,
    });
    if (!ab) {
      return;
    }

    const asset = await ctx.store.get(Asset, {
      where: { assetId: currencyId },
    });

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
    ab.balance = ab.balance - amt;
    console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
    await ctx.store.save<AccountBalance>(ab);

    let hab = new HistoricalAccountBalance();
    hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
    hab.accountId = walletId;
    hab.event = item.event.name.split('.')[1];
    hab.assetId = ab.assetId;
    hab.dBalance = -amt;
    hab.blockNumber = block.height;
    hab.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(hab);
  }
};

export const tokensRedeemed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { assetId, amtRedeemed, walletId } = getTokensRedeemedEvent(ctx, item);

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: assetId,
  });
  if (!ab) return;

  let tHab = await ctx.store.get(HistoricalAccountBalance, {
    where: {
      accountId: walletId,
      assetId: 'Ztg',
      event: 'Transfer',
      blockNumber: block.height,
    },
  });
  if (tHab) {
    tHab.event = item.event.name.split('.')[1];
    console.log(`[${item.event.name}] Updating historical account balance: ${JSON.stringify(tHab, null, 2)}`);
    await ctx.store.save<HistoricalAccountBalance>(tHab);
  }

  const oldBalance = ab.balance;
  ab.balance = ab.balance - amtRedeemed;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + walletId.substring(walletId.length - 5);
  hab.accountId = walletId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = ab.balance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};
