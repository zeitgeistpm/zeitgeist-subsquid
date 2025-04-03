import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, StringColumn as StringColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, OneToMany as OneToMany_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
import {Account} from "./account.model"
import {LiquiditySharesManager} from "./liquiditySharesManager.model"

/**
 * AMM2 pool details
 */
@Entity_()
export class NeoPool {
    constructor(props?: Partial<NeoPool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    account!: Account

    @StringColumn_({nullable: false})
    collateral!: string

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @BigIntColumn_({nullable: false})
    liquidityParameter!: bigint

    @OneToMany_(() => LiquiditySharesManager, e => e.neoPool)
    liquiditySharesManager!: LiquiditySharesManager[]

    @Index_()
    @IntColumn_({nullable: false})
    marketId!: number

    @Index_()
    @IntColumn_({nullable: false})
    poolId!: number

    @BigIntColumn_({nullable: false})
    swapFee!: bigint

    @BigIntColumn_({nullable: false})
    totalStake!: bigint
}
