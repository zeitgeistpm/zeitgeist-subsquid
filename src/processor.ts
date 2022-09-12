import { SubstrateProcessor } from '@subsquid/substrate-processor'
import { TypeormDatabase } from '@subsquid/typeorm-store'
import { parachainStakingRewarded } from './mappings/parachainStaking';

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
  chain: process.env.WS_NODE_URL ?? 'ws://localhost:9944',
});
//processor.setBlockRange({from: 381584, to: 381588})

processor.addEventHandler('ParachainStaking.Rewarded', ctx => parachainStakingRewarded(ctx))

processor.run()