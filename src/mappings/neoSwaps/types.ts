import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import { NeoSwapsPoolDeployedEvent } from '../../types/events';
import { formatAssetId } from '../helper';

export const getPoolDeployedEvent = (ctx: Ctx, item: EventItem): PoolDeployedEvent => {
  const event = new NeoSwapsPoolDeployedEvent(ctx, item.event);
  let eventAs, who, accountId;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(event.asV50.who);
  } else if (event.isV51) {
    eventAs = event.asV51;
    who = ss58.codec('zeitgeist').encode(event.asV51.who);
    accountId = ss58.codec('zeitgeist').encode(event.asV51.accountId);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(item.event.args.who, 73);
    accountId = encodeAddress(item.event.args.accountId, 73);
  }
  const { marketId, liquidityParameter, poolSharesAmount, swapFee } = eventAs;
  const collateral = eventAs.collateral ? formatAssetId(eventAs.collateral) : undefined;
  return {
    who,
    marketId,
    accountId,
    collateral,
    liquidityParameter,
    poolSharesAmount,
    swapFee,
  };
};

interface PoolDeployedEvent {
  who: string;
  marketId: bigint;
  accountId?: string;
  collateral?: string;
  liquidityParameter: bigint;
  poolSharesAmount: bigint;
  swapFee?: bigint;
}
