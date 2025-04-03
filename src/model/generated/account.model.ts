import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, OneToMany as OneToMany_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
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
    @StringColumn_({nullable: false})
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
    @IntColumn_({nullable: true})
    marketId!: number | undefined | null
}
