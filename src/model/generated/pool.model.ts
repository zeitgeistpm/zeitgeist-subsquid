import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {Weight} from "./_weight"

@Entity_()
export class Pool {
  constructor(props?: Partial<Pool>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  poolId!: number

  @Column_("text", {nullable: true})
  accountId!: string | undefined | null

  @Column_("text", {nullable: false})
  baseAsset!: string

  @Column_("integer", {nullable: false})
  marketId!: number

  @Column_("text", {nullable: false})
  poolStatus!: string

  @Column_("text", {nullable: false})
  scoringRule!: string

  @Column_("text", {nullable: false})
  swapFee!: string

  @Column_("text", {nullable: false})
  totalSubsidy!: string

  @Column_("text", {nullable: false})
  totalWeight!: string

  @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val == null ? undefined : val.toJSON()), from: obj => marshal.fromList(obj, val => val == null ? undefined : new Weight(undefined, val))}, nullable: false})
  weights!: (Weight | undefined | null)[]

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  ztgQty!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  volume!: bigint
}
