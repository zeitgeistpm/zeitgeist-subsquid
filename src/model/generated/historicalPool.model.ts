import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import {PoolStatus} from "./_poolStatus"

/**
 * Liquidity history of a particular pool. Records all transactions
 * associated with the pool.
 */
@Entity_()
export class HistoricalPool {
    constructor(props?: Partial<HistoricalPool>) {
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
     * Event method which initiated this change
     */
    @StringColumn_({nullable: false})
    event!: string

    /**
     * Zeitgeist's identifier for pool
     */
    @IntColumn_({nullable: false})
    poolId!: number

    /**
     * Current status of the pool
     */
    @Column_("varchar", {length: 17, nullable: true})
    status!: PoolStatus | undefined | null

    /**
     * Timestamp of the block
     */
    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
