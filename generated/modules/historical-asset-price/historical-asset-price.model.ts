import { BaseModel, IntField, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Asset } from '../asset/asset.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class HistoricalAssetPrice extends BaseModel {
  @ManyToOne(() => Asset, (param: Asset) => param.historicalAssetPrice, {
    skipGraphQLField: true,

    modelName: 'HistoricalAssetPrice',
    relModelName: 'Asset',
    propertyName: 'asset',
  })
  asset!: Asset;

  @IntField({})
  quantity!: number;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  price!: BN;

  @StringField({})
  event!: string;

  @IntField({})
  blockNumber!: number;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  timestamp!: BN;

  constructor(init?: Partial<HistoricalAssetPrice>) {
    super();
    Object.assign(this, init);
  }
}
