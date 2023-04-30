import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

/**
 * A type that records the trade history of an account
 */
@Entity_()
export class SwapHistory {
    constructor(props?: Partial<SwapHistory>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    accountId!: string

    @Column_("text", {nullable: false})
    assetIn!: string

    @Column_("text", {nullable: false})
    assetOut!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    assetAmountIn!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    assetAmountOut!: bigint
}
