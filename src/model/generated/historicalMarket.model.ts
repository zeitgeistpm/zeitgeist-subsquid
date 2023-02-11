import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

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
   * Event method which initiated this change
   */
  @Column_("text", {nullable: false})
  event!: string

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
   * Latest resolved outcome
   */
  @Column_("text", {nullable: true})
  resolvedOutcome!: string | undefined | null

  /**
   * Latest market status
   */
  @Column_("text", {nullable: true})
  status!: string | undefined | null

  /**
   * Timestamp of the block
   */
  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date
}
