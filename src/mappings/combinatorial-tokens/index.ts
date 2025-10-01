

import { HistoricalAccountBalance, HistoricalToken, TokenEvent } from '../../model';
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

export const tokenRedeemed = async (event: Event): Promise<{
  historicalToken: HistoricalToken;
  historicalAccountBalances: HistoricalAccountBalance[];
}> => {
  const { accountId, marketId, assetIn, assetOut, amountIn, amountOut } = decode.tokenRedeemed(event);

  const historicalToken = new HistoricalToken({
    accountId,
    amount: amountIn,
    assetIn,
    assetOut,
    blockNumber: event.block.height,
    event: TokenEvent.TokenRedeemed,
    id: event.id + '-' + accountId.slice(-5),
    marketId,
    timestamp: new Date(event.block.timestamp!),
  });

  // Create balance changes for both assetIn and assetOut
  const historicalAccountBalances: HistoricalAccountBalance[] = [
    // assetIn: combinatorial tokens being redeemed/burned (negative balance)
    new HistoricalAccountBalance({
      accountId,
      assetId: assetIn[0], // assetIn is an array with one element
      blockNumber: event.block.height,
      dBalance: -amountIn, // Negative to decrease balance
      event: event.name.split('.')[1],
      id: event.id + '-in-' + accountId.slice(-5),
      timestamp: new Date(event.block.timestamp!),
    }),
    // assetOut: collateral received (positive balance)
    new HistoricalAccountBalance({
      accountId,
      assetId: assetOut[0], // assetOut is an array with one element
      blockNumber: event.block.height,
      dBalance: amountOut, // Positive to increase balance
      event: event.name.split('.')[1],
      id: event.id + '-out-' + accountId.slice(-5),
      timestamp: new Date(event.block.timestamp!),
    }),
  ];

  return { historicalToken, historicalAccountBalances };
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