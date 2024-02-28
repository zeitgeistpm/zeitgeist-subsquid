import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

/**
 * A type that records the order history of a market.
 */
@Entity_()
export class HistoricalOrder {
    constructor(props?: Partial<HistoricalOrder>) {
        Object.assign(this, props)
    }

    /**
     * Height of the block
     */
    @Column_("int4", {nullable: false})
    blockNumber!: number

    /**
     * Unique identifier of the object
     */
    @PrimaryColumn_()
    id!: string

    /**
     * Maker's account address
     */
    @Column_("text", {nullable: false})
    maker!: string

    /**
     * Base asset amount
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    makerAmount!: bigint

    /**
     * Base asset
     */
    @Column_("text", {nullable: false})
    makerAsset!: string

    /**
     * Zeitgeist's identifier for market
     */
    @Index_()
    @Column_("int4", {nullable: false})
    marketId!: number

    /**
     * Outcome asset amount
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    takerAmount!: bigint

    /**
     * Outcome asset
     */
    @Column_("text", {nullable: false})
    takerAsset!: string

    /**
     * Timestamp of the block
     */
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
