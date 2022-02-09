import { BaseModel, FloatField, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Asset extends BaseModel {
  @StringField({})
  assetId!: string;

  @FloatField({
    nullable: true,
  })
  price?: number;

  @NumericField({
    nullable: true,

    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  qty?: BN;

  constructor(init?: Partial<Asset>) {
    super();
    Object.assign(this, init);
  }
}
