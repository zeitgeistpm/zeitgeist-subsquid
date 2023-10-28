import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import { CurrencyDepositedEvent, CurrencyTransferredEvent, CurrencyWithdrawnEvent } from '../../types/events';
import { formatAssetId } from '../helper';

export const getDepositedEvent = (ctx: Ctx, item: EventItem): DepositedEvent => {
  const event = new CurrencyDepositedEvent(ctx, item.event);
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
    amount = event.asV34.amount;
  } else {
    [currencyId, who, amount] = item.event.args;
    walletId = encodeAddress(who, 73);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, walletId, amount };
};

export const getTransferredEvent = (ctx: Ctx, item: EventItem): TransferredEvent => {
  const event = new CurrencyTransferredEvent(ctx, item.event);
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
  } else {
    [currencyId, from, to, amount] = item.event.args;
    fromId = encodeAddress(from, 73);
    toId = encodeAddress(to, 73);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, fromId, toId, amount };
};

export const getWithdrawnEvent = (ctx: Ctx, item: EventItem): WithdrawnEvent => {
  const event = new CurrencyWithdrawnEvent(ctx, item.event);
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
    amount = event.asV34.amount;
  } else {
    [currencyId, who, amount] = item.event.args;
    walletId = encodeAddress(who, 73);
  }
  const assetId = formatAssetId(currencyId);
  return { assetId, walletId, amount };
};

interface DepositedEvent {
  assetId: string;
  walletId: string;
  amount: bigint;
}

interface TransferredEvent {
  assetId: string;
  fromId: string;
  toId: string;
  amount: bigint;
}

interface WithdrawnEvent {
  assetId: string;
  walletId: string;
  amount: bigint;
}
