import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, FloatColumn as FloatColumn_} from "@subsquid/typeorm-store"
import {Market} from "./market.model"
import {Pool} from "./pool.model"

/**
 * A type that has detail of the outcome asset. It is initialised as soon as the
 * market is created and price is assigned when pool is deployed for the market.
 */
@Entity_()
export class Asset {
    constructor(props?: Partial<Asset>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    /**
     * Balance of the asset present in the pool account
     */
    @BigIntColumn_({nullable: false})
    amountInPool!: bigint

    /**
     * Zeitgeist's identifier for asset
     */
    @StringColumn_({nullable: false})
    assetId!: string

    /**
     * Color identifier
     */
    @StringColumn_({nullable: true})
    color!: string | undefined | null

    /**
     * Image identifier
     */
    @StringColumn_({nullable: true})
    img!: string | undefined | null

    /**
     * Primary market (null for multi-market assets, set for single-market assets)
     */
    @Index_()
    @ManyToOne_(() => Market, {nullable: true})
    market!: Market | undefined | null

    /**
     * All market IDs this asset is associated with (for multi-market pools)
     */
    @IntColumn_({array: true, nullable: true})
    marketIds!: (number)[] | undefined | null

    /**
     * Title ex. `Locomotiv will not be defeated`
     */
    @StringColumn_({nullable: true})
    name!: string | undefined | null

    /**
     * Connected pool
     */
    @Index_()
    @ManyToOne_(() => Pool, {nullable: true})
    pool!: Pool | undefined | null

    /**
     * Connected neo pool ID
     */
    @Index_()
    @IntColumn_({nullable: true})
    poolId!: number | undefined | null

    /**
     * Spot price of the asset in the pool
     */
    @FloatColumn_({nullable: false})
    price!: number

    /**
     * Short abbreviation ex. `LMDRAW`
     */
    @StringColumn_({nullable: true})
    ticker!: string | undefined | null
}
