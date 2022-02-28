import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {CategoryMetadata} from "./_categoryMetadata"
import {MarketType} from "./_marketType"
import {MarketPeriod} from "./_marketPeriod"
import {MarketReport} from "./_marketReport"
import {MarketDisputeMechanism} from "./_marketDisputeMechanism"

@Entity_()
export class Market {
  constructor(props?: Partial<Market>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  marketId!: number

  @Column_("text", {nullable: false})
  creator!: string

  @Column_("text", {nullable: false})
  creation!: string

  @Column_("integer", {nullable: true})
  creatorFee!: number | undefined | null

  @Column_("text", {nullable: false})
  oracle!: string

  @Column_("text", {array: true, nullable: false})
  outcomeAssets!: (string | undefined | null)[]

  @Column_("text", {nullable: true})
  slug!: string | undefined | null

  @Column_("text", {nullable: true})
  question!: string | undefined | null

  @Column_("text", {nullable: true})
  description!: string | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val == null ? undefined : val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => val == null ? undefined : new CategoryMetadata(undefined, val))}, nullable: true})
  categories!: (CategoryMetadata | undefined | null)[] | undefined | null

  @Column_("text", {array: true, nullable: true})
  tags!: (string | undefined | null)[] | undefined | null

  @Column_("text", {nullable: true})
  img!: string | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new MarketType(undefined, marshal.nonNull(obj))}, nullable: false})
  marketType!: MarketType

  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new MarketPeriod(undefined, marshal.nonNull(obj))}, nullable: false})
  period!: MarketPeriod

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  end!: bigint

  @Column_("text", {nullable: false})
  scoringRule!: string

  @Column_("text", {nullable: false})
  status!: string

  @Column_("integer", {nullable: true})
  poolId!: number | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketReport(undefined, obj)}, nullable: true})
  report!: MarketReport | undefined | null

  @Column_("text", {nullable: true})
  resolvedOutcome!: string | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new MarketDisputeMechanism(undefined, marshal.nonNull(obj))}, nullable: false})
  mdm!: MarketDisputeMechanism
}
