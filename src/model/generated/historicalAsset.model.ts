import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

/**
 * Price history of the outcome asset
 */
@Entity_()
export class HistoricalAsset {
  constructor(props?: Partial<HistoricalAsset>) {
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
  @Column_("text", {nullable: false})
  accountId!: string

  /**
   * Zeitgeist's identifier for asset
   */
  @Column_("text", {nullable: false})
  assetId!: string

  /**
   * Price difference
   */
  @Column_("numeric", {nullable: true})
  dPrice!: number | undefined | null

  /**
   * Balance difference. It conveys the amount of asset user bought or sold.
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  dQty!: bigint

  /**
   * Spot price of the asset
   */
  @Column_("numeric", {nullable: true})
  price!: number | undefined | null

  /**
   * Balance in the pool account
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  qty!: bigint

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
