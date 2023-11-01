import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {LiquiditySharesManager} from "./_liquiditySharesManager"

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
    account!: Account | undefined | null

    @Column_("text", {nullable: true})
    collateral!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    liquidityParameter!: bigint

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new LiquiditySharesManager(undefined, obj)}, nullable: false})
    liquiditySharesManager!: LiquiditySharesManager

    @Index_()
    @Column_("int4", {nullable: false})
    marketId!: number

    @Index_()
    @Column_("int4", {nullable: false})
    poolId!: number

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    swapFee!: bigint | undefined | null
}
