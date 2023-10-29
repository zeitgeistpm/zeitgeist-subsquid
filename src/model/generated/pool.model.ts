import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {Asset} from "./asset.model"
import {PoolStatus} from "./_poolStatus"
import {Weight} from "./_weight"

/**
 * Liquidity pool details
 */
@Entity_()
export class Pool {
    constructor(props?: Partial<Pool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    /**
     * Account for the pool
     */
    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    account!: Account

    /**
     * List of assets connected to the pool
     */
    @OneToMany_(() => Asset, e => e.pool)
    assets!: Asset[]

    /**
     * The base asset in the market swap pool (usually a currency)
     */
    @Column_("text", {nullable: false})
    baseAsset!: string

    /**
     * Timestamp of pool creation
     */
    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    /**
     * Zeitgeist's identifier for market connected to the pool
     */
    @Index_()
    @Column_("int4", {nullable: false})
    marketId!: number

    /**
     * Zeitgeist's identifier for pool
     */
    @Index_()
    @Column_("int4", {nullable: false})
    poolId!: number

    /**
     * Status of the pool
     */
    @Column_("varchar", {length: 17, nullable: false})
    status!: PoolStatus

    /**
     * Fee applied to each swap
     */
    @Column_("text", {nullable: true})
    swapFee!: string | undefined | null

    /**
     * Subsidy gathered for the market
     */
    @Column_("text", {nullable: true})
    totalSubsidy!: string | undefined | null

    /**
     * Sum of `weights`
     */
    @Column_("text", {nullable: false})
    totalWeight!: string

    /**
     * Total amount of ZTG that has moved through a market's liquidity pool
     */
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    volume!: bigint

    /**
     * List of lengths for each asset
     */
    @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => new Weight(undefined, marshal.nonNull(val)))}, nullable: false})
    weights!: (Weight)[]
}
