import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

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
   * Zeitgeist's identifier for pool
   */
  @Column_("integer", {nullable: false})
  poolId!: number

  /**
   * New amount of ZTG present in the pool
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  ztgQty!: bigint

  /**
   * New updated volume
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  volume!: bigint | undefined | null

  /**
   * Event method which initiated this change
   */
  @Column_("text", {nullable: false})
  event!: string

  /**
   * Height of the block
   */
  @Column_("integer", {nullable: false})
  blockNumber!: number

  /**
   * Timestamp of the block
   */
  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date
}
