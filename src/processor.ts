import { SubstrateProcessor } from '@subsquid/substrate-processor'
import { TypeormDatabase } from '@subsquid/typeorm-store'
import { balancesBalanceSet, balancesDustLost, balancesEndowed, balancesReserved, balancesTransfer, balancesTransferOld, balancesUnreserved, balancesWithdraw } from './mappings/balances';
import { currencyTransferred } from './mappings/currency';
import { parachainStakingRewarded } from './mappings/parachainStaking';
import { systemExtrinsicFailed, systemExtrinsicSuccess, systemNewAccount } from './mappings/system';
import { tokensEndowed } from './mappings/tokens';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
console.log(`ENVIRONMENT: ${process.env.NODE_ENV}`)

const processor = new SubstrateProcessor(new TypeormDatabase());
processor.setTypesBundle('zeitgeist.json');
processor.setBatchSize(500);
processor.setDataSource({
  archive: process.env.INDEXER_ENDPOINT_URL ?? 'http://localhost:8888/graphql',
  chain: process.env.WS_NODE_URL ?? 'wss://bsr.zeitgeist.pm',
});
// processor.setBlockRange({from: 832, to: 832})

processor.addEventHandler('Balances.BalanceSet', ctx => balancesBalanceSet(ctx))
processor.addEventHandler('Balances.DustLost', ctx => balancesDustLost(ctx))
processor.addEventHandler('Balances.Endowed', ctx => balancesEndowed(ctx))
processor.addEventHandler('Balances.Reserved', ctx => balancesReserved(ctx))
processor.addEventHandler('Balances.Unreserved', ctx => balancesUnreserved(ctx))
processor.addEventHandler('Balances.Withdraw', ctx => balancesWithdraw(ctx))

processor.addEventHandler('Currency.Transferred', ctx => currencyTransferred(ctx))

processor.addEventHandler('ParachainStaking.Rewarded', ctx => parachainStakingRewarded(ctx))

processor.addEventHandler('System.NewAccount', ctx => systemNewAccount(ctx))

processor.addEventHandler('Tokens.Endowed', ctx => tokensEndowed(ctx))

if (!process.env.WS_NODE_URL?.includes(`bs`)) {
  processor.addEventHandler('Balances.Transfer', ctx => balancesTransfer(ctx))
} else {
  processor.addEventHandler('Balances.Transfer', {range: {from: 0, to: 588249}}, ctx => balancesTransferOld(ctx))
  processor.addEventHandler('Balances.Transfer', {range: {from: 588250}}, ctx => balancesTransfer(ctx))
  processor.addEventHandler('System.ExtrinsicFailed', {range: {from: 0, to: 588249}}, ctx => systemExtrinsicFailed(ctx))
  processor.addEventHandler('System.ExtrinsicSuccess', {range: {from: 0, to: 588249}}, ctx => systemExtrinsicSuccess(ctx))
}

processor.run()