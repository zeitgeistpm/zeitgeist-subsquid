import { Store } from '@subsquid/typeorm-store';
import * as ss58 from '@subsquid/ss58';
import { util } from '@zeitgeistpm/sdk';
import { Like } from 'typeorm';
import {
  Account,
  AccountBalance,
  Asset,
  CategoryMetadata,
  DisputeMechanism,
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
  MarketPeriod,
  MarketReport,
  MarketStatus,
  MarketType,
  OutcomeReport,
  ScoringRule,
} from '../../model';
import {
  _Asset,
  createAssetsForMarket,
  decodeMarketMetadata,
  extrinsicFromEvent,
  formatAssetId,
  rescale,
} from '../../helper';
import { Block, Call, Event } from '../../processor';
import { Tools } from '../../util';
import {
  decodeBoughtCompleteSetEvent,
  decodeGlobalDisputeStartedEvent,
  decodeMarketApprovedEvent,
  decodeMarketClosedEvent,
  decodeMarketCreatedEvent,
  decodeMarketDestroyedEvent,
  decodeMarketDisputedEvent,
  decodeMarketExpiredEvent,
  decodeMarketInsufficientSubsidyEvent,
  decodeMarketRejectedEvent,
  decodeMarketReportedEvent,
  decodeMarketResolvedEvent,
  decodeMarketStartedWithSubsidyEvent,
  decodeMarketsStorage,
  decodeRedeemSharesCall,
  decodeSoldCompleteSetEvent,
  decodeTokensRedeemedEvent,
} from './decode';

