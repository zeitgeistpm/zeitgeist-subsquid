import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, FloatColumn as FloatColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

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
    @StringColumn_({nullable: true})
    accountId!: string | undefined | null

    /**
     * Zeitgeist's identifier for asset
     */
    @Index_()
    @StringColumn_({nullable: false})
    assetId!: string

    /**
     * Price of the asset has decreased if -ve and +ve if increased
     */
    @FloatColumn_({nullable: true})
    dPrice!: number | undefined | null

    /**
     * Units of asset user bought (-ve) or sold (+ve)
     */
    @BigIntColumn_({nullable: true})
    dAmountInPool!: bigint | undefined | null

    /**
     * Price of the asset after trade execution/market resolution
     */
    @FloatColumn_({nullable: true})
    newPrice!: number | undefined | null

    /**
     * Units of asset present in the pool account
     */
    @BigIntColumn_({nullable: true})
    newAmountInPool!: bigint | undefined | null

    /**
     * Event method which initiated this change
     */
    @StringColumn_({nullable: false})
    event!: string

    /**
     * Height of the block
     */
    @IntColumn_({nullable: false})
    blockNumber!: number

    /**
     * Timestamp of the block
     */
    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
