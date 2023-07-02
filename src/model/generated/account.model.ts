import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {AccountBalance} from "./accountBalance.model"

/**
 * A type that has ss58 address format of the account. As soon as the chain
 * encounters any new address, they get registered here as user/pool/market account.
 */
@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    /**
     * Account address
     */
    @Column_("text", {nullable: false})
    accountId!: string

    /**
     * List of balances connected to the account
     */
    @OneToMany_(() => AccountBalance, e => e.account)
    balances!: AccountBalance[]

    /**
     * Unique identifier of the object
     */
    @PrimaryColumn_()
    id!: string

    /**
     * Zeitgeist's identifier for market. Valid only for market account.
     */
    @Column_("int4", {nullable: true})
    marketId!: number | undefined | null

    /**
     * Zeitgeist's identifier for pool. Valid only for pool account.
     */
    @Column_("int4", {nullable: true})
    poolId!: number | undefined | null
}
