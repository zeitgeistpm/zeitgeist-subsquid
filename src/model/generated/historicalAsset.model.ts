import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

/**
 * A type that records the price history of an outcome asset and
 * trade history of an account
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
  @Column_("text", {nullable: true})
  accountId!: string | undefined | null

  /**
   * Amount of ZTG which user spent/redeemed for swap trade
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  ztgTraded!: bigint | undefined | null

  /**
   * Zeitgeist's identifier for asset
   */
  @Column_("text", {nullable: false})
  assetId!: string

  /**
   * Price of the asset has decreased if -ve and +ve if increased
   */
  @Column_("numeric", {nullable: true})
  dPrice!: number | undefined | null

  /**
   * Units of asset user bought (-ve) or sold (+ve)
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  dAmountInPool!: bigint | undefined | null

  /**
   * Price of the asset after trade execution/market resolution
   */
  @Column_("numeric", {nullable: true})
  newPrice!: number | undefined | null

  /**
   * Units of asset present in the pool account
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  newAmountInPool!: bigint | undefined | null

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
