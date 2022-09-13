import { SystemExtrinsicFailedEvent, SystemExtrinsicSuccessEvent, SystemNewAccountEvent } from '../../types/events'
import * as ss58 from '@subsquid/ss58'
import { DispatchInfo } from '../../types/v23'
import { EventContext } from '../../types/support'
import { encodeAddress } from '@polkadot/keyring'

export function getExtrinsicFailedEvent(ctx: EventContext): ExtrinsicEvent {
  const extrinsicFailedEvent = new SystemExtrinsicFailedEvent(ctx)
  if (extrinsicFailedEvent.isV23) {
    const [, dispatchInfo ] = extrinsicFailedEvent.asV23
    return { dispatchInfo }
  } else if (extrinsicFailedEvent.isV32) {
    const [, dispatchInfo ] = extrinsicFailedEvent.asV32
    return { dispatchInfo }
  } else {
    const [, dispatchInfo ] = ctx.event.args
    return { dispatchInfo }
  }
}

export function getExtrinsicSuccessEvent(ctx: EventContext): ExtrinsicEvent {
  const extrinsicSuccessEvent = new SystemExtrinsicSuccessEvent(ctx)
  if (extrinsicSuccessEvent.isV23) {
    const dispatchInfo = extrinsicSuccessEvent.asV23
    return { dispatchInfo }
  } else if (extrinsicSuccessEvent.isV34) {
    const { dispatchInfo } = extrinsicSuccessEvent.asV34
    return { dispatchInfo }
  } else {
    const [dispatchInfo] = ctx.event.args
    return { dispatchInfo }
  }
}

export function getNewAccountEvent(ctx: EventContext): NewAccountEvent {
  const newAccountEvent = new SystemNewAccountEvent(ctx)
  if (newAccountEvent.isV23) {
    const accountId = newAccountEvent.asV23
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return { walletId }
  } else if (newAccountEvent.isV34) {
    const  { account } = newAccountEvent.asV34
    const walletId = ss58.codec('zeitgeist').encode(account)
    return { walletId }
  } else {
    const [accountId] = ctx.event.args
    const walletId = encodeAddress(accountId, 73)
    return { walletId }
  }
}

interface ExtrinsicEvent {
  dispatchInfo: DispatchInfo
}

interface NewAccountEvent {
  walletId: string
}