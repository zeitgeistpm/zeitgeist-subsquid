import { SubstrateExtrinsic, SubstrateBlock } from '@subsquid/hydra-common'
import SDK from '@zeitgeistpm/sdk'

export async function getFees(block: SubstrateBlock, extrinsic: SubstrateExtrinsic): Promise<number> {
    const id = +extrinsic.id.substring(extrinsic.id.indexOf("-")+1, extrinsic.id.lastIndexOf("-"))!
    const sdk = await SDK.initialize(process.env['WS_NODE_URL'] ?? 'wss://bsr.zeitgeist.pm')
    const { block: blk } = await sdk.api.rpc.chain.getBlock(block.hash)
    const fees = await sdk.api.rpc.payment.queryFeeDetails(blk.extrinsics[id].toHex(), block.hash)
    sdk.api.disconnect()

    var totalFees = BigInt(0)
    if (fees) {
        const feesFormatted = JSON.parse(JSON.stringify(fees))
        const inclusionFee = feesFormatted.inclusionFee
        const baseFee = inclusionFee.baseFee
        const lenFee = inclusionFee.lenFee
        const adjustedWeightFee = inclusionFee.adjustedWeightFee
        const tip = extrinsic.tip.valueOf()
        if (inclusionFee){
            if(baseFee) totalFees = totalFees + BigInt(baseFee)
            if(lenFee) totalFees = totalFees + BigInt(lenFee)
            if(adjustedWeightFee) totalFees = totalFees + BigInt(adjustedWeightFee)
            if(tip) totalFees = totalFees + BigInt(tip)
        }
    }
    return +totalFees.toString()
}

export * from './balances'
export * from './markets'
export * from './swaps'