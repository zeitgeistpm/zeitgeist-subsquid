import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

/**
 * A type that records the trade history of an account.
 */
@Entity_()
export class HistoricalSwap {
    constructor(props?: Partial<HistoricalSwap>) {
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
    @Column_("text", {nullable: false})
    accountId!: string

    /**
     * Asset sold by the user
     */
    @Column_("text", {nullable: false})
    assetIn!: string

    /**
     * Asset bought by the user
     */
    @Column_("text", {nullable: false})
    assetOut!: string

    /**
     * Units of asset user sold
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    assetAmountIn!: bigint

    /**
     * Units of asset user bought
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    assetAmountOut!: bigint
}
