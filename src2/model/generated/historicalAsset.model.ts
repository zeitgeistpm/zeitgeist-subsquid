import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

/**
 * A type that records the price history of an outcome asset.
 */
@Entity_()
export class HistoricalAsset {
    constructor(props?: Partial<HistoricalAsset>) {
        Object.assign(this, props)
    }

    /**
     * Unique identifier of the object
     */
    @PrimaryColumn_()
    id!: string

    /**
     * Account which executed the trade
     */
    @Index_()
    @Column_("text", {nullable: true})
    accountId!: string | undefined | null

    /**
     * Amount of base asset which user spent/redeemed for swap trade
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    baseAssetTraded!: bigint | undefined | null

    /**
     * Zeitgeist's identifier for asset
     */
    @Index_()
    @Column_("text", {nullable: false})
    assetId!: string

    /**
     * Price of the asset has decreased if -ve and +ve if increased
     */
    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
    dPrice!: number | undefined | null

    /**
     * Units of asset user bought (-ve) or sold (+ve)
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    dAmountInPool!: bigint | undefined | null

    /**
     * Price of the asset after trade execution/market resolution
     */
    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
    newPrice!: number | undefined | null

    /**
     * Units of asset present in the pool account
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    newAmountInPool!: bigint | undefined | null

    /**
     * Event method which initiated this change
     */
    @Column_("text", {nullable: false})
    event!: string

    /**
     * Height of the block
     */
    @Column_("int4", {nullable: false})
    blockNumber!: number

    /**
     * Timestamp of the block
     */
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
