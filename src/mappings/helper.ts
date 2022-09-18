import { AccountInfo } from '@polkadot/types/interfaces/system';
import { SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import { util } from '@zeitgeistpm/sdk';
import { Cache, IPFS, Tools } from './util';
import { Account, AccountBalance, HistoricalAccountBalance } from '../model'


export async function createAssetsForMarket(marketId: string, marketType: any): Promise<any> {
  const sdk = await Tools.getSDK()
  return marketType.__kind == "Categorical"
    ? [...Array(marketType.value).keys()].map((catIdx) => {
        return sdk.api.createType("Asset", {
          categoricalOutcome: [marketId, catIdx],
        });
      })
    : ["Long", "Short"].map((pos) => {
        const position = sdk.api.createType("ScalarPosition", pos);
        return sdk.api.createType("Asset", {
          scalarOutcome: [marketId, position.toString()],
        });
      });
}

export async function decodeMarketMetadata(metadata: string): Promise<DecodedMarketMetadata|undefined> {
  if (metadata.startsWith('0x1530fa0bb52e67d0d9f89bf26552e1')) return undefined
  let raw = await (await Cache.init()).getMeta(metadata)
  if (raw && !(process.env.NODE_ENV == 'local')) {
    return raw !== '0' ? JSON.parse(raw) as DecodedMarketMetadata : undefined
  } else {
    try {
      const ipfs = new IPFS();
      raw = await ipfs.read(metadata);
      const rawData = JSON.parse(raw) as DecodedMarketMetadata
      await (await Cache.init()).setMeta(metadata, raw)
      return rawData
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        await (await Cache.init()).setMeta(metadata, '0')
      }
      return undefined
    }
  }
}

export function getAssetId(currencyId: any): string {
  if (currencyId.__kind == "CategoricalOutcome") {
    return JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'))
  } else if (currencyId.__kind == "ScalarOutcome") {
    const scale = new Array()
    scale.push(+currencyId.value[0].toString())
    scale.push(currencyId.value[1].__kind)
    return JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)))
  } else if (currencyId.__kind == "Ztg") {
    return "Ztg"
  } else if (currencyId.__kind == "PoolShare") {
    return JSON.stringify(util.AssetIdFromString("pool" + currencyId.value.toString()))
  } else {
    return ""
  }
}

export async function getFees(block: SubstrateBlock, extrinsic: SubstrateExtrinsic): Promise<bigint> {
  const id = extrinsic.indexInBlock
  let fees = await (await Cache.init()).getFee(block.hash+id)
  if (fees) { return BigInt(fees) }

  let totalFees = BigInt(0)
  const sdk = await Tools.getSDK()
  fees = JSON.stringify(await sdk.api.rpc.payment.queryFeeDetails(extrinsic.hash, block.hash))
  if (fees) {
    const feesFormatted = JSON.parse(fees)
    const inclusionFee = feesFormatted.inclusionFee
    const baseFee = inclusionFee.baseFee
    const lenFee = inclusionFee.lenFee
    const adjustedWeightFee = inclusionFee.adjustedWeightFee
    if (inclusionFee) {
      if (baseFee) totalFees = totalFees + BigInt(baseFee)
      if (lenFee) totalFees = totalFees + BigInt(lenFee)
      if (adjustedWeightFee) totalFees = totalFees + BigInt(adjustedWeightFee)
    }
  }
  await (await Cache.init()).setFee(block.hash+id, totalFees.toString())
  return totalFees
}

export async function initBalance(acc: Account, store: Store, block: SubstrateBlock, event: SubstrateEvent) {
  const sdk = await Tools.getSDK()
  const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(
    blockZero,
    acc.accountId
  )) as AccountInfo;

  acc.pvalue = Number(acc.pvalue) + Number(amt)
  console.log(`[${event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`)
  await store.save<Account>(acc)

  let ab = new AccountBalance()
  ab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5)
  ab.account = acc
  ab.assetId = 'Ztg'
  ab.balance = amt.toBigInt()
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`)
  await store.save<AccountBalance>(ab)

  let hab = new HistoricalAccountBalance()
  hab.id = event.id + '-000-' + acc.accountId.substring(acc.accountId.length - 5)
  hab.accountId = acc.accountId
  hab.event = 'Initialised'
  hab.assetId = ab.assetId
  hab.dBalance = amt.toBigInt()
  hab.balance = ab.balance
  hab.pvalue = acc.pvalue
  hab.blockNumber = 0
  hab.timestamp = new Date(block.timestamp)
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`)
  await store.save<HistoricalAccountBalance>(hab)
}

interface DecodedMarketMetadata {
  slug: string
  question: string
  description: string
  categories?: CategoryData[]
  tags?: string[]
  img?: string
  scalarType?: string
}

interface CategoryData {
  name: string
  ticker?: string
  img?: string
  color?: string
}