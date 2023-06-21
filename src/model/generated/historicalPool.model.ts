import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
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
     * New amount of market's base asset present in the pool
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    baseAssetQty!: bigint | undefined | null

    /**
     * Height of the block
     */
    @Column_("int4", {nullable: false})
    blockNumber!: number

    /**
     * Volume difference
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    dVolume!: bigint | undefined | null

    /**
     * Event method which initiated this change
     */
    @Column_("text", {nullable: false})
    event!: string

    /**
     * Zeitgeist's identifier for pool
     */
    @Column_("int4", {nullable: false})
    poolId!: number

    /**
     * Current status of the pool
     */
    @Column_("varchar", {length: 17, nullable: false})
    status!: PoolStatus

    /**
     * Timestamp of the block
     */
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    /**
     * New updated volume
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    volume!: bigint | undefined | null
}
