import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

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
   * Unique identifier of the object
   */
  @PrimaryColumn_()
  id!: string

  /**
   * Account address
   */
  @Index_()
  @Column_("text", {nullable: false})
  accountId!: string

  /**
   * Zeitgeist's identifier for asset
   */
  @Column_("text", {nullable: false})
  assetId!: string

  /**
   * Balance difference
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  dBalance!: bigint

  /**
   * Balance of the asset
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint

  /**
   * Value difference
   */
  @Column_("numeric", {nullable: true})
  dValue!: number | undefined | null

  /**
   * Computed based on the spot price of the asset
   */
  @Column_("numeric", {nullable: true})
  value!: number | undefined | null

  /**
   * Portfolio value or sum of all asset values in an account
   */
  @Column_("numeric", {nullable: true})
  pvalue!: number | undefined | null

  /**
   * Event method which initiated this change
   */
  @Column_("text", {nullable: false})
  event!: string

  /**
   * Height of the block
   */
  @Column_("int4", {nullable: false})
  blockNumber!: number

  /**
   * Timestamp of the block
   */
  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date
}
