import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const decodeTokensBalanceSetEvent = (event: Event): TokensEvent => {
  let decoded;
  if (events.tokens.balanceSet.v23.is(event)) {
    decoded = events.tokens.balanceSet.v23.decode(event);
  } else if (events.tokens.balanceSet.v32.is(event)) {
    decoded = events.tokens.balanceSet.v32.decode(event);
  } else if (events.tokens.balanceSet.v34.is(event)) {
    decoded = events.tokens.balanceSet.v34.decode(event);
  } else if (events.tokens.balanceSet.v41.is(event)) {
    decoded = events.tokens.balanceSet.v41.decode(event);
  } else if (events.tokens.balanceSet.v54.is(event)) {
    decoded = events.tokens.balanceSet.v54.decode(event);
  } else {
    decoded = event.args;
  }
  const currencyId = decoded[0] ?? decoded.currencyId;
  const who = decoded[1] ?? decoded.who;
  const free = decoded[2] ?? decoded.free;
  return {
    assetId: formatAssetId(currencyId),
    accountId: ss58.encode({ prefix: 73, bytes: who }),
    amount: BigInt(free),
  };
};

export const decodeTokensDepositedEvent = (event: Event): TokensEvent => {
  let decoded;
  if (events.tokens.deposited.v36.is(event)) {
    decoded = events.tokens.deposited.v36.decode(event);
  } else if (events.tokens.deposited.v41.is(event)) {
    decoded = events.tokens.deposited.v41.decode(event);
  } else if (events.tokens.deposited.v54.is(event)) {
    decoded = events.tokens.deposited.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId(decoded.currencyId),
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    amount: BigInt(decoded.amount),
  };
};

export const decodeTokensReservedEvent = (event: Event): TokensEvent => {
  let decoded;
  if (events.tokens.reserved.v51.is(event)) {
    decoded = events.tokens.reserved.v51.decode(event);
  } else if (events.tokens.reserved.v54.is(event)) {
    decoded = events.tokens.reserved.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId(decoded.currencyId),
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    amount: BigInt(decoded.amount),
  };
};

export const decodeTokensTransferEvent = (event: Event): TransferEvent => {
  let decoded;
  if (events.tokens.transfer.v23.is(event)) {
    decoded = events.tokens.transfer.v23.decode(event);
  } else if (events.tokens.transfer.v32.is(event)) {
    decoded = events.tokens.transfer.v32.decode(event);
  } else if (events.tokens.transfer.v34.is(event)) {
    decoded = events.tokens.transfer.v34.decode(event);
  } else if (events.tokens.transfer.v41.is(event)) {
    decoded = events.tokens.transfer.v41.decode(event);
  } else if (events.tokens.transfer.v54.is(event)) {
    decoded = events.tokens.transfer.v54.decode(event);
  } else {
    decoded = event.args;
  }
  const currencyId = decoded[0] ?? decoded.currencyId;
  const from = decoded[1] ?? decoded.from;
  const to = decoded[2] ?? decoded.to;
  const amount = decoded[3] ?? decoded.amount;
  return {
    assetId: formatAssetId(currencyId),
    fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
    toAccountId: ss58.encode({ prefix: 73, bytes: to }),
    amount: BigInt(amount),
  };
};

export const decodeTokensWithdrawnEvent = (event: Event): TokensEvent => {
  let decoded;
  if (events.tokens.withdrawn.v36.is(event)) {
    decoded = events.tokens.withdrawn.v36.decode(event);
  } else if (events.tokens.withdrawn.v41.is(event)) {
    decoded = events.tokens.withdrawn.v41.decode(event);
  } else if (events.tokens.withdrawn.v54.is(event)) {
    decoded = events.tokens.withdrawn.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId(decoded.currencyId),
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    amount: BigInt(decoded.amount),
  };
};

interface TokensEvent {
  assetId: string;
  accountId: string;
  amount: bigint;
}

interface TransferEvent {
  assetId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: bigint;
}
