import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {MarketReport} from "./_marketReport"

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
   * New status. Null if no change
   */
  @Column_("text", {nullable: true})
  status!: string | undefined | null

  /**
   * New market report. Null if no change
   */
  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketReport(undefined, obj)}, nullable: true})
  report!: MarketReport | undefined | null

  /**
   * New resolved outcome. Null if no change
   */
  @Column_("text", {nullable: true})
  resolvedOutcome!: string | undefined | null

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
