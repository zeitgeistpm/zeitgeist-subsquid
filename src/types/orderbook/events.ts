import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v50 from '../v50'
import * as v51 from '../v51'
import * as v53 from '../v53'

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
}
