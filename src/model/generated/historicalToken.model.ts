import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import {TokenEvent} from "./_tokenEvent"

@Entity_()
export class HistoricalToken {
    constructor(props?: Partial<HistoricalToken>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    accountId!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @StringColumn_({array: true, nullable: false})
    assetIn!: (string)[]

    @StringColumn_({array: true, nullable: false})
    assetOut!: (string)[]

    @IntColumn_({nullable: false})
    blockNumber!: number

    @Index_()
    @IntColumn_({nullable: false})
    marketId!: number

    @Column_("varchar", {length: 13, nullable: false})
    event!: TokenEvent

    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
