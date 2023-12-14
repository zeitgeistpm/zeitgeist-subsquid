import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import {
  TokensBalanceSetEvent,
  TokensDepositedEvent,
  TokensReservedEvent,
  TokensTransferEvent,
  TokensWithdrawnEvent,
} from '../../types/events';
import { formatAssetId } from '../helper';

export const getTokensBalanceSetEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensBalanceSetEvent(ctx, item.event);
  let currencyId, who, accountId, amount;
  if (event.isV23) {
    [currencyId, who, amount] = event.asV23;
    accountId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV32) {
    [currencyId, who, amount] = event.asV32;
    accountId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV34) {
    currencyId = event.asV34.currencyId;
    accountId = ss58.codec('zeitgeist').encode(event.asV34.who);
    amount = event.asV34.free;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    accountId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.free;
  } else {
    currencyId = item.event.args.currencyId;
    accountId = encodeAddress(item.event.args.who, 73);
    amount = BigInt(item.event.args.free);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, accountId, amount };
};

export const getTokensDepositedEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensDepositedEvent(ctx, item.event);
  let currencyId, accountId, amount;
  if (event.isV36) {
    currencyId = event.asV36.currencyId;
    accountId = ss58.codec('zeitgeist').encode(event.asV36.who);
    amount = event.asV36.amount;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    accountId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.amount;
  } else {
    currencyId = item.event.args.currencyId;
    accountId = encodeAddress(item.event.args.who, 73);
    amount = BigInt(item.event.args.amount);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, accountId, amount };
};

export const getTokensReservedEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensReservedEvent(ctx, item.event);
  let eventAs, accountId;
  if (event.isV51) {
    eventAs = event.asV51;
    accountId = ss58.codec('zeitgeist').encode(eventAs.who);
  } else {
    eventAs = item.event.args;
    accountId = encodeAddress(eventAs.who, 73);
  }
  const { currencyId, amount } = eventAs;
  return { assetId: formatAssetId(currencyId), accountId, amount: BigInt(amount) };
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
    currencyId = item.event.args.currencyId;
    fromId = encodeAddress(item.event.args.from, 73);
    toId = encodeAddress(item.event.args.to, 73);
    amount = BigInt(item.event.args.amount);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, fromId, toId, amount };
};

export const getTokensWithdrawnEvent = (ctx: Ctx, item: EventItem): TokensEvent => {
  const event = new TokensWithdrawnEvent(ctx, item.event);
  let currencyId, accountId, amount;
  if (event.isV36) {
    currencyId = event.asV36.currencyId;
    accountId = ss58.codec('zeitgeist').encode(event.asV36.who);
    amount = event.asV36.amount;
  } else if (event.isV41) {
    currencyId = event.asV41.currencyId;
    accountId = ss58.codec('zeitgeist').encode(event.asV41.who);
    amount = event.asV41.amount;
  } else {
    currencyId = item.event.args.currencyId;
    accountId = encodeAddress(item.event.args.who, 73);
    amount = BigInt(item.event.args.amount);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, accountId, amount };
};

interface TokensEvent {
  assetId: string;
  accountId: string;
  amount: bigint;
}

interface TransferEvent {
  assetId: any;
  fromId: string;
  toId: string;
  amount: bigint;
}
