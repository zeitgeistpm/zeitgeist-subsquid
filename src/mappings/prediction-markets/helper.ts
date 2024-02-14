import { MarketPeriod } from '../../model';
import { MarketPeriod as _MarketPeriod } from '../../types/v51';
import { Tools } from '../../util';

export const mapMarketPeriod = async (p: _MarketPeriod): Promise<MarketPeriod> => {
  const period = new MarketPeriod();
  if (p.__kind === 'Block') {
    const sdk = await Tools.getSDK();
    const now = BigInt((await sdk.api.query.timestamp.now()).toString());
    const headBlock = (await sdk.api.rpc.chain.getHeader()).number.toBigInt();
    const blockCreationPeriod = BigInt(2 * Number(sdk.api.consts.timestamp.minimumPeriod));
    const startDiffInMs = blockCreationPeriod * (BigInt(p.value.start) - headBlock);
    const endDiffInMs = blockCreationPeriod * (BigInt(p.value.end) - headBlock);

    period.block = [];
    period.block.push(BigInt(p.value.start));
    period.block.push(BigInt(p.value.end));
    period.start = now + startDiffInMs;
    period.end = now + endDiffInMs;
  } else if (p.__kind === 'Timestamp') {
    period.timestamp = [];
    period.timestamp.push(BigInt(p.value.start));
    period.timestamp.push(BigInt(p.value.end));
    period.start = BigInt(p.value.start);
    period.end = BigInt(p.value.end);
  }
  return period;
};

export const scaleUp = (value: string): string => {
  return (BigInt(value) * BigInt(10 ** 10)).toString();
};
