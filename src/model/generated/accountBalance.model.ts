import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"

/**
 * Balance of a particular asset denoted by assetId present in the account
 */
@Entity_()
export class AccountBalance {
  constructor(props?: Partial<AccountBalance>) {
    Object.assign(this, props)
  }

  /**
   * Unique identifier of the object
   */
  @PrimaryColumn_()
  id!: string

  /**
   * Connected account
   */
  @Index_()
  @ManyToOne_(() => Account, {nullable: false})
  account!: Account

  /**
   * Zeitgeist's identifier of the asset
   */
  @Column_("text", {nullable: false})
  assetId!: string

  /**
   * Balance of the asset
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint
}
