import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {AccountBalance} from "./accountBalance.model"

@Entity_()
export class Account {
  constructor(props?: Partial<Account>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  /**
   * Account address
   */
  @Column_("text", {nullable: false})
  wallet!: string

  @OneToMany_(() => AccountBalance, e => e.account)
  accountBalances!: AccountBalance[]
}
