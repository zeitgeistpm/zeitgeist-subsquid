import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { DispatchInfo } from '../../types/v23';
import { SystemExtrinsicFailedEvent, SystemExtrinsicSuccessEvent, SystemNewAccountEvent } from '../../types/events';
import { Ctx, EventItem } from '../../processor';

export const getExtrinsicFailedEvent = (ctx: Ctx, item: EventItem): ExtrinsicEvent => {
  const event = new SystemExtrinsicFailedEvent(ctx, item.event);
  if (event.isV23) {
    const [, dispatchInfo] = event.asV23;
    return { dispatchInfo };
  } else if (event.isV32) {
    const [, dispatchInfo] = event.asV32;
    return { dispatchInfo };
  } else {
    const [, dispatchInfo] = item.event.args;
    return { dispatchInfo };
  }
};

export const getExtrinsicSuccessEvent = (ctx: Ctx, item: EventItem): ExtrinsicEvent => {
  const event = new SystemExtrinsicSuccessEvent(ctx, item.event);
  if (event.isV23) {
    const dispatchInfo = event.asV23;
    return { dispatchInfo };
  } else if (event.isV34) {
    const { dispatchInfo } = event.asV34;
    return { dispatchInfo };
  } else {
    const [dispatchInfo] = item.event.args;
    return { dispatchInfo };
  }
};

export const getNewAccountEvent = (ctx: Ctx, item: EventItem): AccountEvent => {
  const event = new SystemNewAccountEvent(ctx, item.event);
  if (event.isV23) {
    const accountId = event.asV23;
    const walletId = ss58.codec('zeitgeist').encode(accountId);
    return { walletId };
  } else if (event.isV34) {
    const { account } = event.asV34;
    const walletId = ss58.codec('zeitgeist').encode(account);
    return { walletId };
  } else {
    const [accountId] = item.event.args;
    const walletId = encodeAddress(accountId, 73);
    return { walletId };
  }
};

interface AccountEvent {
  walletId: string;
}

interface ExtrinsicEvent {
  dispatchInfo: DispatchInfo;
}
