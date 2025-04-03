import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { Event } from '../../processor';

export const decodeRewardedEvent = (event: Event): RewardedEvent => {
  // if (events.parachainStaking.rewarded.v23.is(event)) {
  //   const [account, rewards] = events.parachainStaking.rewarded.v23.decode(event);
  //   return {
  //     accountId: ss58.encode({ prefix: 73, bytes: account }),
  //     amount: rewards,
  //   };
  // } 
  if (events.parachainStaking.rewarded.v35.is(event)) {
    const { account, rewards } = events.parachainStaking.rewarded.v35.decode(event);
    return {
      accountId: ss58.encode({ prefix: 73, bytes: account }),
      amount: rewards,
    };
  } else {
    const [account, rewards] = event.args;
    return {
      accountId: ss58.encode({ prefix: 73, bytes: account }),
      amount: BigInt(rewards),
    };
  }
};

interface RewardedEvent {
  accountId: string;
  amount: bigint;
}
