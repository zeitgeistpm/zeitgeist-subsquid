import * as ss58 from '@subsquid/ss58';
import { Asset as Asset_v51 } from '../../types/v51';
import { Asset as Asset_v54 } from '../../types/v54';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const decodeBuyExecutedEvent = (event: Event): BuySellExecutedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    amountIn: bigint;
    amountOut: bigint;
    assetOut: Asset_v51 | Asset_v54;
    swapFeeAmount: bigint;
    externalFeeAmount: bigint;
  };
  if (events.neoSwaps.buyExecuted.v50.is(event)) {
    decoded = events.neoSwaps.buyExecuted.v50.decode(event);
  } else if (events.neoSwaps.buyExecuted.v51.is(event)) {
    decoded = events.neoSwaps.buyExecuted.v51.decode(event);
  } else if (events.neoSwaps.buyExecuted.v54.is(event)) {
    decoded = events.neoSwaps.buyExecuted.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    who: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    assetExecuted: formatAssetId(decoded.assetOut),
    amountIn: BigInt(decoded.amountIn),
    amountOut: BigInt(decoded.amountOut),
    swapFeeAmount: BigInt(decoded.swapFeeAmount),
    externalFeeAmount: BigInt(decoded.externalFeeAmount),
  };
};

export const decodeExitExecutedEvent = (event: Event): JoinExitExecutedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    poolSharesAmount: bigint;
    newLiquidityParameter: bigint;
  };
  if (events.neoSwaps.exitExecuted.v50.is(event)) {
    decoded = events.neoSwaps.exitExecuted.v50.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    who: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    poolSharesAmount: BigInt(decoded.poolSharesAmount),
    newLiquidityParameter: BigInt(decoded.newLiquidityParameter),
  };
};

export const decodeFeesWithdrawnEvent = (event: Event): FeesWithdrawnEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    amount: bigint;
  };
  if (events.neoSwaps.feesWithdrawn.v50.is(event)) {
    decoded = events.neoSwaps.feesWithdrawn.v50.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    who: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    amount: BigInt(decoded.amount),
  };
};

export const decodeJoinExecutedEvent = (event: Event): JoinExitExecutedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    poolSharesAmount: bigint;
    newLiquidityParameter: bigint;
  };
  if (events.neoSwaps.joinExecuted.v50.is(event)) {
    decoded = events.neoSwaps.joinExecuted.v50.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    who: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    poolSharesAmount: BigInt(decoded.poolSharesAmount),
    newLiquidityParameter: BigInt(decoded.newLiquidityParameter),
  };
};

export const decodePoolDeployedEvent = (event: Event): PoolDeployedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    accountId: string;
    collateral: Asset_v51 | Asset_v54;
    liquidityParameter: bigint;
    poolSharesAmount: bigint;
    swapFee: bigint;
  };
  if (events.neoSwaps.poolDeployed.v50.is(event)) {
    decoded = events.neoSwaps.poolDeployed.v50.decode(event) as any;
    decoded.accountId = NeoPoolAccountIdAsV50[Number(decoded.marketId)];
    decoded.collateral = { __kind: _Asset.Ztg };
    decoded.swapFee = BigInt(10 ** 8);
  } else if (events.neoSwaps.poolDeployed.v51.is(event)) {
    decoded = events.neoSwaps.poolDeployed.v51.decode(event);
  } else if (events.neoSwaps.poolDeployed.v54.is(event)) {
    decoded = events.neoSwaps.poolDeployed.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    who: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    accountId: ss58.encode({ prefix: 73, bytes: decoded.accountId }),
    collateral: formatAssetId(decoded.collateral),
    liquidityParameter: BigInt(decoded.liquidityParameter),
    poolSharesAmount: BigInt(decoded.poolSharesAmount),
    swapFee: BigInt(decoded.swapFee),
  };
};

export const decodeSellExecutedEvent = (event: Event): BuySellExecutedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    assetIn: Asset_v51 | Asset_v54;
    amountIn: bigint;
    amountOut: bigint;
    swapFeeAmount: bigint;
    externalFeeAmount: bigint;
  };
  if (events.neoSwaps.sellExecuted.v50.is(event)) {
    decoded = events.neoSwaps.sellExecuted.v50.decode(event);
  } else if (events.neoSwaps.sellExecuted.v51.is(event)) {
    decoded = events.neoSwaps.sellExecuted.v51.decode(event);
  } else if (events.neoSwaps.sellExecuted.v54.is(event)) {
    decoded = events.neoSwaps.sellExecuted.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    who: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    assetExecuted: formatAssetId(decoded.assetIn),
    amountIn: BigInt(decoded.amountIn),
    amountOut: BigInt(decoded.amountOut),
    swapFeeAmount: BigInt(decoded.swapFeeAmount),
    externalFeeAmount: BigInt(decoded.externalFeeAmount),
  };
};

const NeoPoolAccountIdAsV50: INeoPoolAccountIdAsV50 = {
  741: '0x6d6f646c7a67652f6e656f73e502000000000000000000000000000000000000',
  742: '0x6d6f646c7a67652f6e656f73e602000000000000000000000000000000000000',
  745: '0x6d6f646c7a67652f6e656f73e902000000000000000000000000000000000000',
  746: '0x6d6f646c7a67652f6e656f73ea02000000000000000000000000000000000000',
  750: '0x6d6f646c7a67652f6e656f73ee02000000000000000000000000000000000000',
};

interface BuySellExecutedEvent {
  who: string;
  marketId: number;
  assetExecuted: string;
  amountIn: bigint;
  amountOut: bigint;
  swapFeeAmount: bigint;
  externalFeeAmount: bigint;
}

interface FeesWithdrawnEvent {
  who: string;
  marketId: number;
  amount: bigint;
}

interface JoinExitExecutedEvent {
  who: string;
  marketId: number;
  poolSharesAmount: bigint;
  newLiquidityParameter: bigint;
}

interface PoolDeployedEvent {
  who: string;
  marketId: number;
  accountId: string;
  collateral: string;
  liquidityParameter: bigint;
  poolSharesAmount: bigint;
  swapFee: bigint;
}

interface INeoPoolAccountIdAsV50 {
  [marketId: number]: string;
}
