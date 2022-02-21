import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class HistoricalAsset {
  constructor(props?: Partial<HistoricalAsset>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  assetId!: string

  @Column_("numeric", {nullable: true})
  dPrice!: number | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  dQty!: bigint

  @Column_("numeric", {nullable: true})
  price!: number | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  qty!: bigint

  @Column_("text", {nullable: false})
  event!: string

  @Column_("integer", {nullable: false})
  blockNumber!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  timestamp!: bigint
}
