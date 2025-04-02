import * as ss58 from '@subsquid/ss58';
// import {
//   Pool as Pool_v23,
//   PoolAssetEvent as PoolAssetEvent_v23,
//   PoolAssetsEvent as PoolAssetsEvent_v23,
//   SwapEvent as SwapEvent_v23,
// } from '../../types/v23';
import {
  Pool as Pool_v32,
  PoolAssetEvent as PoolAssetEvent_v32,
  PoolAssetsEvent as PoolAssetsEvent_v32,
  SwapEvent as SwapEvent_v32
} from '../../types/v32';
import {
  CommonPoolEventParams,
  Pool as Pool_v41,
  PoolAssetEvent as PoolAssetEvent_v41,
  PoolAssetsEvent as PoolAssetsEvent_v41,
  SwapEvent as SwapEvent_v41,
} from '../../types/v41';
import { calls, events } from '../../types';
import { Call, Event } from '../../processor';

export const decodeArbitrageBuyBurnEvent = (event: Event): PoolEvent => {
  let poolId: bigint;
  if (events.swaps.arbitrageBuyBurn.v41.is(event)) {
    [poolId] = events.swaps.arbitrageBuyBurn.v41.decode(event);
  } else {
    [poolId] = event.args;
  }
  return { poolId: Number(poolId) };
};

export const decodeArbitrageMintSellEvent = (event: Event): PoolEvent => {
  let poolId: bigint;
  if (events.swaps.arbitrageMintSell.v41.is(event)) {
    [poolId] = events.swaps.arbitrageMintSell.v41.decode(event);
  } else {
    [poolId] = event.args;
  }
  return { poolId: Number(poolId) };
};

export const decodePoolActiveEvent = (event: Event): PoolEvent => {
  let poolId: bigint;
  if (events.swaps.poolActive.v39.is(event)) {
    poolId = events.swaps.poolActive.v39.decode(event);
  } else {
    [poolId] = event.args;
  }
  return { poolId: Number(poolId) };
};

export const decodePoolClosedEvent = (event: Event): PoolEvent => {
  let poolId: bigint;
  if (events.swaps.poolClosed.v37.is(event)) {
    poolId = events.swaps.poolClosed.v37.decode(event);
  } else {
    [poolId] = event.args;
  }
  return { poolId: Number(poolId) };
};

export const decodePoolCreateEvent = (event: Event): PoolCreateEvent => {
  let cpep: CommonPoolEventParams, pool: Pool_v32 | Pool_v41, amount: bigint | undefined, accountId: string | undefined;
  // if (events.swaps.poolCreate.v23.is(event)) {
  //   [cpep, pool] = events.swaps.poolCreate.v23.decode(event);
  // } 
  if (events.swaps.poolCreate.v32.is(event)) {
    [cpep, pool] = events.swaps.poolCreate.v32.decode(event);
  } else if (events.swaps.poolCreate.v35.is(event)) {
    [cpep, pool, amount] = events.swaps.poolCreate.v35.decode(event);
  } else if (events.swaps.poolCreate.v36.is(event)) {
    [cpep, pool, amount, accountId] = events.swaps.poolCreate.v36.decode(event);
  } else if (events.swaps.poolCreate.v37.is(event)) {
    [cpep, pool, amount, accountId] = events.swaps.poolCreate.v37.decode(event);
  } else if (events.swaps.poolCreate.v39.is(event)) {
    [cpep, pool, amount, accountId] = events.swaps.poolCreate.v39.decode(event);
  } else if (events.swaps.poolCreate.v41.is(event)) {
    [cpep, pool, amount, accountId] = events.swaps.poolCreate.v41.decode(event);
  } else {
    [cpep, pool, amount, accountId] = event.args;
  }
  return {
    cpep,
    pool,
    amount: amount ? BigInt(amount) : undefined,
    accountId: accountId ? ss58.encode({ prefix: 73, bytes: accountId }) : undefined,
  };
};

export const decodePoolDestroyedEvent = (event: Event): PoolEvent => {
  let poolId: bigint;
  if (events.swaps.poolDestroyed.v36.is(event)) {
    poolId = events.swaps.poolDestroyed.v36.decode(event);
  } else {
    [poolId] = event.args;
  }
  return { poolId: Number(poolId) };
};

export const decodePoolExitEvent = (event: Event): PoolExitJoinEvent => {
  let pae: PoolAssetsEvent_v32 | PoolAssetsEvent_v41;
  // if (events.swaps.poolExit.v23.is(event)) {
  //   pae = events.swaps.poolExit.v23.decode(event);
  // } 
  if (events.swaps.poolExit.v26.is(event)) {
    pae = events.swaps.poolExit.v26.decode(event);
  } else if (events.swaps.poolExit.v32.is(event)) {
    pae = events.swaps.poolExit.v32.decode(event);
  } else if (events.swaps.poolExit.v35.is(event)) {
    pae = events.swaps.poolExit.v35.decode(event);
  } else if (events.swaps.poolExit.v41.is(event)) {
    pae = events.swaps.poolExit.v41.decode(event);
  } else {
    pae = event.args;
  }
  return { pae };
};

