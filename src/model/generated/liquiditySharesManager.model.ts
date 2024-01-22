import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {NeoPool} from "./neoPool.model"

@Entity_()
export class LiquiditySharesManager {
    constructor(props?: Partial<LiquiditySharesManager>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    account!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    fees!: bigint

    @Index_()
    @ManyToOne_(() => NeoPool, {nullable: true})
    neoPool!: NeoPool

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    stake!: bigint
}
