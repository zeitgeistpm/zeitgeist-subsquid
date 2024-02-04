import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {SwapEvent} from "./_swapEvent"
import {Extrinsic} from "./_extrinsic"

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

    /**
     * Event method which initiated this swap
     */
    @Column_("varchar", {length: 18, nullable: false})
    event!: SwapEvent

    /**
     * External fees occuring out of trade
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    externalFeeAmount!: bigint | undefined | null

    /**
     * Extrinsic responsible for this change
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Extrinsic(undefined, obj)}, nullable: true})
    extrinsic!: Extrinsic | undefined | null

    /**
     * Height of the block
     */
    @Column_("int4", {nullable: false})
    blockNumber!: number

    /**
     * Swap fees for the trade
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    swapFeeAmount!: bigint | undefined | null

    /**
     * Timestamp of the block
     */
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
