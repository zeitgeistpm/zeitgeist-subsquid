import { BaseModel, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Account } from '../account/account.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class AccountBalance extends BaseModel {
  @ManyToOne(() => Account, (param: Account) => param.accountBalances, {
    skipGraphQLField: true,

    modelName: 'AccountBalance',
    relModelName: 'Account',
    propertyName: 'account',
  })
  account!: Account;

  @StringField({})
  assetId!: string;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  balance!: BN;

  constructor(init?: Partial<AccountBalance>) {
    super();
    Object.assign(this, init);
  }
}
