import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, OneToMany as OneToMany_, IntColumn as IntColumn_, BooleanColumn as BooleanColumn_, BigIntColumn as BigIntColumn_, Index as Index_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import * as marshal from "./marshal"
import {Asset} from "./asset.model"
import {MarketBonds} from "./_marketBonds"
import {CategoryMetadata} from "./_categoryMetadata"
import {MarketCreation} from "./_marketCreation"
import {MarketDeadlines} from "./_marketDeadlines"
import {MarketReport} from "./_marketReport"
import {DisputeMechanism} from "./_disputeMechanism"
import {MarketType} from "./_marketType"
import {MarketPeriod} from "./_marketPeriod"
import {Pool} from "./pool.model"
import {NeoPool} from "./neoPool.model"
import {ScoringRule} from "./_scoringRule"
import {MarketStatus} from "./_marketStatus"

/**
 * Prediction market details
 */
@Entity_()
export class Market {
    constructor(props?: Partial<Market>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    /**
     * Address responsible for authorizing disputes. Null if Adv Comm is the authority
     */
    @StringColumn_({nullable: true})
    authorizedAddress!: string | undefined | null

    /**
     * List of assets connected to the market
     */
    @OneToMany_(() => Asset, e => e.market)
    assets!: Asset[]

    /**
     * The base asset in the market swap pool (usually a currency)
     */
    @StringColumn_({nullable: false})
    baseAsset!: string

    /**
     * Tracks the status of the advisory, oracle and validity bonds
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketBonds(undefined, obj)}, nullable: true})
    bonds!: MarketBonds | undefined | null

    /**
     * Name of all categories glued together
     */
    @StringColumn_({nullable: true})
    categoryNames!: string | undefined | null

    /**
     * Share details
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => new CategoryMetadata(undefined, marshal.nonNull(val)))}, nullable: true})
    categories!: (CategoryMetadata)[] | undefined | null

    /**
     * Can be `Permissionless` or `Advised`
     */
    @Column_("varchar", {length: 14, nullable: false})
    creation!: MarketCreation

    /**
     * Account address of the market creator
     */
    @StringColumn_({nullable: false})
    creator!: string

    /**
     * The creator's fee
     */
    @IntColumn_({nullable: true})
    creatorFee!: number | undefined | null

    /**
     * Deadlines for the market represented in blocks
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketDeadlines(undefined, obj)}, nullable: true})
    deadlines!: MarketDeadlines | undefined | null

    /**
     * Description of the market
     */
    @StringColumn_({nullable: true})
    description!: string | undefined | null

    /**
     * The dispute information for each dispute that's been issued
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.map((val: any) => val == null ? undefined : val.toJSON()), from: obj => obj == null ? undefined : marshal.fromList(obj, val => val == null ? undefined : new MarketReport(undefined, val))}, nullable: true})
    disputes!: (MarketReport | undefined | null)[] | undefined | null

    /**
     * Can be `Authorized`/`Court`/`SimpleDisputes` or undefined
     */
    @Column_("varchar", {length: 14, nullable: true})
    disputeMechanism!: DisputeMechanism | undefined | null

    /**
     * `True` if early closure is scheduled
     */
    @BooleanColumn_({nullable: false})
    earlyClose!: boolean

    /**
     * Checks if each category has a name for display on UI
     */
    @BooleanColumn_({nullable: false})
    hasValidMetaCategories!: boolean

    /**
     * Image for the market
     */
    @StringColumn_({nullable: true})
    img!: string | undefined | null

    /**
     * Liquidity on the market's pool
     */
    @BigIntColumn_({nullable: false})
    liquidity!: bigint

    /**
     * Zeitgeist's identifier for market
     */
    @Index_()
    @IntColumn_({nullable: false})
    marketId!: number

    /**
     * Type of the market
     */
    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new MarketType(undefined, obj)}, nullable: false})
    marketType!: MarketType

    /**
     * IPFS cid for market metadata
     */
    @StringColumn_({nullable: false})
    metadata!: string

    /**
     * Account designated to report on the market
     */
    @StringColumn_({nullable: false})
    oracle!: string

    /**
     * Share identifiers
     */
    @StringColumn_({array: true, nullable: false})
    outcomeAssets!: (string)[]

    /**
     * Time period expressed in block numbers or timestamps
     */
    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new MarketPeriod(undefined, obj)}, nullable: false})
    period!: MarketPeriod

    /**
     * Market's liquidity pool details
     */
    @Index_()
    @ManyToOne_(() => Pool, {nullable: true})
    pool!: Pool | undefined | null

    /**
     * Market's amm2 pool details
     */
    @Index_()
    @ManyToOne_(() => NeoPool, {nullable: true})
    neoPool!: NeoPool | undefined | null

    /**
     * Reasoning for market rejection
     */
    @StringColumn_({nullable: true})
    rejectReason!: string | undefined | null

    /**
     * Reported outcome of the market. Null if the market is not reported yet
     */
    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new MarketReport(undefined, obj)}, nullable: true})
    report!: MarketReport | undefined | null

    /**
     * Resolved outcome for the market
     */
    @StringColumn_({nullable: true})
    resolvedOutcome!: string | undefined | null

    /**
     * Type of scalar range if market is of type scalar
     */
    @StringColumn_({nullable: true})
    scalarType!: string | undefined | null

    /**
     * Scoring rule used for the market
     */
    @Column_("varchar", {length: 26, nullable: false})
    scoringRule!: ScoringRule

    /**
     * Short name for the market
     */
    @StringColumn_({nullable: true})
    slug!: string | undefined | null

    /**
     * Status of the market
     */
    @Column_("varchar", {length: 19, nullable: false})
    status!: MarketStatus

    /**
     * Market tags
     */
    @StringColumn_({array: true, nullable: true})
    tags!: (string | undefined | null)[] | undefined | null

    /**
     * Total amount of base-asset that has moved through a market's liquidity pool
     */
    @BigIntColumn_({nullable: false})
    volume!: bigint

    /**
     * Market question
     */
    @StringColumn_({nullable: true})
    question!: string | undefined | null
}
