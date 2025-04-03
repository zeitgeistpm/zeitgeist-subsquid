

import { HistoricalToken, TokenEvent } from '../../model';
import { Event } from '../../processor';
import * as decode from './decode';


export const tokenMerged = async (event: Event): Promise<HistoricalToken> => {
  const { accountId, marketId, assetIn, assetOut, amount } = decode.tokenMerged(event);

  return new HistoricalToken({
    accountId,
    amount,
    assetIn,
    assetOut,
    blockNumber: event.block.height,
    event: TokenEvent.TokenMerged,
    id: event.id + '-' + accountId.slice(-5),
    marketId,
    timestamp: new Date(event.block.timestamp!),
  });
};

export const tokenRedeemed = async (event: Event): Promise<HistoricalToken> => {
  const { accountId, marketId, assetIn, assetOut, amount } = decode.tokenRedeemed(event);

  return new HistoricalToken({
    accountId,
    amount,
    assetIn,
    assetOut,
    blockNumber: event.block.height,
    event: TokenEvent.TokenRedeemed,
    id: event.id + '-' + accountId.slice(-5),
    marketId,
    timestamp: new Date(event.block.timestamp!),
  });
};

export const tokenSplit = async (event: Event): Promise<HistoricalToken> => {
  const { accountId, marketId, assetIn, assetOut, amount } = decode.tokenSplit(event);

  return new HistoricalToken({
    accountId,
    amount,
    assetIn,
    assetOut,
    blockNumber: event.block.height,
    event: TokenEvent.TokenSplit,
    id: event.id + '-' + accountId.slice(-5),
    marketId,
    timestamp: new Date(event.block.timestamp!),
  });
};