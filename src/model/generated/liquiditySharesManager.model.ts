import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import {NeoPool} from "./neoPool.model"

@Entity_()
export class LiquiditySharesManager {
    constructor(props?: Partial<LiquiditySharesManager>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    account!: string

    @BigIntColumn_({nullable: false})
    fees!: bigint

    @Index_()
    @ManyToOne_(() => NeoPool, {nullable: true})
    neoPool!: NeoPool

    @BigIntColumn_({nullable: false})
    stake!: bigint
}
