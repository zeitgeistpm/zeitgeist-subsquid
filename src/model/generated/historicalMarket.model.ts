import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, ManyToOne as ManyToOne_, Index as Index_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {MarketEvent} from "./_marketEvent"
import {Market} from "./market.model"
import {OutcomeReport} from "./_outcomeReport"
import {MarketStatus} from "./_marketStatus"

/**
 * Market history of a particular market. Records all transactions
 * associated with the market.
 */
@Entity_()
export class HistoricalMarket {
    constructor(props?: Partial<HistoricalMarket>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    /**
     * Height of the block
     */
    @IntColumn_({nullable: false})
    blockNumber!: number

    /**
     * The account that reported or disputed
     */
    @StringColumn_({nullable: true})
    by!: string | undefined | null

    /**
     * Change in market liquidity
     */
    @BigIntColumn_({nullable: false})
    dLiquidity!: bigint

    /**
     * Change in market volume
     */
    @BigIntColumn_({nullable: false})
    dVolume!: bigint

    /**
     * Event method which initiated this change
     */
    @Column_("varchar", {length: 25, nullable: false})
    event!: MarketEvent

    /**
     * New updated liquidity
     */
    @BigIntColumn_({nullable: false})
    liquidity!: bigint

    /**
     * Details of the connected market
     */
    @Index_()
    @ManyToOne_(() => Market, {nullable: true})
    market!: Market

    /**
     * Reported or disputed outcome for the market
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new OutcomeReport(undefined, obj)}, nullable: true})
    outcome!: OutcomeReport | undefined | null

    /**
     * Latest resolved outcome
     */
    @StringColumn_({nullable: true})
    resolvedOutcome!: string | undefined | null

    /**
     * Latest market status
     */
    @Column_("varchar", {length: 19, nullable: false})
    status!: MarketStatus

    /**
     * Timestamp of the block
     */
    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    /**
     * New updated volume
     */
    @BigIntColumn_({nullable: false})
    volume!: bigint
}
