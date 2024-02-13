import { Store } from '@subsquid/typeorm-store';
import * as ss58 from '@subsquid/ss58';
import { util } from '@zeitgeistpm/sdk';
import { Like } from 'typeorm';
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
  MarketEvent,
  MarketReport,
  MarketStatus,
  MarketType,
  OutcomeReport,
  ScoringRule,
} from '../../model';
import { BUY_COMPLETE_SET, Pallet, SELL_COMPLETE_SET, _Asset } from '../../consts';
import {
  createAssetsForMarket,
  decodeMarketMetadata,
  extrinsicFromEvent,
  formatAssetId,
  formatDisputeMechanism,
  formatMarketStatus,
  formatScoringRule,
  rescale,
} from '../../helper';
import { Call, Event } from '../../processor';
import { decodeMarketsStorage } from '../market-commons/decode';
import {
  decodeBoughtCompleteSetEvent,
  decodeGlobalDisputeStartedEvent,
  decodeMarketApprovedEvent,
  decodeMarketClosedEvent,
  decodeMarketCreatedEvent,
  decodeMarketDestroyedEvent,
  decodeMarketDisputedEvent,
  decodeMarketEarlyCloseScheduledEvent,
  decodeMarketExpiredEvent,
  decodeMarketInsufficientSubsidyEvent,
  decodeMarketRejectedEvent,
  decodeMarketReportedEvent,
  decodeMarketResolvedEvent,
  decodeMarketStartedWithSubsidyEvent,
  decodeRedeemSharesCall,
  decodeSoldCompleteSetEvent,
  decodeTokensRedeemedEvent,
} from './decode';
import { mapMarketPeriod } from './helper';

export const boughtCompleteSet = async (
  store: Store,
  event: Event
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { marketId, amount, accountId } = decodeBoughtCompleteSetEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market || event.block.specVersion > 35) return;

  // Setting it as default in case the amount is not retained from event or extrinsic
  // This has been noticed for PredictionMarketsCreateCpmmMarketAndDeployAssetsCall on testnet before specVersion:34
  let amt = BigInt(10 ** 12);
  if (amount !== BigInt(0)) {
    amt = amount;
  } else if (event.extrinsic && event.extrinsic.call) {
    if (event.extrinsic.call.args.amount) {
      const amount = event.extrinsic.call.args.amount.toString();
      amt = BigInt(amount);
    } else if (event.extrinsic.call.args.calls) {
      for (let call of event.extrinsic.call.args.calls as Array<{
        __kind: string;
        value: { __kind: string; amount: string; marketId: string };
      }>) {
        const {
          __kind: prefix,
          value: { __kind: name, amount: amount, marketId: id },
        } = call;
        if (prefix === Pallet.PredictionMarkets && name === BUY_COMPLETE_SET && +id === marketId) {
          amt = BigInt(amount);
          break;
        }
      }
    }
  }

  const habs: HistoricalAccountBalance[] = [];
  for (let i = 0; i < market.outcomeAssets.length; i++) {
    const hab = new HistoricalAccountBalance({
      accountId,
      assetId: market.outcomeAssets[i],
      blockNumber: event.block.height,
      dBalance: amt,
      event: event.name.split('.')[1],
      extrinsic: extrinsicFromEvent(event),
      id: event.id + '-' + marketId + i + '-' + accountId.slice(-5),
      timestamp: new Date(event.block.timestamp!),
    });
    habs.push(hab);
  }
  return habs;
};

