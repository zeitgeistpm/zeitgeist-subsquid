import { BaseModel, IntField, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import { HistoricalPool } from '../historical-pool/historical-pool.model';

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

  @OneToMany(() => HistoricalPool, (param: HistoricalPool) => param.pool, {
    nullable: true,
    modelName: 'Pool',
    relModelName: 'HistoricalPool',
    propertyName: 'historicalPool',
  })
  historicalPool?: HistoricalPool[];

  constructor(init?: Partial<Pool>) {
    super();
    Object.assign(this, init);
  }
}
