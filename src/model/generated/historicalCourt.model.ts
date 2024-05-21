import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
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
    @Column_("text", {nullable: true})
    accountId!: string | undefined | null

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Index_()
    @Column_("int4", {nullable: false})
    courtId!: number

    @Column_("varchar", {length: 11, nullable: false})
    event!: CourtEvent

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
