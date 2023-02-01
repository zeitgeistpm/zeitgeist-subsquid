import { SubstrateProcessor } from '@subsquid/substrate-processor'
import { TypeormDatabase } from '@subsquid/typeorm-store'
import { balancesBalanceSet, balancesDeposit, balancesDustLost, balancesEndowed, balancesReserved, 
  balancesTransfer, balancesTransferOld, balancesUnreserved, balancesWithdraw } from './mappings/balances';
import { currencyDeposited, currencyTransferred, currencyWithdrawn } from './mappings/currency';
import { parachainStakingRewarded } from './mappings/parachainStaking';
import { 
  unreserveBalances_108949, unreserveBalances_155917, unreserveBalances_168378, unreserveBalances_175178, 
  unreserveBalances_176408, unreserveBalances_178290, unreserveBalances_179524, unreserveBalances_184820, 
  unreserveBalances_204361, unreserveBalances_211391, unreserveBalances_92128
} from './mappings/postHooks/balancesUnreserved';
import { destroyMarkets } from './mappings/postHooks/marketDestroyed';
import { boughtCompleteSet, marketApproved, marketClosed, marketCreated, marketDestroyed, marketDisputed, 
  marketExpired, marketInsufficientSubsidy, marketRejected, marketReported, marketResolved, 
  marketStartedWithSubsidy, soldCompleteSet, tokensRedeemed } from './mappings/predictionMarkets';
