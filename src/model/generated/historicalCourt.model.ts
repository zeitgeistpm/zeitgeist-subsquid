import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import {CourtEvent} from "./_courtEvent"

/**
 * History of a particular court capturing its lifecyle and juror participation.
 */
@Entity_()
export class HistoricalCourt {
    constructor(props?: Partial<HistoricalCourt>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: true})
    accountId!: string | undefined | null

    @IntColumn_({nullable: false})
    blockNumber!: number

    @Index_()
    @IntColumn_({nullable: false})
    courtId!: number

    @Column_("varchar", {length: 17, nullable: false})
    event!: CourtEvent

    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
