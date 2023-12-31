export const BUY_COMPLETE_SET = 'buy_complete_set';
export const EPOCH_TIME = new Date('1970-01-01T00:00:00.000Z');
export const SELL_COMPLETE_SET = 'sell_complete_set';
export const SWAP_EXACT_AMOUNT_IN = 'swap_exact_amount_in';
export const SWAP_EXACT_AMOUNT_OUT = 'swap_exact_amount_out';
export const TREASURY_ACCOUNT = 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ';

export enum _Asset {
  CategoricalOutcome = 'CategoricalOutcome',
  ForeignAsset = 'ForeignAsset',
  PoolShare = 'PoolShare',
  ScalarOutcome = 'ScalarOutcome',
  Ztg = 'Ztg',
}

export enum CacheHint {
  Fee = 'fee',
  Meta = 'meta',
  Price = 'price',
}

export enum Pallet {
  AssetTxPayment = 'AssetTxPayment',
  Authorized = 'Authorized',
  Balances = 'Balances',
  Court = 'Court',
  Currency = 'Currency',
  NeoSwaps = 'NeoSwaps',
  ParachainStaking = 'ParachainStaking',
  ParachainSystem = 'ParachainSystem',
  PredictionMarkets = 'PredictionMarkets',
  Styx = 'Styx',
  Sudo = 'Sudo',
  Swaps = 'Swaps',
  System = 'System',
  Tokens = 'Tokens',
}