import { accountCrossed } from './mappings/styx';
import { 
  arbitrageBuyBurn, arbitrageMintSell, poolActive, poolClosed, poolCreate, poolDestroyed, poolExit, 
  poolExitWithExactAssetAmount, poolJoin, poolJoinWithExactAssetAmount, swapExactAmountIn, swapExactAmountOut 
} from './mappings/swaps';
import { systemExtrinsicFailed, systemExtrinsicSuccess, systemNewAccount } from './mappings/system';
import { tokensBalanceSet, tokensDeposited, tokensEndowed, tokensTransfer, tokensWithdrawn } from './mappings/tokens';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`)

const processor = new SubstrateProcessor(new TypeormDatabase());
processor.setTypesBundle('typesBundle.json');
processor.setBatchSize(+(process.env.BATCH_SIZE ?? 500));
processor.setDataSource({
  archive: process.env.INDEXER_ENDPOINT_URL ?? 'https://indexer.zeitgeist.pm/graphql',
  chain: process.env.WS_NODE_URL ?? 'wss://bsr.zeitgeist.pm',
});
//processor.setBlockRange({from: 579140, to: 579140})

processor.addEventHandler('Balances.BalanceSet', ctx => balancesBalanceSet(ctx))
processor.addEventHandler('Balances.DustLost', ctx => balancesDustLost(ctx))
processor.addEventHandler('Balances.Endowed', ctx => balancesEndowed(ctx))
processor.addEventHandler('Balances.Reserved', ctx => balancesReserved(ctx))
processor.addEventHandler('Balances.Unreserved', ctx => balancesUnreserved(ctx))
processor.addEventHandler('Balances.Withdraw', ctx => balancesWithdraw(ctx))

processor.addEventHandler('Currency.Transferred', ctx => currencyTransferred(ctx))
processor.addEventHandler('Currency.Deposited', ctx => currencyDeposited(ctx))
processor.addEventHandler('Currency.Withdrawn', ctx => currencyWithdrawn(ctx))

processor.addEventHandler('PredictionMarkets.BoughtCompleteSet', ctx => boughtCompleteSet(ctx))
processor.addEventHandler('PredictionMarkets.MarketApproved', ctx => marketApproved(ctx))
processor.addEventHandler('PredictionMarkets.MarketClosed', ctx => marketClosed(ctx))
processor.addEventHandler('PredictionMarkets.MarketCreated', ctx => marketCreated(ctx))
processor.addEventHandler('PredictionMarkets.MarketDestroyed', ctx => marketDestroyed(ctx))
processor.addEventHandler('PredictionMarkets.MarketDisputed', ctx => marketDisputed(ctx))
processor.addEventHandler('PredictionMarkets.MarketExpired', ctx => marketExpired(ctx))
processor.addEventHandler('PredictionMarkets.MarketInsufficientSubsidy', ctx => marketInsufficientSubsidy(ctx))
processor.addEventHandler('PredictionMarkets.MarketRejected', ctx => marketRejected(ctx))
processor.addEventHandler('PredictionMarkets.MarketReported', ctx => marketReported(ctx))
processor.addEventHandler('PredictionMarkets.MarketResolved', ctx => marketResolved(ctx))
processor.addEventHandler('PredictionMarkets.MarketStartedWithSubsidy', ctx => marketStartedWithSubsidy(ctx))
processor.addEventHandler('PredictionMarkets.SoldCompleteSet', ctx => soldCompleteSet(ctx))
processor.addEventHandler('PredictionMarkets.TokensRedeemed', ctx => tokensRedeemed(ctx))

processor.addEventHandler('Styx.AccountCrossed', ctx => accountCrossed(ctx))

processor.addEventHandler('Swaps.ArbitrageBuyBurn', ctx => arbitrageBuyBurn(ctx))
processor.addEventHandler('Swaps.ArbitrageMintSell', ctx => arbitrageMintSell(ctx))
processor.addEventHandler('Swaps.PoolActive', ctx => poolActive(ctx))
processor.addEventHandler('Swaps.PoolClosed', ctx => poolClosed(ctx))
processor.addEventHandler('Swaps.PoolCreate', ctx => poolCreate(ctx))
processor.addEventHandler('Swaps.PoolDestroyed', ctx => poolDestroyed(ctx))
processor.addEventHandler('Swaps.PoolExit', ctx => poolExit(ctx))
processor.addEventHandler('Swaps.PoolExitWithExactAssetAmount', ctx => poolExitWithExactAssetAmount(ctx))
processor.addEventHandler('Swaps.PoolJoin', ctx => poolJoin(ctx))
processor.addEventHandler('Swaps.PoolJoinWithExactAssetAmount', ctx => poolJoinWithExactAssetAmount(ctx))
processor.addEventHandler('Swaps.SwapExactAmountIn', ctx => swapExactAmountIn(ctx))
processor.addEventHandler('Swaps.SwapExactAmountOut', ctx => swapExactAmountOut(ctx))

processor.addEventHandler('System.NewAccount', ctx => systemNewAccount(ctx))

processor.addEventHandler('Tokens.BalanceSet', ctx => tokensBalanceSet(ctx))
processor.addEventHandler('Tokens.Deposited', ctx => tokensDeposited(ctx))
processor.addEventHandler('Tokens.Endowed', ctx => tokensEndowed(ctx))
processor.addEventHandler('Tokens.Transfer', ctx => tokensTransfer(ctx))
processor.addEventHandler('Tokens.Withdrawn', ctx => tokensWithdrawn(ctx))

if (!process.env.WS_NODE_URL?.includes(`bs`)) {
  processor.addEventHandler('Balances.Transfer', ctx => balancesTransfer(ctx))
} else {
  processor.addEventHandler('Balances.Deposit', ctx => balancesDeposit(ctx))
  processor.addEventHandler('Balances.Transfer', {range: {from: 0, to: 588249}}, ctx => balancesTransferOld(ctx))
  processor.addEventHandler('Balances.Transfer', {range: {from: 588250}}, ctx => balancesTransfer(ctx))
  processor.addEventHandler('ParachainStaking.Rewarded', {range: {from: 0, to: 588249}}, ctx => parachainStakingRewarded(ctx))
  processor.addEventHandler('System.ExtrinsicFailed', {range: {from: 0, to: 588249}}, ctx => systemExtrinsicFailed(ctx))
  processor.addEventHandler('System.ExtrinsicSuccess', {range: {from: 0, to: 588249}}, ctx => systemExtrinsicSuccess(ctx))

  processor.addPostHook({range: {from: 92128, to: 92128}}, ctx => unreserveBalances_92128(ctx))
  processor.addPostHook({range: {from: 108949, to: 108949}}, ctx => unreserveBalances_108949(ctx))
  processor.addPostHook({range: {from: 155917, to: 155917}}, ctx => unreserveBalances_155917(ctx))
  processor.addPostHook({range: {from: 168378, to: 168378}}, ctx => unreserveBalances_168378(ctx))
  processor.addPostHook({range: {from: 175178, to: 175178}}, ctx => unreserveBalances_175178(ctx))
  processor.addPostHook({range: {from: 176408, to: 176408}}, ctx => unreserveBalances_176408(ctx))
  processor.addPostHook({range: {from: 178290, to: 178290}}, ctx => unreserveBalances_178290(ctx))
  processor.addPostHook({range: {from: 179524, to: 179524}}, ctx => unreserveBalances_179524(ctx))
  processor.addPostHook({range: {from: 184820, to: 184820}}, ctx => unreserveBalances_184820(ctx))
  processor.addPostHook({range: {from: 204361, to: 204361}}, ctx => unreserveBalances_204361(ctx))
  processor.addPostHook({range: {from: 211391, to: 211391}}, ctx => unreserveBalances_211391(ctx))
  processor.addPostHook({range: {from: 579140, to: 579140}}, ctx => destroyMarkets(ctx))
}

processor.run()