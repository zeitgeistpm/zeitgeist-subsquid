import { BaseModel, IntField, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Pool extends BaseModel {
  @IntField({})
  poolId!: number;

  @StringField({})
  baseAsset!: string;

  @IntField({})
  marketId!: number;

  @StringField({})
  poolStatus!: string;

  @StringField({})
  scoringRule!: string;

  @StringField({})
  swapFee!: string;

  @StringField({})
  totalSubsidy!: string;

  @StringField({})
  totalWeight!: string;

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

  constructor(init?: Partial<Pool>) {
    super();
    Object.assign(this, init);
  }
}
