import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {CategoryMetadata} from "./_categoryMetadata"
import {MarketType} from "./_marketType"
import {MarketPeriod} from "./_marketPeriod"
import {MarketReport} from "./_marketReport"
import {MarketDisputeMechanism} from "./_marketDisputeMechanism"

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
  @Column_("integer", {nullable: false})
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
  @Column_("integer", {nullable: true})
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
   * Timestamp at which market should end
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  end!: bigint

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
   * Zeitgeist's indentifier for liquidity pool
   */
  @Column_("integer", {nullable: true})
  poolId!: number | undefined | null

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
   * Can be `authorized` or `court` or `simpleDisputes`
   */
  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new MarketDisputeMechanism(undefined, marshal.nonNull(obj))}, nullable: false})
  disputeMechanism!: MarketDisputeMechanism
}
