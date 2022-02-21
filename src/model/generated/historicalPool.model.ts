import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class HistoricalPool {
  constructor(props?: Partial<HistoricalPool>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  poolId!: number

  @Column_("text", {nullable: false})
  event!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  ztgQty!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  volume!: bigint | undefined | null

  @Column_("integer", {nullable: false})
  blockNumber!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  timestamp!: bigint
}
