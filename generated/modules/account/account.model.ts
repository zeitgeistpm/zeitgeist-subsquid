import { BaseModel, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import { AccountBalance } from '../account-balance/account-balance.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Account extends BaseModel {
  @StringField({
    description: `Account address`,
  })
  wallet!: string;

  @OneToMany(() => AccountBalance, (param: AccountBalance) => param.account, {
    nullable: true,
    modelName: 'Account',
    relModelName: 'AccountBalance',
    propertyName: 'accountBalances',
  })
  accountBalances?: AccountBalance[];

  constructor(init?: Partial<Account>) {
    super();
    Object.assign(this, init);
  }
}
