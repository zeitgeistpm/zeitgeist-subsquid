import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
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
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amountInPool!: bigint

    /**
     * Zeitgeist's identifier for asset
     */
    @Column_("text", {nullable: false})
    assetId!: string

    /**
     * Color identifier
     */
    @Column_("text", {nullable: true})
    color!: string | undefined | null

    /**
     * Image identifier
     */
    @Column_("text", {nullable: true})
    img!: string | undefined | null

    /**
     * Connected market
     */
    @Index_()
    @ManyToOne_(() => Market, {nullable: true})
    market!: Market

    /**
     * Title ex. `Locomotiv will not be defeated`
     */
    @Column_("text", {nullable: true})
    name!: string | undefined | null

    /**
     * Connected pool
     */
    @Index_()
    @ManyToOne_(() => Pool, {nullable: true})
    pool!: Pool | undefined | null

    /**
     * Spot price of the asset in the pool
     */
    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    price!: number

    /**
     * Short abbreviation ex. `LMDRAW`
     */
    @Column_("text", {nullable: true})
    ticker!: string | undefined | null
}
