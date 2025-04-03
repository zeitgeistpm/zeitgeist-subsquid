import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {OrderRecord} from "./_orderRecord"
import {OrderStatus} from "./_orderStatus"

/**
 * A type that records the order history of a market.
 */
@Entity_()
export class Order {
    constructor(props?: Partial<Order>) {
        Object.assign(this, props)
    }

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    makerAccountId!: string

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new OrderRecord(undefined, obj)}, nullable: false})
    maker!: OrderRecord

    @Index_()
    @IntColumn_({nullable: false})
    marketId!: number

    @Column_("varchar", {length: 7, nullable: false})
    status!: OrderStatus

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new OrderRecord(undefined, obj)}, nullable: false})
    taker!: OrderRecord

    @DateTimeColumn_({nullable: false})
    updatedAt!: Date
}
