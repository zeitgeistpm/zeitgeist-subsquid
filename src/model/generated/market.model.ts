import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {CategoryMetadata} from "./_categoryMetadata"
import {MarketDeadlines} from "./_marketDeadlines"
import {MarketType} from "./_marketType"
import {MarketPeriod} from "./_marketPeriod"
import {Pool} from "./pool.model"
import {MarketReport} from "./_marketReport"

/**
 * Prediction market details
 */
@Entity_()
export class Market {
  constructor(props?: Partial<Market>) {
    Object.assign(this, props)
  }

  /**
   * Unique identifier of the object
   */
  @PrimaryColumn_()
  id!: string

  /**
   * Zeitgeist's identifier for market
   */
  @Column_("int4", {nullable: false})
  marketId!: number

  /**
   * Account address of the market creator
   */
  @Column_("text", {nullable: false})
  creator!: string

  /**
   * Can be `Permissionless` or `Advised`
   */
  @Column_("text", {nullable: false})
  creation!: string

  /**
   * The creator's fee
   */
  @Column_("int4", {nullable: true})
  creatorFee!: number | undefined | null

  /**
   * Account designated to report on the market
   */
  @Column_("text", {nullable: false})
  oracle!: string

  /**
   * Share identifiers
   */
  @Column_("text", {array: true, nullable: false})
  outcomeAssets!: (string | undefined | null)[]

  /**
   * Short name for the market
   */
  @Column_("text", {nullable: true})
  slug!: string | undefined | null

  /**
   * Market question
   */
  @Column_("text", {nullable: true})
  question!: string | undefined | null

  /**
   * Description of the market
   */
  @Column_("text", {nullable: true})
  description!: string | undefined | null

  /**
   * Share details
   */
  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val == null ? undefined : val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => val == null ? undefined : new CategoryMetadata(undefined, val))}, nullable: true})
  categories!: (CategoryMetadata | undefined | null)[] | undefined | null

  /**
   * Type of scalar range if market is of type scalar
   */
  @Column_("text", {nullable: true})
  scalarType!: string | undefined | null

  /**
   * Deadlines for the market represented in blocks
   */
  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketDeadlines(undefined, obj)}, nullable: true})
  deadlines!: MarketDeadlines | undefined | null

  /**
   * Market tags
   */
  @Column_("text", {array: true, nullable: true})
  tags!: (string | undefined | null)[] | undefined | null

  /**
   * Image for the market
   */
  @Column_("text", {nullable: true})
  img!: string | undefined | null

  /**
   * IPFS cid for market metadata
   */
  @Column_("text", {nullable: false})
  metadata!: string

  /**
   * Type of the market
   */
  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new MarketType(undefined, marshal.nonNull(obj))}, nullable: false})
  marketType!: MarketType

  /**
   * Time period expressed in block numbers or timestamps
   */
  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new MarketPeriod(undefined, marshal.nonNull(obj))}, nullable: false})
  period!: MarketPeriod

  /**
   * Scoring rule used for the market
   */
  @Column_("text", {nullable: false})
  scoringRule!: string

  /**
   * Status of the market
   */
  @Column_("text", {nullable: false})
  status!: string

  /**
   * Market's liquidity pool details
   */
  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool | undefined | null

  /**
   * Reported outcome of the market. Null if the market is not reported yet
   */
  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketReport(undefined, obj)}, nullable: true})
  report!: MarketReport | undefined | null

  /**
   * Resolved outcome for the market
   */
  @Column_("text", {nullable: true})
  resolvedOutcome!: string | undefined | null

  /**
   * Can be `Authorized` or `Court` or `SimpleDisputes`
   */
  @Column_("text", {nullable: false})
  disputeMechanism!: string

  /**
   * Address responsible for authorizing disputes. Null if Adv Comm is the authority
   */
  @Column_("text", {nullable: true})
  authorizedAddress!: string | undefined | null

  /**
   * Reasoning for market rejection
   */
  @Column_("text", {nullable: true})
  rejectReason!: string | undefined | null
}
