import { events } from '../../types';
import { DispatchInfo } from '../../types/v32';
import { Event } from '../../processor';

export const extrinsicFailed = (event: Event): DispatchInfo => {
  // if (events.system.extrinsicFailed.v23.is(event)) {
  //   const [, dispatchInfo] = events.system.extrinsicFailed.v23.decode(event);
  //   return dispatchInfo;
  // } 
  if (events.system.extrinsicFailed.v32.is(event)) {
    const [, dispatchInfo] = events.system.extrinsicFailed.v32.decode(event);
    return dispatchInfo;
  } else {
    const [, dispatchInfo] = event.args;
    return dispatchInfo;
  }
};

export const extrinsicSuccess = (event: Event): DispatchInfo => {
  // if (events.system.extrinsicSuccess.v23.is(event)) {
  //   const dispatchInfo = events.system.extrinsicSuccess.v23.decode(event);
  //   return dispatchInfo;
  // } 
  if (events.system.extrinsicSuccess.v34.is(event)) {
    const { dispatchInfo } = events.system.extrinsicSuccess.v34.decode(event);
    return dispatchInfo;
  } else {
    const [dispatchInfo] = event.args;
    return dispatchInfo;
  }
};
