import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
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

    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    makerAccountId!: string

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new OrderRecord(undefined, obj)}, nullable: false})
    maker!: OrderRecord

    @Index_()
    @Column_("int4", {nullable: false})
    marketId!: number

    @Column_("varchar", {length: 7, nullable: false})
    status!: OrderStatus

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new OrderRecord(undefined, obj)}, nullable: false})
    taker!: OrderRecord

    @Column_("timestamp with time zone", {nullable: false})
    updatedAt!: Date
}
