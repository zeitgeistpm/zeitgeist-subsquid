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
     * Connected market
     */
    @Index_()
    @ManyToOne_(() => Market, {nullable: true})
    market!: Market

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
}
