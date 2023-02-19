import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import { StyxAccountCrossedEvent } from '../../types/events';

export const getAccountCrossedEvent = (
  ctx: Ctx,
  item: EventItem
): AccountCrossedEvent => {
  const event = new StyxAccountCrossedEvent(ctx, item.event);
  if (event.isV39) {
    const [who, amount] = event.asV39;
    const walletId = ss58.codec('zeitgeist').encode(who);
    return { walletId, amount };
  } else {
    const [who, amount] = item.event.args;
    const walletId = encodeAddress(who, 73);
    return { walletId, amount };
  }
};

interface AccountCrossedEvent {
  walletId: string;
  amount: bigint;
}
