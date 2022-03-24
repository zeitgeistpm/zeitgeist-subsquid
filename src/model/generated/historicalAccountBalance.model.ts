import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
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
   * Net balance
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint

  /**
   * Value difference
   */
  @Column_("numeric", {nullable: true})
  dValue!: number | undefined | null

  /**
   * Net value
   */
  @Column_("numeric", {nullable: true})
  value!: number | undefined | null

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
