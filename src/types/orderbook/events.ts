import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v50 from '../v50'
import * as v51 from '../v51'
import * as v53 from '../v53'
import * as v54 from '../v54'
import * as v55 from '../v55'

export const orderFilled =  {
    name: 'Orderbook.OrderFilled',
    v50: new EventType(
        'Orderbook.OrderFilled',
        sts.struct({
            orderId: sts.bigint(),
            maker: v50.AccountId32,
            taker: v50.AccountId32,
            filled: sts.bigint(),
            unfilledOutcomeAssetAmount: sts.bigint(),
            unfilledBaseAssetAmount: sts.bigint(),
        })
    ),
    v53: new EventType(
        'Orderbook.OrderFilled',
        sts.struct({
            orderId: sts.bigint(),
            maker: v53.AccountId32,
            taker: v53.AccountId32,
            filledMakerAmount: sts.bigint(),
            filledTakerAmount: sts.bigint(),
            unfilledMakerAmount: sts.bigint(),
            unfilledTakerAmount: sts.bigint(),
        })
    ),
    v55: new EventType(
        'Orderbook.OrderFilled',
        sts.struct({
            orderId: sts.bigint(),
            maker: v55.AccountId32,
            taker: v55.AccountId32,
            filledMakerAmount: sts.bigint(),
            filledTakerAmount: sts.bigint(),
            unfilledMakerAmount: sts.bigint(),
            unfilledTakerAmount: sts.bigint(),
            externalFee: v55.ExternalFee,
        })
    ),
}

export const orderPlaced =  {
    name: 'Orderbook.OrderPlaced',
    v50: new EventType(
        'Orderbook.OrderPlaced',
        sts.struct({
            orderId: sts.bigint(),
            order: v50.Order,
        })
    ),
    v51: new EventType(
        'Orderbook.OrderPlaced',
        sts.struct({
            orderId: sts.bigint(),
            order: v51.Order,
        })
    ),
    v53: new EventType(
        'Orderbook.OrderPlaced',
        sts.struct({
            orderId: sts.bigint(),
            order: v53.Order,
        })
    ),
    v54: new EventType(
        'Orderbook.OrderPlaced',
        sts.struct({
            orderId: sts.bigint(),
            order: v54.Order,
        })
    ),
}

export const orderRemoved =  {
    name: 'Orderbook.OrderRemoved',
    v50: new EventType(
        'Orderbook.OrderRemoved',
        sts.struct({
            orderId: sts.bigint(),
            maker: v50.AccountId32,
        })
    ),
}
