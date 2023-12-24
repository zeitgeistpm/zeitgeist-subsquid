import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { Event } from '../../processor';

export const decodeAccountCrossedEvent = (event: Event): AccountCrossedEvent => {
  let accountId: string, amount: bigint;
  if (events.styx.accountCrossed.v39.is(event)) {
    [accountId, amount] = events.styx.accountCrossed.v39.decode(event);
  } else {
    [accountId, amount] = event.args;
  }
  return {
    accountId: ss58.encode({ prefix: 73, bytes: accountId }),
    amount: BigInt(amount),
  };
};

interface AccountCrossedEvent {
  accountId: string;
  amount: bigint;
}
