import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
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

    @Column_("text", {nullable: false})
    collateral!: string

    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    liquidityParameter!: bigint

    @OneToMany_(() => LiquiditySharesManager, e => e.neoPool)
    liquiditySharesManager!: LiquiditySharesManager[]

    @Index_()
    @Column_("int4", {nullable: false})
    marketId!: number

    @Index_()
    @Column_("int4", {nullable: false})
    poolId!: number

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    swapFee!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalStake!: bigint
}
