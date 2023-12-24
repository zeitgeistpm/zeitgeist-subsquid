import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const decodeDepositedEvent = (event: Event): CurrencyEvent => {
  let currencyId, who, amount;
  if (events.currency.deposited.v23.is(event)) {
    [currencyId, who, amount] = events.currency.deposited.v23.decode(event);
  } else if (events.currency.deposited.v32.is(event)) {
    [currencyId, who, amount] = events.currency.deposited.v32.decode(event);
  } else if (events.currency.deposited.v34.is(event)) {
    const decoded = events.currency.deposited.v34.decode(event);
    currencyId = decoded.currencyId;
    who = decoded.who;
    amount = decoded.amount;
  } else {
    [currencyId, who, amount] = event.args;
  }
  return {
    assetId: formatAssetId(currencyId),
    accountId: ss58.encode({ prefix: 73, bytes: who }),
    amount: BigInt(amount),
  };
};

export const decodeTransferredEvent = (event: Event): TransferredEvent => {
  let currencyId, from, to, amount;
  if (events.currency.transferred.v23.is(event)) {
    [currencyId, from, to, amount] = events.currency.transferred.v23.decode(event);
  } else if (events.currency.transferred.v32.is(event)) {
    [currencyId, from, to, amount] = events.currency.transferred.v32.decode(event);
  } else if (events.currency.transferred.v34.is(event)) {
    const decoded = events.currency.transferred.v34.decode(event);
    currencyId = decoded.currencyId;
    from = decoded.from;
    to = decoded.to;
    amount = decoded.amount;
  } else {
    [currencyId, from, to, amount] = event.args;
  }
  return {
    assetId: formatAssetId(currencyId),
    fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
    toAccountId: ss58.encode({ prefix: 73, bytes: to }),
    amount: BigInt(amount),
  };
};

export const decodeWithdrawnEvent = (event: Event): CurrencyEvent => {
  let currencyId, who, amount;
  if (events.currency.withdrawn.v23.is(event)) {
    [currencyId, who, amount] = events.currency.withdrawn.v23.decode(event);
  } else if (events.currency.withdrawn.v32.is(event)) {
    [currencyId, who, amount] = events.currency.withdrawn.v32.decode(event);
  } else if (events.currency.withdrawn.v34.is(event)) {
    const decoded = events.currency.withdrawn.v34.decode(event);
    currencyId = decoded.currencyId;
    who = decoded.who;
    amount = decoded.amount;
  } else {
    [currencyId, who, amount] = event.args;
  }
  return {
    assetId: formatAssetId(currencyId),
    accountId: ss58.encode({ prefix: 73, bytes: who }),
    amount: BigInt(amount),
  };
};

interface CurrencyEvent {
  assetId: string;
  accountId: string;
  amount: bigint;
}

interface TransferredEvent {
  assetId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: bigint;
}
