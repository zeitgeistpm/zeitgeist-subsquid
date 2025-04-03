import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, Index as Index_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {RoundEndsInfo} from "./_roundEndsInfo"
import {CourtStatus} from "./_courtStatus"
import {VoteItemType} from "./_voteItemType"

/**
 * Court details
 */
@Entity_()
export class Court {
    constructor(props?: Partial<Court>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @IntColumn_({nullable: false})
    marketId!: number

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new RoundEndsInfo(undefined, obj)}, nullable: false})
    roundEnds!: RoundEndsInfo

    @Column_("varchar", {length: 10, nullable: false})
    status!: CourtStatus

    @Column_("varchar", {length: 7, nullable: false})
    voteItemType!: VoteItemType
}
