import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

/**
 * A type that has detail of the outcome asset. It is initialised as soon as the
 * market is created and price is assigned when pool is deployed for the market.
 */
@Entity_()
export class Asset {
  constructor(props?: Partial<Asset>) {
    Object.assign(this, props)
  }

  /**
   * Unique identifier of the object
   */
  @PrimaryColumn_()
  id!: string

  /**
   * Zeitgeist's identifier of the asset
   */
  @Column_("text", {nullable: false})
  assetId!: string

  /**
   * Zeitgeist's identifier of the pool
   */
  @Column_("integer", {nullable: true})
  poolId!: number | undefined | null

  /**
   * Spot price of the asset in the pool
   */
  @Column_("numeric", {nullable: true})
  price!: number | undefined | null

  /**
   * Balance of the asset present in the pool account
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  qty!: bigint | undefined | null
}
