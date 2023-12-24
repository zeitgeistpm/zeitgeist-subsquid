import * as ss58 from '@subsquid/ss58';
import { Asset } from '../../types/v51';
import { events } from '../../types';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const decodeBuyExecutedEvent = (event: Event): BuySellExecutedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    amountIn: bigint;
    amountOut: bigint;
    assetOut: Asset;
    swapFeeAmount: bigint;
  };
  if (events.neoSwaps.buyExecuted.v50.is(event)) {
    decoded = events.neoSwaps.buyExecuted.v50.decode(event);
  } else if (events.neoSwaps.buyExecuted.v51.is(event)) {
    decoded = events.neoSwaps.buyExecuted.v51.decode(event);
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
    collateral: Asset;
    liquidityParameter: bigint;
    poolSharesAmount: bigint;
    swapFee: bigint;
  };
  if (events.neoSwaps.poolDeployed.v50.is(event)) {
    decoded = events.neoSwaps.poolDeployed.v50.decode(event) as any;
    decoded.accountId = NeoPoolAsV50[Number(decoded.marketId)].accountId;
    decoded.collateral = NeoPoolAsV50[Number(decoded.marketId)].collateral;
    decoded.swapFee = NeoPoolAsV50[Number(decoded.marketId)].swapFee;
  } else if (events.neoSwaps.poolDeployed.v51.is(event)) {
    decoded = events.neoSwaps.poolDeployed.v51.decode(event);
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
    assetIn: Asset;
    amountIn: bigint;
    amountOut: bigint;
    swapFeeAmount: bigint;
  };
  if (events.neoSwaps.sellExecuted.v50.is(event)) {
    decoded = events.neoSwaps.sellExecuted.v50.decode(event);
  } else if (events.neoSwaps.sellExecuted.v51.is(event)) {
    decoded = events.neoSwaps.sellExecuted.v51.decode(event);
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
  };
};

const NeoPoolAsV50: INeoPoolAsV50 = {
  741: {
    accountId: 'dE1VdxVn8xy7HFDWPpBWLGGA8ciJ6C6oRSmMbNwtXuar9ncAR',
    collateral: { __kind: 'Ztg' },
    swapFee: BigInt('100000000'),
  },
  742: {
    accountId: 'dE1VdxVn8xy7HFDWPpBWc1HhijCyHeeuJBSJ6vtaNNQit4DNN',
    collateral: { __kind: 'Ztg' },
    swapFee: BigInt('100000000'),
  },
  745: {
    accountId: 'dE1VdxVn8xy7HFDWPpBXRENLV4gzt2KCvPT7daidsktM4sBgc',
    collateral: { __kind: 'Ztg' },
    swapFee: BigInt('100000000'),
  },
  746: {
    accountId: 'dE1VdxVn8xy7HFDWPpBXgyPt5BBg5UsJo88498fKiDiDo8rrN',
    collateral: { __kind: 'Ztg' },
    swapFee: BigInt('100000000'),
  },
  750: {
    accountId: 'dE1VdxVn8xy7HFDWPpBYmwW4RdANsK5iJ4opBLS5451iiDR1X',
    collateral: { __kind: 'Ztg' },
    swapFee: BigInt('100000000'),
  },
};

interface BuySellExecutedEvent {
  who: string;
  marketId: number;
  assetExecuted: string;
  amountIn: bigint;
  amountOut: bigint;
  swapFeeAmount: bigint;
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

interface INeoPoolAsV50 {
  [marketId: number]: {
    accountId: string;
    collateral: Asset;
    swapFee: bigint;
  };
}
