import { BaseModel, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import { AssetBalance } from '../asset-balance/asset-balance.model';
import { HistoricalAssetBalance } from '../historical-asset-balance/historical-asset-balance.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Account extends BaseModel {
  @StringField({
    description: `Account address`,
  })
  wallet!: string;

  @OneToMany(() => AssetBalance, (param: AssetBalance) => param.account, {
    nullable: true,
    modelName: 'Account',
    relModelName: 'AssetBalance',
    propertyName: 'assetBalances',
  })
  assetBalances?: AssetBalance[];

  @OneToMany(() => HistoricalAssetBalance, (param: HistoricalAssetBalance) => param.account, {
    nullable: true,
    modelName: 'Account',
    relModelName: 'HistoricalAssetBalance',
    propertyName: 'historicalAssetBalances',
  })
  historicalAssetBalances?: HistoricalAssetBalance[];

  constructor(init?: Partial<Account>) {
    super();
    Object.assign(this, init);
  }
}
