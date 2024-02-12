import * as ss58 from '@subsquid/ss58';
import { HistoricalAccountBalance } from '../../model';
import { Pallet, _Asset } from '../../consts';
import { extrinsicFromEvent, getFees } from '../../helper';
import { Event } from '../../processor';
import * as decode from './decode';

export const extrinsicFailed = async (event: Event): Promise<HistoricalAccountBalance | undefined> => {
  if (!event.extrinsic || !event.extrinsic.signature || !event.extrinsic.signature.address) return;
  const accountId = ss58.encode({ prefix: 73, bytes: (event.extrinsic.signature.address as any).value });

  const dispatchInfo = decode.extrinsicFailed(event);
  if (dispatchInfo.paysFee.__kind === 'No') return;

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -(await getFees(event.block, event.extrinsic)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};

export const extrinsicSuccess = async (event: Event): Promise<HistoricalAccountBalance | undefined> => {
  if (
    !event.extrinsic ||
    !event.extrinsic.signature ||
    !event.extrinsic.signature.address ||
    (event.extrinsic.call && event.extrinsic.call.name.split('.')[0] === (Pallet.Sudo || Pallet.ParachainSystem))
  )
    return;
  const accountId = ss58.encode({ prefix: 73, bytes: (event.extrinsic.signature.address as any).value });

  const dispatchInfo = decode.extrinsicSuccess(event);
  if (dispatchInfo.paysFee.__kind === 'No') return;

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: _Asset.Ztg,
    blockNumber: event.block.height,
    dBalance: -(await getFees(event.block, event.extrinsic)),
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id + '-' + accountId.slice(-5),
    timestamp: new Date(event.block.timestamp!),
  });
  return hab;
};
