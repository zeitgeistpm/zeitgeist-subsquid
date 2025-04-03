export const BUY_COMPLETE_SET = 'buy_complete_set';
export const EPOCH_TIME = new Date('1970-01-01T00:00:00.000Z');
export const SELL_COMPLETE_SET = 'sell_complete_set';
export const SWAP_EXACT_AMOUNT_IN = 'swap_exact_amount_in';
export const SWAP_EXACT_AMOUNT_OUT = 'swap_exact_amount_out';
export const TREASURY_ACCOUNT = 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ';

export enum _Asset {
  CampaignAsset = 'CampaignAsset',
  CategoricalOutcome = 'CategoricalOutcome',
  CombinatorialOutcomeLegacy = 'CombinatorialOutcomeLegacy',
  CombinatorialToken = 'CombinatorialToken',
  CustomAsset = 'CustomAsset',
  ForeignAsset = 'ForeignAsset',
  ParimutuelShare = 'ParimutuelShare',
  PoolShare = 'PoolShare',
  ScalarOutcome = 'ScalarOutcome',
  Ztg = 'Ztg',
}

export enum BalanceInfoEvent {
  MintedInCourt = 'MintedInCourt',
}

export enum BaseAsset {
  DOT = 'polkadot',
  USDC = 'usd-coin',
  USDT = 'tether',
  WSX = 'wsx',
  ZTG = 'zeitgeist',
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
  CampaignAssets = 'CampaignAssets',
  Court = 'Court',
  Currency = 'Currency',
  MarketAssets = 'MarketAssets',
  NeoSwaps = 'NeoSwaps',
  Orderbook = 'Orderbook',
  ParachainStaking = 'ParachainStaking',
  ParachainSystem = 'ParachainSystem',
  Parimutuel = 'Parimutuel',
  PredictionMarkets = 'PredictionMarkets',
  Styx = 'Styx',
  Sudo = 'Sudo',
  Swaps = 'Swaps',
  System = 'System',
  Tokens = 'Tokens',
}

export enum SwapEvent {
  BuyExecuted = 'BuyExecuted',
  CombinatorialPoolDeployed = 'CombinatorialPoolDeployed',
  ComboBuyExecuted = 'ComboBuyExecuted',
  ComboSellExecuted = 'ComboSellExecuted',
  OrderFilled = 'OrderFilled',
  OutcomeBought = 'OutcomeBought',
  SellExecuted = 'SellExecuted',
  SwapExactAmountIn = 'SwapExactAmountIn',
  SwapExactAmountOut = 'SwapExactAmountOut',
}

export enum TargetAsset {
  USD = 'usd',
}

export enum Unit {
  Day = 'DAYS',
  Hour = 'HOURS',
  Minute = 'MINUTES',
  Second = 'SECONDS',
}

export enum OrderBy {
  liquidity_ASC = 'liquidity ASC',
  liquidity_DESC = 'liquidity DESC',
  participants_ASC = 'participants ASC',
  participants_DESC = 'participants DESC',
  volume_ASC = 'volume ASC',
  volume_DESC = 'volume DESC',
}