export const globalDisputeStarted = async (store: Store, event: Event) => {
  const { marketId } = decodeGlobalDisputeStartedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.GlobalDisputeStarted,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketApproved = async (store: Store, event: Event) => {
  const { marketId, status } = decodeMarketApprovedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  market.status = status
    ? formatMarketStatus(status)
    : market.scoringRule === ScoringRule.CPMM
    ? MarketStatus.Active
    : MarketStatus.CollectingSubsidy;

  if (market.bonds && market.creation === MarketCreation.Advised) market.bonds.creation.isSettled = true;

  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketApproved,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketClosed = async (store: Store, event: Event) => {
  const { marketId } = decodeMarketClosedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.Closed;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketClosed,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketCreated = async (store: Store, event: Event) => {
  const { marketId, accountId, market } = decodeMarketCreatedEvent(event, event.block.specVersion);

  if (accountId) {
    const account = await store.findOneBy(Account, {
      accountId,
    });
    if (account) {
      account.marketId = marketId;
      console.log(`[${event.name}] Saving account: ${JSON.stringify(account, null, 2)}`);
      await store.save<Account>(account);
    } else {
      const account = new Account({
        accountId,
        id: accountId,
        marketId,
      });
      console.log(`[${event.name}] Saving account: ${JSON.stringify(account, null, 2)}`);
      await store.save<Account>(account);

      const ab = new AccountBalance({
        account: account,
        assetId: _Asset.Ztg,
        balance: BigInt(0),
        id: event.id + '-' + accountId.slice(-5),
      });
      console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
      await store.save<AccountBalance>(ab);

      const hab = new HistoricalAccountBalance({
        accountId,
        assetId: _Asset.Ztg,
        blockNumber: event.block.height,
        dBalance: BigInt(0),
        event: event.name.split('.')[1],
        extrinsic: extrinsicFromEvent(event),
        id: event.id + '-' + accountId.slice(-5),
        timestamp: new Date(event.block.timestamp!),
      });
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await store.save<HistoricalAccountBalance>(hab);
    }
  }

  const newMarket = new Market({
    baseAsset: market.baseAsset ? formatAssetId(market.baseAsset) : _Asset.Ztg,
    creation: market.creation.__kind == 'Advised' ? MarketCreation.Advised : MarketCreation.Permissionless,
    creator: ss58.encode({ prefix: 73, bytes: market.creator }),
    creatorFee: +market.creatorFee.toString(),
    disputeMechanism: formatDisputeMechanism(market.disputeMechanism),
    earlyClose: false,
    id: event.id + '-' + marketId,
    liquidity: BigInt(0),
    marketId,
    metadata: market.metadata.toString(),
    oracle: ss58.encode({ prefix: 73, bytes: market.oracle }),
    outcomeAssets: (await createAssetsForMarket(marketId, market.marketType)) as string[],
    period: await mapMarketPeriod(market.period),
    scoringRule: formatScoringRule(market.scoringRule),
    status: formatMarketStatus(market.status),
    volume: BigInt(0),
  });

  if (market.disputeMechanism?.__kind === 'Authorized') {
    newMarket.authorizedAddress = market.disputeMechanism.value
      ? ss58.encode({ prefix: 73, bytes: market.disputeMechanism.value })
      : null;
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
      const categoryNames: string[] = [];
      newMarket.categories = [];
      for (let category of metadata.categories) {
        categoryNames.push(category.name);
        let cm = new CategoryMetadata({
          color: category.color,
          img: category.img,
          name: category.name,
          ticker: category.ticker,
        });
        newMarket.categories.push(cm);
        if (!cm.name) {
          hasValidMetaCategories = false;
        }
      }
      newMarket.categoryNames = categoryNames.join(', ');
    }

    if (metadata.tags) {
      newMarket.tags = [];
      for (let tag of metadata.tags) {
        newMarket.tags.push(tag);
      }
    }
  }
  newMarket.hasValidMetaCategories = hasValidMetaCategories;

  if (market.deadlines) {
    const deadlines = new MarketDeadlines({
      disputeDuration: market.deadlines.disputeDuration,
      gracePeriod: market.deadlines.gracePeriod,
      oracleDuration: market.deadlines.oracleDuration,
    });
    newMarket.deadlines = deadlines;
  }

  const marketType = new MarketType();
  const type = market.marketType;
  if (type.__kind == 'Categorical') {
    marketType.categorical = type.value.toString();
  } else if (type.__kind == 'Scalar') {
    marketType.scalar = [];
    if (event.block.specVersion < 41) {
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

  if (market.bonds) {
    const marketBonds = new MarketBonds();
    if (market.bonds.creation) {
      const creationBond = market.bonds.creation;
      const bond = new MarketBond({
        isSettled: creationBond.isSettled,
        value: creationBond.value,
        who: ss58.encode({ prefix: 73, bytes: creationBond.who }),
      });
      marketBonds.creation = bond;
    }
    if (market.bonds.oracle) {
      const oracleBond = market.bonds.oracle;
      const bond = new MarketBond({
        isSettled: oracleBond.isSettled,
        value: oracleBond.value,
        who: ss58.encode({ prefix: 73, bytes: oracleBond.who }),
      });
      marketBonds.oracle = bond;
    }
    newMarket.bonds = marketBonds;
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(newMarket, null, 2)}`);
  await store.save<Market>(newMarket);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: newMarket.creator,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketCreated,
    id: event.id + '-' + marketId,
    liquidity: newMarket.liquidity,
    market: newMarket,
    outcome: null,
    resolvedOutcome: null,
    status: newMarket.status,
    timestamp: new Date(event.block.timestamp!),
    volume: newMarket.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketDestroyed = async (store: Store, event: Event) => {
  const { marketId } = decodeMarketDestroyedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.Destroyed;
  if (market.bonds) {
    market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
    if (market.bonds.outsider) market.bonds.outsider.isSettled = true;
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketDestroyed,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);

  const account = await store.get(Account, {
    where: { marketId },
  });
  if (!account) return;

  const ab = await store.findOneBy(AccountBalance, {
    account: { accountId: account.accountId },
    assetId: market.baseAsset,
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  ab.balance = BigInt(0);
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId: account.accountId,
    assetId: ab.assetId,
    blockNumber: event.block.height,
    dBalance: ab.balance - oldBalance,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + account.accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const marketDisputed = async (store: Store, event: Event) => {
  const { marketId, accountId, outcome } = decodeMarketDisputedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  if (event.block.specVersion >= 42 && market.bonds) {
    const onChainBonds = await decodeMarketsStorage(event.block, BigInt(marketId));
    if (onChainBonds && onChainBonds.dispute) {
      const bond = new MarketBond({
        isSettled: onChainBonds.dispute.isSettled,
        value: onChainBonds.dispute.value,
        who: ss58.encode({ prefix: 73, bytes: onChainBonds.dispute.who }),
      });
      market.bonds.dispute = bond;
    }
  }

  let marketReport = new MarketReport();
  // Conditions set based on PredictionMarketsDisputesStorage
  if (event.block.specVersion < 49) {
    if (!market.disputes) market.disputes = [];
    marketReport = new MarketReport({
      at: event.block.height,
      by: accountId,
      outcome: outcome
        ? new OutcomeReport({
            categorical: outcome.__kind === 'Categorical' ? outcome.value : undefined,
            scalar: outcome.__kind === 'Scalar' ? outcome.value : undefined,
          })
        : null,
    });
    market.disputes.push(marketReport);
  }
  market.status = MarketStatus.Disputed;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: accountId || market.bonds?.dispute?.who,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketDisputed,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: marketReport.outcome,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketEarlyCloseScheduled = async (store: Store, event: Event) => {
  const { marketId, newPeriod } = decodeMarketEarlyCloseScheduledEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.earlyClose = true;
  market.period = await mapMarketPeriod(newPeriod);
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketEarlyCloseScheduled,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketExpired = async (store: Store, event: Event) => {
  const { marketId } = decodeMarketExpiredEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.Expired;
  if (market.bonds && market.creation === MarketCreation.Advised) {
    market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketExpired,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketInsufficientSubsidy = async (store: Store, event: Event) => {
  const { marketId, status } = decodeMarketInsufficientSubsidyEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = status ? formatMarketStatus(status) : MarketStatus.InsufficientSubsidy;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketInsufficientSubsidy,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketRejected = async (store: Store, event: Event) => {
  const { marketId, reason } = decodeMarketRejectedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.Rejected;
  market.rejectReason = reason;
  if (market.bonds && market.creation === MarketCreation.Advised) {
    market.bonds.creation.isSettled = true;
    market.bonds.oracle.isSettled = true;
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketRejected,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketReported = async (store: Store, event: Event) => {
  const { marketId, at, by, outcome } = decodeMarketReportedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  const outcomeReport = new OutcomeReport({
    categorical: outcome.__kind === 'Categorical' ? outcome.value : undefined,
    scalar: outcome.__kind === 'Scalar' ? outcome.value : undefined,
  });

  const marketReport = new MarketReport({
    at,
    by,
    outcome: outcomeReport,
  });

  if (marketReport.by !== market.oracle && event.block.specVersion >= 46) {
    const onChainBonds = await decodeMarketsStorage(event.block, BigInt(marketId));
    if (onChainBonds && onChainBonds.outsider && market.bonds) {
      const outsiderBond = onChainBonds.outsider;
      const bond = new MarketBond({
        isSettled: outsiderBond.isSettled,
        value: outsiderBond.value,
        who: ss58.encode({ prefix: 73, bytes: outsiderBond.who }),
      });
      market.bonds.outsider = bond;
    }
  }

  market.status = MarketStatus.Reported;
  market.report = marketReport;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: marketReport.by,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketReported,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: outcomeReport,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketResolved = async (
  store: Store,
  event: Event
): Promise<
  | {
      historicalAccountBalances: HistoricalAccountBalance[];
      historicalAssets: HistoricalAsset[];
      historicalMarket: HistoricalMarket;
    }
  | undefined
> => {
  const { marketId, report } = decodeMarketResolvedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  market.resolvedOutcome =
    market.marketType.scalar && event.block.specVersion < 41
      ? rescale(report.value.toString())
      : report.value.toString();
  market.status = MarketStatus.Resolved;
  if (market.bonds) {
    if (market.creation === MarketCreation.Permissionless) market.bonds.creation.isSettled = true;
    if (market.bonds.dispute) market.bonds.dispute.isSettled = true;
    market.bonds.oracle.isSettled = true;
    if (market.bonds.outsider) market.bonds.outsider.isSettled = true;
  }

  const historicalAccountBalances: HistoricalAccountBalance[] = [];
  const historicalAssets: HistoricalAsset[] = [];
  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);

  await Promise.all(
    market.outcomeAssets.map(async (outcomeAsset, i) => {
      if (market.marketType.categorical && event.block.specVersion < 40 && i !== +market.resolvedOutcome!) {
        const abs = await store.find(AccountBalance, {
          where: { assetId: outcomeAsset },
          relations: { account: true },
        });
        abs.map(async (ab) => {
          if (ab.balance === BigInt(0)) return;
          const hab = new HistoricalAccountBalance({
            accountId: ab.account.accountId,
            assetId: ab.assetId,
            blockNumber: event.block.height,
            dBalance: -ab.balance,
            event: event.name.split('.')[1],
            extrinsic: extrinsicFromEvent(event),
            id: event.id + '-' + marketId + i + '-' + ab.account.accountId.slice(-5),
            timestamp: new Date(event.block.timestamp!),
          });
          historicalAccountBalances.push(hab);
        });
      }

      const asset = await store.get(Asset, {
        where: { assetId: market.outcomeAssets[i] },
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
        if (event.block.specVersion < 40) {
          newAssetQty = i == +market.resolvedOutcome! ? oldAssetQty : BigInt(0);
        }
      }
      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: null,
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: newAssetQty,
        newPrice,
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAssets.push(ha);
    })
  );

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.MarketResolved,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: market.resolvedOutcome,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  return { historicalAccountBalances, historicalAssets, historicalMarket };
};

export const marketStartedWithSubsidy = async (store: Store, event: Event) => {
  const { marketId, status } = decodeMarketStartedWithSubsidyEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = status ? formatMarketStatus(status) : MarketStatus.Active;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: BigInt(0),
    dVolume: BigInt(0),
    event: MarketEvent.MarketStartedWithSubsidy,
    id: event.id + '-' + marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const redeemShares = async (store: Store, call: Call) => {
  let accId;
  if (call.origin) {
    accId = call.origin.value.value;
  } else if (call.extrinsic && call.extrinsic.signature && call.extrinsic.signature.address) {
    accId = (call.extrinsic.signature.address as any).value;
  }
  const accountId = ss58.encode({ prefix: 73, bytes: accId });
  const { marketId } = decodeRedeemSharesCall(call);
  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  const ab = await store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId: JSON.stringify(util.AssetIdFromString(`[${marketId},${market.resolvedOutcome}]`)),
  });
  if (!ab) return;

  const oldBalance = ab.balance;
  ab.balance = BigInt(0);
  console.log(`[${call.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ab.assetId,
    blockNumber: call.block.height,
    dBalance: ab.balance - oldBalance,
    event: call.name.split('.')[1],
    extrinsic: call.extrinsic ? new Extrinsic({ name: call.name, hash: call.extrinsic.hash }) : null,
    id: call.id + '-' + accountId.slice(-5),
    timestamp: new Date(call.block.timestamp!),
  });
  console.log(`[${call.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const soldCompleteSet = async (store: Store, event: Event): Promise<HistoricalAccountBalance[] | undefined> => {
  const { marketId, amount, accountId } = decodeSoldCompleteSetEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
  });
  if (!market) return;

  let amt = BigInt(0);
  if (amount !== BigInt(0)) {
    amt = amount;
  } else if (event.extrinsic && event.extrinsic.call) {
    if (event.extrinsic.call.args.amount) {
      const amount = event.extrinsic.call.args.amount.toString();
      amt = BigInt(amount);
    } else if (event.extrinsic.call.args.calls) {
      for (let call of event.extrinsic.call.args.calls as Array<{
        __kind: string;
        value: { __kind: string; amount: string; marketId: string };
      }>) {
        const {
          __kind: prefix,
          value: { __kind: name, amount: amount, marketId: id },
        } = call;
        if (prefix === Pallet.PredictionMarkets && name === SELL_COMPLETE_SET && +id === marketId) {
          amt = BigInt(amount);
          break;
        }
      }
    }
  }

  const habs: HistoricalAccountBalance[] = [];
  for (let i = 0; i < market.outcomeAssets.length; i++) {
    const hab = new HistoricalAccountBalance({
      accountId,
      assetId: market.outcomeAssets[i],
      blockNumber: event.block.height,
      dBalance: -amt,
      event: event.name.split('.')[1],
      extrinsic: extrinsicFromEvent(event),
      id: event.id + '-' + marketId + i + '-' + accountId.slice(-5),
      timestamp: new Date(event.block.timestamp!),
    });
    habs.push(hab);
  }
  return habs;
};

export const tokensRedeemed = async (event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, amountRedeemed, accountId } = decodeTokensRedeemedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: event.block.height,
    dBalance: -amountRedeemed,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};
