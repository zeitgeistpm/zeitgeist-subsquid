import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import {
  SwapsArbitrageBuyBurnEvent,
  SwapsArbitrageMintSellEvent,
  SwapsPoolActiveEvent,
  SwapsPoolClosedEvent,
  SwapsPoolCreateEvent,
  SwapsPoolDestroyedEvent,
  SwapsPoolExitEvent,
  SwapsPoolExitWithExactAssetAmountEvent,
  SwapsPoolJoinEvent,
  SwapsPoolJoinWithExactAssetAmountEvent,
  SwapsSwapExactAmountInEvent,
  SwapsSwapExactAmountOutEvent,
} from '../../types/events';
import { PoolAssetEvent, PoolAssetsEvent } from '../../types/v41';
import { SwapEvent } from '../../types/v41';
import { CommonPoolEventParams, Pool } from '../../types/v41';

export const getArbitrageBuyBurnEvent = (ctx: Ctx, item: EventItem): ArbitrageEvent => {
  const event = new SwapsArbitrageBuyBurnEvent(ctx, item.event);
  if (event.isV41) {
    const [poolId, amount] = event.asV41;
    return { poolId, amount };
  } else {
    const [poolId, amount] = item.event.args;
    return { poolId, amount };
  }
};

export const getArbitrageMintSellEvent = (ctx: Ctx, item: EventItem): ArbitrageEvent => {
  const event = new SwapsArbitrageMintSellEvent(ctx, item.event);
  if (event.isV41) {
    const [poolId, amount] = event.asV41;
    return { poolId, amount };
  } else {
    const [poolId, amount] = item.event.args;
    return { poolId, amount };
  }
};

export const getPoolActiveEvent = (ctx: Ctx, item: EventItem): PoolEvent => {
  const poolActiveEvent = new SwapsPoolActiveEvent(ctx, item.event);
  if (poolActiveEvent.isV39) {
    const poolId = poolActiveEvent.asV39;
    return { poolId };
  } else {
    const [poolId] = item.event.args;
    return { poolId };
  }
};

export const getPoolClosedEvent = (ctx: Ctx, item: EventItem): PoolEvent => {
  const poolCloseEvent = new SwapsPoolClosedEvent(ctx, item.event);
  if (poolCloseEvent.isV37) {
    const poolId = poolCloseEvent.asV37;
    return { poolId };
  } else {
    const [poolId] = item.event.args;
    return { poolId };
  }
};

export const getPoolCreateEvent = (ctx: Ctx, item: EventItem): PoolCreateEvent => {
  const event = new SwapsPoolCreateEvent(ctx, item.event);
  let accountId = ``;
  if (event.isV23) {
    const [cpep, pool] = event.asV23;
    let swapPool = pool as Pool;
    const amount = BigInt(0);
    return { cpep, swapPool, amount, accountId };
  } else if (event.isV32) {
    const [cpep, pool] = event.asV32;
    let swapPool = pool as Pool;
    const amount = BigInt(0);
    return { cpep, swapPool, amount, accountId };
  } else if (event.isV35) {
    const [cpep, pool, amount] = event.asV35;
    let swapPool = pool as Pool;
    return { cpep, swapPool, amount, accountId };
  } else if (event.isV36) {
    const [cpep, pool, amount, account] = event.asV36;
    let swapPool = pool as Pool;
    accountId = ss58.codec('zeitgeist').encode(account);
    return { cpep, swapPool, amount, accountId };
  } else if (event.isV37) {
    const [cpep, swapPool, amount, account] = event.asV37;
    accountId = ss58.codec('zeitgeist').encode(account);
    return { cpep, swapPool, amount, accountId };
  } else if (event.isV39) {
    const [cpep, swapPool, amount, account] = event.asV39;
    accountId = ss58.codec('zeitgeist').encode(account);
    return { cpep, swapPool, amount, accountId };
  } else if (event.isV41) {
    const [cpep, swapPool, amount, account] = event.asV41;
    accountId = ss58.codec('zeitgeist').encode(account);
    return { cpep, swapPool, amount, accountId };
  } else {
    const [cpep, swapPool, amount, account] = item.event.args;
    accountId = encodeAddress(account, 73);
    return { cpep, swapPool, amount, accountId };
  }
};

export const getPoolDestroyedEvent = (ctx: Ctx, item: EventItem): PoolEvent => {
  const event = new SwapsPoolDestroyedEvent(ctx, item.event);
  if (event.isV36) {
    const poolId = event.asV36;
    return { poolId };
  } else {
    const [poolId] = item.event.args;
    return { poolId };
  }
};

