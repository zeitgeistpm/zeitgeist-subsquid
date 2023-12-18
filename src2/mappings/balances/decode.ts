import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';

export const decodeTransferEvent = (event: any): TransferEvent => {
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

interface TransferEvent {
  fromAccountId: string;
  toAccountId: string;
  amount: bigint;
}