export const boughtCompleteSet = async (
  store: Store,
  block: Block,
  event: Event
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { marketId, amount, accountId } = decodeBoughtCompleteSetEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market || block.specVersion > 35) return;

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
      for (let ext of event.extrinsic.call.args.calls as Array<{
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

  const habs: HistoricalAccountBalance[] = [];
  for (let i = 0; i < market.outcomeAssets.length; i++) {
    const hab = new HistoricalAccountBalance({
      accountId,
      assetId: market.outcomeAssets[i],
      blockNumber: block.height,
      dBalance: amt,
      event: event.name.split('.')[1],
      extrinsic: extrinsicFromEvent(event),
      id: event.id + '-' + marketId + i + '-' + accountId.slice(-5),
      timestamp: new Date(block.timestamp!),
    });
    habs.push(hab);
  }
  return habs;
};

export const globalDisputeStarted = async (store: Store, block: Block, event: Event) => {
  const { marketId } = decodeGlobalDisputeStartedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.GlobalDisputeStarted,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketApproved = async (store: Store, block: Block, event: Event) => {
  const { marketId } = decodeMarketApprovedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = market.scoringRule === 'CPMM' ? MarketStatus.Active : MarketStatus.CollectingSubsidy;
  if (market.bonds && market.creation === MarketCreation.Advised) {
    market.bonds.creation.isSettled = true;
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketApproved,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketClosed = async (store: Store, block: Block, event: Event) => {
  const { marketId } = decodeMarketClosedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.Closed;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketClosed,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketCreated = async (store: Store, block: Block, event: Event) => {
  const { marketId, accountId, market } = decodeMarketCreatedEvent(event, block.specVersion);

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
        blockNumber: block.height,
        dBalance: BigInt(0),
        event: event.name.split('.')[1],
        extrinsic: extrinsicFromEvent(event),
        id: event.id + '-' + accountId.slice(-5),
        timestamp: new Date(block.timestamp!),
      });
      console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
      await store.save<HistoricalAccountBalance>(hab);
    }
  }

  let disputeMechanism;
  switch (market.disputeMechanism.__kind) {
    case 'Authorized':
      disputeMechanism = DisputeMechanism.Authorized;
    case 'Court':
      disputeMechanism = DisputeMechanism.Court;
    case 'SimpleDisputes':
      disputeMechanism = DisputeMechanism.SimpleDisputes;
  }

  let scoringRule;
  switch (market.scoringRule.__kind) {
    case 'CPMM':
      scoringRule = ScoringRule.CPMM;
    case 'RikiddoSigmoidFeeMarketEma':
      scoringRule = ScoringRule.RikiddoSigmoidFeeMarketEma;
    case 'Lmsr':
      scoringRule = ScoringRule.Lmsr;
    case 'Orderbook':
      scoringRule = ScoringRule.Orderbook;
  }

  let status;
  switch (market.status.__kind) {
    case 'Active':
      status = MarketStatus.Active;
    case 'Proposed':
      status = MarketStatus.Proposed;
    default:
      status = MarketStatus.Active;
  }

  const newMarket = new Market({
    baseAsset: market.baseAsset ? formatAssetId(market.baseAsset) : 'Ztg',
    creation: market.creation.__kind == 'Advised' ? MarketCreation.Advised : MarketCreation.Permissionless,
    creator: ss58.encode({ prefix: 73, bytes: market.creator }),
    creatorFee: +market.creatorFee.toString(),
    disputeMechanism,
    id: event.id + '-' + marketId,
    marketId,
    metadata: market.metadata.toString(),
    oracle: ss58.encode({ prefix: 73, bytes: market.oracle }),
    outcomeAssets: (await createAssetsForMarket(marketId, market.marketType)) as string[],
    scoringRule,
    status,
  });

  if (market.disputeMechanism.__kind === 'Authorized') {
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
    if (block.specVersion < 41) {
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
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketCreated,
    id: event.id + '-' + marketId,
    market: newMarket,
    outcome: null,
    resolvedOutcome: null,
    status: newMarket.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketDestroyed = async (store: Store, block: Block, event: Event) => {
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
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketDestroyed,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
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
    blockNumber: block.height,
    dBalance: ab.balance - oldBalance,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + account.accountId.slice(-5),
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const marketDisputed = async (store: Store, block: Block, event: Event) => {
  const { marketId, accountId, outcome } = decodeMarketDisputedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  if (block.specVersion >= 42 && market.bonds) {
    const onChainBonds = await decodeMarketsStorage(block, BigInt(marketId));
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
  if (block.specVersion < 49) {
    if (!market.disputes) market.disputes = [];
    marketReport = new MarketReport({
      at: block.height,
      by: accountId,
      outcome: outcome
        ? new OutcomeReport({
            categorical: outcome.__kind == 'Categorical' ? outcome.value : null,
            scalar: outcome.__kind == 'Scalar' ? outcome.value : null,
          })
        : null,
    });
    market.disputes.push(marketReport);
  }
  market.status = MarketStatus.Disputed;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: accountId || market.bonds?.dispute?.who,
    event: MarketEvent.MarketDisputed,
    id: event.id + '-' + marketId,
    market,
    outcome: marketReport.outcome,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketExpired = async (store: Store, block: Block, event: Event) => {
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
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketExpired,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketInsufficientSubsidy = async (store: Store, block: Block, event: Event) => {
  const { marketId } = decodeMarketInsufficientSubsidyEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.InsufficientSubsidy;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketInsufficientSubsidy,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketRejected = async (store: Store, block: Block, event: Event) => {
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
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketRejected,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketReported = async (store: Store, block: Block, event: Event) => {
  const { marketId, at, by, outcome } = decodeMarketReportedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  const outcomeReport = new OutcomeReport({
    categorical: outcome.__kind == 'Categorical' ? outcome.value : null,
    scalar: outcome.__kind == 'Scalar' ? outcome.value : null,
  });

  const marketReport = new MarketReport({
    at,
    by,
    outcome: outcomeReport,
  });

  if (marketReport.by !== market.oracle && block.specVersion >= 46) {
    const onChainBonds = await decodeMarketsStorage(block, BigInt(marketId));
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
    blockNumber: block.height,
    by: marketReport.by,
    event: MarketEvent.MarketReported,
    id: event.id + '-' + marketId,
    market,
    outcome: outcomeReport,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const marketResolved = async (store: Store, block: Block, event: Event) => {
  const { marketId, report } = decodeMarketResolvedEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;

  market.resolvedOutcome =
    market.marketType.scalar && block.specVersion < 41 ? rescale(report.value.toString()) : report.value.toString();
  market.status = MarketStatus.Resolved;
  if (market.bonds) {
    if (market.creation === MarketCreation.Permissionless) market.bonds.creation.isSettled = true;
    if (market.bonds.dispute) market.bonds.dispute.isSettled = true;
    market.bonds.oracle.isSettled = true;
    if (market.bonds.outsider) market.bonds.outsider.isSettled = true;
  }
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketResolved,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: market.resolvedOutcome,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);

  await Promise.all(
    market.outcomeAssets.map(async (outcomeAsset, i) => {
      if (market.marketType.categorical && block.specVersion < 40 && i !== +market.resolvedOutcome!) {
        const abs = await store.find(AccountBalance, {
          where: { assetId: outcomeAsset! },
        });
        abs.map(async (ab) => {
          const accLookupKey = ab.id.substring(0, ab.id.indexOf('-'));
          const account = await store.get(Account, {
            where: { id: Like(`%${accLookupKey}%`) },
          });
          if (!account || ab.balance === BigInt(0)) return;
          const oldBalance = ab.balance;
          ab.balance = BigInt(0);
          console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
          await store.save<AccountBalance>(ab);

          const hab = new HistoricalAccountBalance({
            accountId: account.accountId,
            assetId: ab.assetId,
            blockNumber: block.height,
            dBalance: ab.balance - oldBalance,
            event: event.name.split('.')[1],
            extrinsic: extrinsicFromEvent(event),
            id: event.id + '-' + marketId + i + '-' + account.accountId.slice(-5),
            timestamp: new Date(block.timestamp!),
          });
          console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
          await store.save<HistoricalAccountBalance>(hab);
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
        if (block.specVersion < 40) {
          newAssetQty = i == +market.resolvedOutcome! ? oldAssetQty : BigInt(0);
        }
      }
      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: null,
        assetId: asset.assetId,
        baseAssetTraded: null,
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: newAssetQty,
        newPrice,
        timestamp: new Date(block.timestamp!),
      });
      console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
      await store.save<HistoricalAsset>(ha);
    })
  );
};

export const marketStartedWithSubsidy = async (store: Store, block: Block, event: Event) => {
  const { marketId } = decodeMarketStartedWithSubsidyEvent(event);

  const market = await store.get(Market, { where: { marketId } });
  if (!market) return;
  market.status = MarketStatus.Active;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketStartedWithSubsidy,
    id: event.id + '-' + marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};

export const redeemShares = async (store: Store, block: Block, call: Call) => {
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
    blockNumber: block.height,
    dBalance: ab.balance - oldBalance,
    event: call.name.split('.')[1],
    extrinsic: call.extrinsic ? new Extrinsic({ name: call.name, hash: call.extrinsic.hash }) : null,
    id: call.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${call.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const soldCompleteSet = async (
  store: Store,
  block: Block,
  event: Event
): Promise<HistoricalAccountBalance[] | undefined> => {
  const { marketId, amount, accountId } = decodeSoldCompleteSetEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
  });
  if (!market) return;

  let amt = BigInt(0);
  if (amount !== BigInt(0)) {
    amt = amount;
    // @ts-ignore
  } else if (event.extrinsic) {
    // @ts-ignore
    if (event.extrinsic.call.args.amount) {
      // @ts-ignore
      const amount = event.extrinsic.call.args.amount.toString();
      amt = BigInt(amount);
      // @ts-ignore
    } else if (event.extrinsic.call.args.calls) {
      // @ts-ignore
      for (let ext of event.extrinsic.call.args.calls as Array<{
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
    const hab = new HistoricalAccountBalance({
      accountId,
      assetId: market.outcomeAssets[i],
      blockNumber: block.height,
      dBalance: -amt,
      event: event.name.split('.')[1],
      extrinsic: extrinsicFromEvent(event),
      id: event.id + '-' + marketId + i + '-' + accountId.slice(-5),
      timestamp: new Date(block.timestamp!),
    });
    habs.push(hab);
  }
  return habs;
};

export const tokensRedeemed = async (block: Block, event: Event): Promise<HistoricalAccountBalance> => {
  const { assetId, amountRedeemed, accountId } = decodeTokensRedeemedEvent(event);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId,
    blockNumber: block.height,
    dBalance: -amountRedeemed,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(block.timestamp!),
  });
  return hab;
};