export const getPoolExitEvent = (ctx: Ctx, item: EventItem): PoolExitEvent => {
  const event = new SwapsPoolExitEvent(ctx, item.event);
  if (event.isV23) {
    let pae = item.event.args as PoolAssetsEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV32) {
    let pae = item.event.args as PoolAssetsEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV35) {
    const pae = event.asV35;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else if (event.isV41) {
    const pae = event.asV41;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else {
    const pae = item.event.args;
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  }
};

export const getPoolExitWithExactAssetAmountEvent = (ctx: Ctx, item: EventItem): ExactAssetAmountEvent => {
  const event = new SwapsPoolExitWithExactAssetAmountEvent(ctx, item.event);
  if (event.isV23) {
    let pae = item.event.args as PoolAssetEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV26) {
    let pae = item.event.args as PoolAssetEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV32) {
    let pae = item.event.args as PoolAssetEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV35) {
    const pae = event.asV35;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else if (event.isV41) {
    const pae = event.asV41;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else {
    const pae = item.event.args;
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  }
};

export const getPoolJoinEvent = (ctx: Ctx, item: EventItem): PoolJoinEvent => {
  const event = new SwapsPoolJoinEvent(ctx, item.event);
  if (event.isV23) {
    let pae = item.event.args as PoolAssetsEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV32) {
    let pae = item.event.args as PoolAssetsEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV35) {
    const pae = event.asV35;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else if (event.isV41) {
    const pae = event.asV41;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else {
    const pae = item.event.args;
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  }
};

export const getPoolJoinWithExactAssetAmountEvent = (ctx: Ctx, item: EventItem): ExactAssetAmountEvent => {
  const event = new SwapsPoolJoinWithExactAssetAmountEvent(ctx, item.event);
  if (event.isV23) {
    let pae = item.event.args as PoolAssetEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV26) {
    let pae = item.event.args as PoolAssetEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV32) {
    let pae = item.event.args as PoolAssetEvent;
    pae.poolAmount = BigInt(0);
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  } else if (event.isV35) {
    const pae = event.asV35;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else if (event.isV41) {
    const pae = event.asV41;
    const walletId = ss58.codec('zeitgeist').encode(pae.cpep.who);
    return { pae, walletId };
  } else {
    const pae = item.event.args;
    const walletId = encodeAddress(pae.cpep.who, 73);
    return { pae, walletId };
  }
};

export const getSwapExactAmountInEvent = (ctx: Ctx, item: EventItem): SwapExactAmountInEvent => {
  const event = new SwapsSwapExactAmountInEvent(ctx, item.event);
  if (event.isV23) {
    let swapEvent = item.event.args as SwapEvent;
    const walletId = encodeAddress(swapEvent.cpep.who, 73);
    return { swapEvent, walletId };
  } else if (event.isV32) {
    let swapEvent = item.event.args as SwapEvent;
    const walletId = encodeAddress(swapEvent.cpep.who, 73);
    return { swapEvent, walletId };
  } else if (event.isV37) {
    const swapEvent = event.asV37;
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who);
    return { swapEvent, walletId };
  } else if (event.isV41) {
    const swapEvent = event.asV41;
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who);
    return { swapEvent, walletId };
  } else {
    const swapEvent = item.event.args;
    const walletId = encodeAddress(swapEvent.cpep.who, 73);
    return { swapEvent, walletId };
  }
};

export const getSwapExactAmountOutEvent = (ctx: Ctx, item: EventItem): SwapExactAmountOutEvent => {
  const event = new SwapsSwapExactAmountOutEvent(ctx, item.event);
  if (event.isV23) {
    let swapEvent = item.event.args as SwapEvent;
    const walletId = encodeAddress(swapEvent.cpep.who, 73);
    return { swapEvent, walletId };
  } else if (event.isV32) {
    let swapEvent = item.event.args as SwapEvent;
    const walletId = encodeAddress(swapEvent.cpep.who, 73);
    return { swapEvent, walletId };
  } else if (event.isV37) {
    const swapEvent = event.asV37;
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who);
    return { swapEvent, walletId };
  } else if (event.isV41) {
    const swapEvent = event.asV41;
    const walletId = ss58.codec('zeitgeist').encode(swapEvent.cpep.who);
    return { swapEvent, walletId };
  } else {
    const swapEvent = item.event.args;
    const walletId = encodeAddress(swapEvent.cpep.who, 73);
    return { swapEvent, walletId };
  }
};

interface ArbitrageEvent {
  poolId: bigint;
  amount: bigint;
}

interface PoolEvent {
  poolId: bigint;
}

interface PoolCreateEvent {
  cpep: CommonPoolEventParams;
  swapPool: Pool;
  amount: bigint;
  accountId: string;
}

interface PoolJoinEvent {
  pae: PoolAssetsEvent;
  walletId: string;
}

interface ExactAssetAmountEvent {
  pae: PoolAssetEvent;
  walletId: string;
}

interface PoolExitEvent {
  pae: PoolAssetsEvent;
  walletId: string;
}

interface SwapExactAmountInEvent {
  swapEvent: SwapEvent;
  walletId: string;
}

interface SwapExactAmountOutEvent {
  swapEvent: SwapEvent;
  walletId: string;
}
