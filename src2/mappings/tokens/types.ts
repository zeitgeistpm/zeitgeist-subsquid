import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import {
  TokensBalanceSetEvent,
  TokensDepositedEvent,
  TokensEndowedEvent,
  TokensTransferEvent,
  TokensWithdrawnEvent,
} from '../../types/events';
import { getAssetId } from '../helper';

export const getTokensBalanceSetEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensBalanceSetEvent(ctx, item.event);
  let currencyId, who, walletId, amount;
  if (event.isV23) {
    [currencyId, who, amount] = event.asV23;
    walletId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV32) {
    [currencyId, who, amount] = event.asV32;
    walletId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV34) {
    currencyId = event.asV34.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV34.who);
    amount = event.asV34.free;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.free;
  } else {
    [currencyId, who, amount] = item.event.args;
    walletId = encodeAddress(who, 73);
  }
  const assetId = getAssetId(currencyId);
  return { assetId, walletId, amount };
};

export const getTokensDepositedEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensDepositedEvent(ctx, item.event);
  let currencyId, walletId, who, amount;
  if (event.isV36) {
    currencyId = event.asV36.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV36.who);
    amount = event.asV36.amount;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.amount;
  } else {
    [currencyId, who, amount] = item.event.args;
    walletId = encodeAddress(who, 73);
  }
  const assetId = getAssetId(currencyId);
  return { assetId, walletId, amount };
};

export const getTokensEndowedEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensEndowedEvent(ctx, item.event);
  let currencyId, walletId, who, amount;
  if (event.isV23) {
    [currencyId, who, amount] = event.asV23;
    walletId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV32) {
    [currencyId, who, amount] = event.asV32;
    walletId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV34) {
    currencyId = event.asV34.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV34.who);
    amount = event.asV34.amount;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.amount;
  } else {
    [currencyId, who, amount] = item.event.args;
    walletId = encodeAddress(who, 73);
  }
  const assetId = getAssetId(currencyId);
  return { assetId, walletId, amount };
};

export const getTokensTransferEvent = (ctx: Ctx, item: EventItem): TransferEvent => {
  const event = new TokensTransferEvent(ctx, item.event);
  let currencyId, from, fromId, to, toId, amount;
  if (event.isV23) {
    [currencyId, from, to, amount] = event.asV23;
    fromId = ss58.codec('zeitgeist').encode(from);
    toId = ss58.codec('zeitgeist').encode(to);
  } else if (event.isV32) {
    [currencyId, from, to, amount] = event.asV32;
    fromId = ss58.codec('zeitgeist').encode(from);
    toId = ss58.codec('zeitgeist').encode(to);
  } else if (event.isV34) {
    currencyId = event.asV34.currencyId;
    fromId = ss58.codec('zeitgeist').encode(event.asV34.from);
    toId = ss58.codec('zeitgeist').encode(event.asV34.to);
    amount = event.asV34.amount;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    fromId = ss58.codec('zeitgeist').encode(event.asV41.from);
    toId = ss58.codec('zeitgeist').encode(event.asV41.to);
    amount = event.asV41.amount;
  } else {
    [currencyId, from, to, amount] = item.event.args;
    fromId = encodeAddress(from, 73);
    toId = encodeAddress(to, 73);
  }
  const assetId = getAssetId(currencyId);
  return { assetId, fromId, toId, amount };
};

export const getTokensWithdrawnEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensWithdrawnEvent(ctx, item.event);
  let currencyId, walletId, who, amount;
  if (event.isV36) {
    currencyId = event.asV36.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV36.who);
    amount = event.asV36.amount;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    walletId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.amount;
  } else {
    [currencyId, who, amount] = item.event.args;
    walletId = encodeAddress(who, 73);
  }
  const assetId = getAssetId(currencyId);
  return { assetId, walletId, amount };
};

interface TokensEvent {
  assetId: string;
  walletId: string;
  amount: bigint;
}

interface TransferEvent {
  assetId: any;
  fromId: string;
  toId: string;
  amount: bigint;
}
