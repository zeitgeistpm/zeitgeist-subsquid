import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import {
  BalancesBalanceSetEvent,
  BalancesDepositEvent,
  BalancesDustLostEvent,
  BalancesReservedEvent,
  BalancesSlashedEvent,
  BalancesTransferEvent,
  BalancesUnreservedEvent,
  BalancesWithdrawEvent,
} from '../../types/events';

export const getBalanceSetEvent = (ctx: Ctx, item: EventItem): BalanceSetEvent => {
  // @ts-ignore
  const event = new BalancesBalanceSetEvent(ctx, item.event);
  if (event.isV23) {
    const [who, free] = event.asV23;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, free };
  } else if (event.isV34) {
    const { who, free } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, free };
  } else {
    const [account, free] = item.event.args;
    const walletId = encodeAddress(account, 73);
    return { walletId, free };
  }
};

export const getDepositEvent = (ctx: Ctx, item: EventItem): BalancesEvent => {
  const event = new BalancesDepositEvent(ctx, item.event);
  if (event.isV23) {
    const [who, amount] = event.asV23;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else if (event.isV34) {
    const { who, amount } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else {
    const [who, amount] = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, amount };
  }
};

export const getDustLostEvent = (ctx: Ctx, item: EventItem): BalancesEvent => {
  const event = new BalancesDustLostEvent(ctx, item.event);
  if (event.isV23) {
    const [account, amount] = event.asV23;
    const walletId = ss58.codec('zeitgeist').encode(account);
    return { walletId, amount };
  } else if (event.isV34) {
    const { account, amount } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(account);
    return { walletId, amount };
  } else {
    const [account, amount] = item.event.args;
    const walletId = encodeAddress(account, 73);
    return { walletId, amount };
  }
};

export const getReservedEvent = (ctx: Ctx, item: EventItem): BalancesEvent => {
  const event = new BalancesReservedEvent(ctx, item.event);
  if (event.isV23) {
    const [who, amount] = event.asV23;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else if (event.isV34) {
    const { who, amount } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else {
    const [who, amount] = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, amount };
  }
};

export const getSlashedEvent = (ctx: Ctx, item: EventItem): BalancesEvent => {
  const event = new BalancesSlashedEvent(ctx, item.event);
  if (event.isV33) {
    const [who, amount] = event.asV33;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else if (event.isV34) {
    const { who, amount } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else {
    const [who, amount] = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, amount };
  }
};

export const getTransferEvent = (ctx: Ctx, item: EventItem): TransferEvent => {
  const event = new BalancesTransferEvent(ctx, item.event);
  if (event.isV23) {
    const [from, to, amount] = event.asV23;
    const fromId = ss58.codec('zeitgeist').encode(from);
    const toId = ss58.codec('zeitgeist').encode(to);
    return { fromId, toId, amount };
  } else if (event.isV34) {
    const { from, to, amount } = event.asV34;
    const fromId = ss58.codec('zeitgeist').encode(from);
    const toId = ss58.codec('zeitgeist').encode(to);
    return { fromId, toId, amount };
  } else {
    const [from, to, amount] = item.event.args;
    const fromId = encodeAddress(from, 73);
    const toId = encodeAddress(to, 73);
    return { fromId, toId, amount };
  }
};

export const getUnreservedEvent = (ctx: Ctx, item: EventItem): BalancesEvent => {
  const event = new BalancesUnreservedEvent(ctx, item.event);
  if (event.isV23) {
    const [who, amount] = event.asV23;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else if (event.isV34) {
    const { who, amount } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else {
    const [who, amount] = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, amount };
  }
};

export const getWithdrawEvent = (ctx: Ctx, item: EventItem): BalancesEvent => {
  const event = new BalancesWithdrawEvent(ctx, item.event);
  if (event.isV33) {
    const [who, amount] = event.asV33;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else if (event.isV34) {
    const { who, amount } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else {
    const [who, amount] = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, amount };
  }
};

interface BalancesEvent {
  walletId: string;
  amount: bigint;
}

interface BalanceSetEvent {
  walletId: string;
  free: bigint;
}

interface EndowedEvent {
  walletId: string;
  freeBalance: bigint;
}

interface TransferEvent {
  fromId: string;
  toId: string;
  amount: bigint;
}
