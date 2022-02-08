import { BaseModel, IntField, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Pool } from '../pool/pool.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class HistoricalPool extends BaseModel {
  @ManyToOne(() => Pool, (param: Pool) => param.historicalPool, {
    skipGraphQLField: true,

    modelName: 'HistoricalPool',
    relModelName: 'Pool',
    propertyName: 'pool',
  })
  pool!: Pool;

  @StringField({})
  event!: string;

  @StringField({})
  ztgQty!: string;

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

  constructor(init?: Partial<HistoricalPool>) {
    super();
    Object.assign(this, init);
  }
}
