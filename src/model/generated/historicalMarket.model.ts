import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {MarketEvent} from "./_marketEvent"
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
    @Column_("int4", {nullable: false})
    blockNumber!: number

    /**
     * The account that reported or disputed
     */
    @Column_("text", {nullable: true})
    by!: string | undefined | null

    /**
     * Event method which initiated this change
     */
    @Column_("varchar", {length: 15, nullable: false})
    event!: MarketEvent

    /**
     * Zeitgeist's identifier for market
     */
    @Column_("int4", {nullable: false})
    marketId!: number

    /**
     * Zeitgeist's identifier for pool
     */
    @Column_("int4", {nullable: true})
    poolId!: number | undefined | null

    /**
     * Reported or disputed outcome for the market
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new OutcomeReport(undefined, obj)}, nullable: true})
    outcome!: OutcomeReport | undefined | null

    /**
     * Latest resolved outcome
     */
    @Column_("text", {nullable: true})
    resolvedOutcome!: string | undefined | null

    /**
     * Latest market status
     */
    @Column_("varchar", {length: 19, nullable: false})
    status!: MarketStatus

    /**
     * Timestamp of the block
     */
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
