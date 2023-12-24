import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { DispatchInfo } from '../../types/v23';
import { Event } from '../../processor';

export const decodeExtrinsicFailedEvent = (event: Event): ExtrinsicEvent => {
  if (events.system.extrinsicFailed.v23.is(event)) {
    const [, dispatchInfo] = events.system.extrinsicFailed.v23.decode(event);
    return { dispatchInfo };
  } else if (events.system.extrinsicFailed.v32.is(event)) {
    const [, dispatchInfo] = events.system.extrinsicFailed.v32.decode(event);
    return { dispatchInfo };
  } else {
    const [, dispatchInfo] = event.args;
    return { dispatchInfo };
  }
};

export const decodeExtrinsicSuccessEvent = (event: Event): ExtrinsicEvent => {
  if (events.system.extrinsicSuccess.v23.is(event)) {
    const dispatchInfo = events.system.extrinsicSuccess.v23.decode(event);
    return { dispatchInfo };
  } else if (events.system.extrinsicSuccess.v34.is(event)) {
    const { dispatchInfo } = events.system.extrinsicSuccess.v34.decode(event);
    return { dispatchInfo };
  } else {
    const [dispatchInfo] = event.args;
    return { dispatchInfo };
  }
};

export const decodeNewAccountEvent = (event: Event): AccountEvent => {
  let decoded: string;
  if (events.system.newAccount.v23.is(event)) {
    decoded = events.system.newAccount.v23.decode(event);
  } else if (events.system.newAccount.v34.is(event)) {
    decoded = events.system.newAccount.v34.decode(event).account;
  } else {
    decoded = event.args.account;
  }
  return { accountId: ss58.encode({ prefix: 73, bytes: decoded }) };
};

interface AccountEvent {
  accountId: string;
}

interface ExtrinsicEvent {
  dispatchInfo: DispatchInfo;
}