export const decodePoolExitWithExactAssetAmountEvent = (event: Event): ExactAssetAmountEvent => {
  let pae: PoolAssetEvent_v32 | PoolAssetEvent_v41;
  // if (events.swaps.poolExitWithExactAssetAmount.v23.is(event)) {
  //   pae = events.swaps.poolExitWithExactAssetAmount.v23.decode(event);
  // } 
  if (events.swaps.poolExitWithExactAssetAmount.v26.is(event)) {
    pae = events.swaps.poolExitWithExactAssetAmount.v26.decode(event);
  } else if (events.swaps.poolExitWithExactAssetAmount.v32.is(event)) {
    pae = events.swaps.poolExitWithExactAssetAmount.v32.decode(event);
  } else if (events.swaps.poolExitWithExactAssetAmount.v35.is(event)) {
    pae = events.swaps.poolExitWithExactAssetAmount.v35.decode(event);
  } else if (events.swaps.poolExitWithExactAssetAmount.v41.is(event)) {
    pae = events.swaps.poolExitWithExactAssetAmount.v41.decode(event);
  } else {
    pae = event.args;
  }
  return { pae };
};

export const decodePoolJoinEvent = (event: Event): PoolExitJoinEvent => {
  let pae: PoolAssetsEvent_v32 | PoolAssetsEvent_v41;
  // if (events.swaps.poolJoin.v23.is(event)) {
  //   pae = events.swaps.poolJoin.v23.decode(event);
  // } 
  if (events.swaps.poolJoin.v26.is(event)) {
    pae = events.swaps.poolJoin.v26.decode(event);
  } else if (events.swaps.poolJoin.v32.is(event)) {
    pae = events.swaps.poolJoin.v32.decode(event);
  } else if (events.swaps.poolJoin.v35.is(event)) {
    pae = events.swaps.poolJoin.v35.decode(event);
  } else if (events.swaps.poolJoin.v41.is(event)) {
    pae = events.swaps.poolJoin.v41.decode(event);
  } else {
    pae = event.args;
  }
  return { pae };
};

export const decodePoolJoinWithExactAssetAmountEvent = (event: Event): ExactAssetAmountEvent => {
  let pae: PoolAssetEvent_v32 | PoolAssetEvent_v41;
  // if (events.swaps.poolJoinWithExactAssetAmount.v23.is(event)) {
  //   pae = events.swaps.poolJoinWithExactAssetAmount.v23.decode(event);
  // } 
  if (events.swaps.poolJoinWithExactAssetAmount.v26.is(event)) {
    pae = events.swaps.poolJoinWithExactAssetAmount.v26.decode(event);
  } else if (events.swaps.poolJoinWithExactAssetAmount.v32.is(event)) {
    pae = events.swaps.poolJoinWithExactAssetAmount.v32.decode(event);
  } else if (events.swaps.poolJoinWithExactAssetAmount.v35.is(event)) {
    pae = events.swaps.poolJoinWithExactAssetAmount.v35.decode(event);
  } else if (events.swaps.poolJoinWithExactAssetAmount.v41.is(event)) {
    pae = events.swaps.poolJoinWithExactAssetAmount.v41.decode(event);
  } else {
    pae = event.args;
  }
  return { pae };
};

export const decodeSwapExactAmountInEvent = (event: Event): SwapEvent => {
  let swapEvent: SwapEvent_v32 | SwapEvent_v41;
  // if (events.swaps.swapExactAmountIn.v23.is(event)) {
  //   swapEvent = events.swaps.swapExactAmountIn.v23.decode(event);
  // } 
  if (events.swaps.swapExactAmountIn.v32.is(event)) {
    swapEvent = events.swaps.swapExactAmountIn.v32.decode(event);
  } else if (events.swaps.swapExactAmountIn.v37.is(event)) {
    swapEvent = events.swaps.swapExactAmountIn.v37.decode(event);
  } else if (events.swaps.swapExactAmountIn.v41.is(event)) {
    swapEvent = events.swaps.swapExactAmountIn.v41.decode(event);
  } else {
    swapEvent = event.args;
  }
  return { swapEvent };
};

export const decodeSwapExactAmountOutEvent = (event: Event): SwapEvent => {
  let swapEvent: SwapEvent_v32 | SwapEvent_v41;
  // if (events.swaps.swapExactAmountOut.v23.is(event)) {
  //   swapEvent = events.swaps.swapExactAmountOut.v23.decode(event);
  // } 
  if (events.swaps.swapExactAmountOut.v32.is(event)) {
    swapEvent = events.swaps.swapExactAmountOut.v32.decode(event);
  } else if (events.swaps.swapExactAmountOut.v37.is(event)) {
    swapEvent = events.swaps.swapExactAmountOut.v37.decode(event);
  } else if (events.swaps.swapExactAmountOut.v41.is(event)) {
    swapEvent = events.swaps.swapExactAmountOut.v41.decode(event);
  } else {
    swapEvent = event.args;
  }
  return { swapEvent };
};

export const decodePoolExitCall = (call: Call): PoolExitCall => {
  let decoded: { poolId: bigint; poolAmount: bigint };
  if (calls.swaps.poolExit.v26.is(call)) {
    decoded = calls.swaps.poolExit.v26.decode(call);
  } else {
    decoded = call.args;
  }
  return { poolId: Number(decoded.poolId), poolAmount: BigInt(decoded.poolAmount) };
};

interface ExactAssetAmountEvent {
  pae: PoolAssetEvent_v32 | PoolAssetEvent_v41;
}

interface PoolCreateEvent {
  cpep: CommonPoolEventParams;
  pool: Pool_v32 | Pool_v41;
  amount?: bigint;
  accountId?: string;
}

interface PoolEvent {
  poolId: number;
}

interface PoolExitJoinEvent {
  pae: PoolAssetsEvent_v32 | PoolAssetsEvent_v41;
}

interface PoolExitCall {
  poolId: number;
  poolAmount: bigint;
}

interface SwapEvent {
  swapEvent: SwapEvent_v32 | SwapEvent_v41;
}
