import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {Extrinsic} from "./_extrinsic"

/**
 * Balance history of a particular asset in an account. Records all transactions
 * associated with the account.
 */
@Entity_()
export class HistoricalAccountBalance {
    constructor(props?: Partial<HistoricalAccountBalance>) {
        Object.assign(this, props)
    }

    /**
     * Account address
     */
    @Index_()
    @StringColumn_({nullable: false})
    accountId!: string

    /**
     * Zeitgeist's identifier for asset
     */
    @StringColumn_({nullable: false})
    assetId!: string

    /**
     * Height of the block
     */
    @IntColumn_({nullable: false})
    blockNumber!: number

    /**
     * Balance difference
     */
    @BigIntColumn_({nullable: false})
    dBalance!: bigint

    /**
     * Event method which initiated this change
     */
    @StringColumn_({nullable: false})
    event!: string

    /**
     * Extrinsic responsible for this change
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Extrinsic(undefined, obj)}, nullable: true})
    extrinsic!: Extrinsic | undefined | null

    /**
     * Unique identifier of the object
     */
    @PrimaryColumn_()
    id!: string

    /**
     * Timestamp of the block
     */
    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
