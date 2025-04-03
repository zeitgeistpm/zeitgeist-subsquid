import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
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
    @StringColumn_({nullable: false})
    accountId!: string

    @StringColumn_({nullable: false})
    assetIn!: string

    @StringColumn_({nullable: false})
    assetOut!: string

    @BigIntColumn_({nullable: false})
    assetAmountIn!: bigint

    @BigIntColumn_({nullable: false})
    assetAmountOut!: bigint

    @IntColumn_({nullable: false})
    blockNumber!: number

    @Column_("varchar", {length: 11, nullable: false})
    event!: OrderEvent

    @BigIntColumn_({nullable: true})
    externalFeeAmount!: bigint | undefined | null

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Extrinsic(undefined, obj)}, nullable: true})
    extrinsic!: Extrinsic | undefined | null

    @Index_()
    @IntColumn_({nullable: false})
    orderId!: number

    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
