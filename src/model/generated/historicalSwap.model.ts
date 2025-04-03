import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
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
    @StringColumn_({nullable: false})
    accountId!: string

    /**
     * Asset sold by the user
     */
    @StringColumn_({nullable: false})
    assetIn!: string

    /**
     * Asset bought by the user
     */
    @StringColumn_({nullable: false})
    assetOut!: string

    /**
     * Units of asset user sold
     */
    @BigIntColumn_({nullable: false})
    assetAmountIn!: bigint

    /**
     * Units of asset user bought
     */
    @BigIntColumn_({nullable: false})
    assetAmountOut!: bigint

    /**
     * Event method which initiated this swap
     */
    @StringColumn_({nullable: false})
    event!: string

    /**
     * External fees occuring out of trade
     */
    @BigIntColumn_({nullable: true})
    externalFeeAmount!: bigint | undefined | null

    /**
     * Extrinsic responsible for this change
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Extrinsic(undefined, obj)}, nullable: true})
    extrinsic!: Extrinsic | undefined | null

    /**
     * Height of the block
     */
    @IntColumn_({nullable: false})
    blockNumber!: number

    /**
     * Swap fees
     */
    @BigIntColumn_({nullable: true})
    swapFeeAmount!: bigint | undefined | null

    /**
     * Timestamp of the block
     */
    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
