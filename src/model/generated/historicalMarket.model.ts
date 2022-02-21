import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {MarketReport} from "./_marketReport"

@Entity_()
export class HistoricalMarket {
  constructor(props?: Partial<HistoricalMarket>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  marketId!: number

  @Column_("text", {nullable: false})
  event!: string

  @Column_("text", {nullable: true})
  status!: string | undefined | null

  @Column_("integer", {nullable: true})
  poolId!: number | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketReport(undefined, obj)}, nullable: true})
  report!: MarketReport | undefined | null

  @Column_("text", {nullable: true})
  resolvedOutcome!: string | undefined | null

  @Column_("integer", {nullable: false})
  blockNumber!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  timestamp!: bigint
}
