import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Weight} from "./_weight"

/**
 * Liquidity pool details
 */
@Entity_()
export class Pool {
  constructor(props?: Partial<Pool>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  /**
   * Zeitgeist's identifier for pool
   */
  @Index_()
  @Column_("int4", {nullable: false})
  poolId!: number

  /**
   * Zeitgeist's identifier for account
   */
  @Column_("text", {nullable: true})
  accountId!: string | undefined | null

  /**
   * Zeitgeist's identifier for pool
   */
  @Column_("text", {nullable: false})
  baseAsset!: string

  @Index_()
  @Column_("int4", {nullable: false})
  marketId!: number

  /**
   * Status of the pool
   */
  @Column_("text", {nullable: false})
  poolStatus!: string

  /**
   * Scoring rule used for the pool
   */
  @Column_("text", {nullable: false})
  scoringRule!: string

  /**
   * Fee applied to each swap
   */
  @Column_("text", {nullable: false})
  swapFee!: string

  /**
   * Subsidy gathered for the market
   */
  @Column_("text", {nullable: false})
  totalSubsidy!: string

  /**
   * Sum of `weights`
   */
  @Column_("text", {nullable: false})
  totalWeight!: string

  /**
   * List of lengths for each asset
   */
  @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val == null ? undefined : val.toJSON()), from: obj => marshal.fromList(obj, val => val == null ? undefined : new Weight(undefined, val))}, nullable: false})
  weights!: (Weight | undefined | null)[]

  /**
   * Amount of ZTG present in the pool
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  ztgQty!: bigint

  /**
   * Total amount of ZTG that has moved through a market's liquidity pool
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  volume!: bigint

  /**
   * Timestamp of pool creation
   */
  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date
}
