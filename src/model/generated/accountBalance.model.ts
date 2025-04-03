import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {Account} from "./account.model"

/**
 * Balance of a particular asset denoted by assetId present in the account
 */
@Entity_()
export class AccountBalance {
    constructor(props?: Partial<AccountBalance>) {
        Object.assign(this, props)
    }

    /**
     * Connected account
     */
    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    account!: Account

    /**
     * Zeitgeist's identifier for asset
     */
    @StringColumn_({nullable: false})
    assetId!: string

    /**
     * Balance of the asset
     */
    @BigIntColumn_({nullable: false})
    balance!: bigint

    /**
     * Unique identifier of the object
     */
    @PrimaryColumn_()
    id!: string
}
