import * as ss58 from '@subsquid/ss58';
import { Asset as Asset_v51 } from '../../types/v51';
import { Asset as Asset_v54 } from '../../types/v54';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const outcomeBought = (event: Event): BuySellExecutedEvent => {
  let decoded: {
    marketId: bigint;
    buyer: string;
    asset: Asset_v51 | Asset_v54;
    amountMinusFees: bigint;
    fees: bigint;
  };
  if (events.parimutuel.outcomeBought.v51.is(event)) {
    decoded = events.parimutuel.outcomeBought.v51.decode(event);
  } else if (events.parimutuel.outcomeBought.v54.is(event)) {
    decoded = events.parimutuel.outcomeBought.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    buyer: ss58.encode({ prefix: 73, bytes: decoded.buyer }),
    marketId: Number(decoded.marketId),
    asset: formatAssetId(decoded.asset),
    amountMinusFees: BigInt(decoded.amountMinusFees),
    fees: BigInt(decoded.fees),
  };
};

interface BuySellExecutedEvent {
  marketId: number;
  buyer: string;
  asset: string;
  amountMinusFees: bigint;
  fees: bigint;
}
