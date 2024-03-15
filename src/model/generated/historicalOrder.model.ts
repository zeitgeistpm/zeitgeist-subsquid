import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {OrderEvent} from "./_orderEvent"
import {Extrinsic} from "./_extrinsic"

/**
 * A type that records the history of an order.
 */
@Entity_()
export class HistoricalOrder {
    constructor(props?: Partial<HistoricalOrder>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    accountId!: string

    @Column_("text", {nullable: false})
    assetIn!: string

    @Column_("text", {nullable: false})
    assetOut!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    assetAmountIn!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    assetAmountOut!: bigint

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("varchar", {length: 11, nullable: false})
    event!: OrderEvent

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    externalFeeAmount!: bigint | undefined | null

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Extrinsic(undefined, obj)}, nullable: true})
    extrinsic!: Extrinsic | undefined | null

    @Index_()
    @Column_("int4", {nullable: false})
    orderId!: number

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
