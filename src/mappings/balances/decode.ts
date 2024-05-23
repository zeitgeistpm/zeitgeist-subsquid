import * as ss58 from '@subsquid/ss58';
import { BalanceStatus } from '../../types/v34';
import { events } from '../../types';
import { Event } from '../../processor';

export const decodeBalanceSetEvent = (event: Event): BalancesEvent => {
  if (events.balances.balanceSet.v23.is(event)) {
    const [who, free] = events.balances.balanceSet.v23.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: free,
    };
  } else if (events.balances.balanceSet.v34.is(event)) {
    const { who, free } = events.balances.balanceSet.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: free,
    };
  } else {
    const [who, free] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: BigInt(free),
    };
  }
};

export const decodeDepositEvent = (event: Event): BalancesEvent => {
  if (events.balances.deposit.v23.is(event)) {
    const [who, amount] = events.balances.deposit.v23.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else if (events.balances.deposit.v34.is(event)) {
    const { who, amount } = events.balances.deposit.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else {
    const [who, amount] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: BigInt(amount),
    };
  }
};

export const decodeDustLostEvent = (event: Event): BalancesEvent => {
  if (events.balances.dustLost.v23.is(event)) {
    const [account, amount] = events.balances.dustLost.v23.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: account }),
      amount,
    };
  } else if (events.balances.dustLost.v34.is(event)) {
    const { account, amount } = events.balances.dustLost.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: account }),
      amount,
    };
  } else {
    const [account, amount] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: account }),
      amount: BigInt(amount),
    };
  }
};

export const decodeReserveRepatriatedEvent = (event: Event): ReserveRepatriatedEvent => {
  if (events.balances.reserveRepatriated.v23.is(event)) {
    const [from, to, amount, destinationStatus] = events.balances.reserveRepatriated.v23.decode(event);
    return {
      fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
      toAccountId: ss58.encode({ prefix: 73, bytes: to }),
      amount,
      destinationStatus,
    };
  } else if (events.balances.reserveRepatriated.v34.is(event)) {
    const { from, to, amount, destinationStatus } = events.balances.reserveRepatriated.v34.decode(event);
    return {
      fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
      toAccountId: ss58.encode({ prefix: 73, bytes: to }),
      amount,
      destinationStatus,
    };
  } else {
    const [from, to, amount, destinationStatus] = event.args;
    return {
      fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
      toAccountId: ss58.encode({ prefix: 73, bytes: to }),
      amount: BigInt(amount),
      destinationStatus,
    };
  }
};

export const decodeReservedEvent = (event: Event): BalancesEvent => {
  if (events.balances.reserved.v23.is(event)) {
    const [who, amount] = events.balances.reserved.v23.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else if (events.balances.reserved.v34.is(event)) {
    const { who, amount } = events.balances.reserved.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else {
    const [who, amount] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: BigInt(amount),
    };
  }
};

export const decodeSlashedEvent = (event: Event): BalancesEvent => {
  if (events.balances.slashed.v33.is(event)) {
    const [who, amount] = events.balances.slashed.v33.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else if (events.balances.slashed.v34.is(event)) {
    const { who, amount } = events.balances.slashed.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else {
    const [who, amount] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: BigInt(amount),
    };
  }
};

export const decodeTransferEvent = (event: Event): TransferEvent => {
  if (events.balances.transfer.v23.is(event)) {
    const [from, to, amount] = events.balances.transfer.v23.decode(event);
    return {
      fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
      toAccountId: ss58.encode({ prefix: 73, bytes: to }),
      amount,
    };
  } else if (events.balances.transfer.v34.is(event)) {
    const { from, to, amount } = events.balances.transfer.v34.decode(event);
    return {
      fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
      toAccountId: ss58.encode({ prefix: 73, bytes: to }),
      amount,
    };
  } else {
    const [from, to, amount] = event.args;
    return {
      fromAccountId: ss58.encode({ prefix: 73, bytes: from }),
      toAccountId: ss58.encode({ prefix: 73, bytes: to }),
      amount: BigInt(amount),
    };
  }
};

export const decodeUnreservedEvent = (event: Event): BalancesEvent => {
  if (events.balances.unreserved.v23.is(event)) {
    const [who, amount] = events.balances.unreserved.v23.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else if (events.balances.unreserved.v34.is(event)) {
    const { who, amount } = events.balances.unreserved.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else {
    const [who, amount] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: BigInt(amount),
    };
  }
};

export const decodeWithdrawEvent = (event: Event): BalancesEvent => {
  if (events.balances.withdraw.v33.is(event)) {
    const [who, amount] = events.balances.withdraw.v33.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else if (events.balances.withdraw.v34.is(event)) {
    const { who, amount } = events.balances.withdraw.v34.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount,
    };
  } else {
    const [who, amount] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: who }),
      amount: BigInt(amount),
    };
  }
};

interface BalancesEvent {
  accountId: string;
  amount: bigint;
}

interface ReserveRepatriatedEvent {
  fromAccountId: string;
  toAccountId: string;
  amount: bigint;
  destinationStatus: BalanceStatus;
}

interface TransferEvent {
  fromAccountId: string;
  toAccountId: string;
  amount: bigint;
}
