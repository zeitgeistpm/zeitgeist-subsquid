import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_, StringColumn as StringColumn_, DateTimeColumn as DateTimeColumn_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
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
    @StringColumn_({nullable: false})
    baseAsset!: string

    /**
     * Timestamp of pool creation
     */
    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    /**
     * Zeitgeist's identifier for market connected to the pool
     */
    @Index_()
    @IntColumn_({nullable: false})
    marketId!: number

    /**
     * Zeitgeist's identifier for pool
     */
    @Index_()
    @IntColumn_({nullable: false})
    poolId!: number

    /**
     * Status of the pool
     */
    @Column_("varchar", {length: 17, nullable: false})
    status!: PoolStatus

    /**
     * Fee applied to each swap
     */
    @StringColumn_({nullable: true})
    swapFee!: string | undefined | null

    /**
     * Subsidy gathered for the market
     */
    @StringColumn_({nullable: true})
    totalSubsidy!: string | undefined | null

    /**
     * Sum of `weights`
     */
    @StringColumn_({nullable: false})
    totalWeight!: string

    /**
     * List of lengths for each asset
     */
    @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => new Weight(undefined, marshal.nonNull(val)))}, nullable: false})
    weights!: (Weight)[]
}
