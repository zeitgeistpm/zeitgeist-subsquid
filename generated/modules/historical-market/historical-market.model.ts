import { BaseModel, IntField, NumericField, Model, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class HistoricalMarket extends BaseModel {
  @IntField({})
  marketId!: number;

  @StringField({})
  event!: string;

  @StringField({
    nullable: true,
  })
  status?: string;

  @IntField({
    nullable: true,
  })
  poolId?: number;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketReport, nullable: true })
  report?: jsonTypes.MarketReport;

  @StringField({
    nullable: true,
  })
  resolvedOutcome?: string;

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

  constructor(init?: Partial<HistoricalMarket>) {
    super();
    Object.assign(this, init);
  }
}
