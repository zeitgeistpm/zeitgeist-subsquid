import { BaseModel, IntField, NumericField, Model, CustomField, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Market extends BaseModel {
  @IntField({})
  marketId!: number;

  @StringField({})
  creator!: string;

  @StringField({})
  creation!: string;

  @IntField({
    nullable: true,
  })
  creatorFee?: number;

  @StringField({})
  oracle!: string;

  @StringField({
    nullable: true,
  })
  slug?: string;

  @StringField({
    nullable: true,
  })
  question?: string;

  @StringField({
    nullable: true,
  })
  description?: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.CategoryMetadata, nullable: true })
  categories?: jsonTypes.CategoryMetadata[];

  @CustomField({
    db: { type: 'text', array: true, nullable: true },
    api: { type: 'string', nullable: true },
  })
  tags?: string[];

  @StringField({
    nullable: true,
  })
  img?: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketType })
  marketType!: jsonTypes.MarketType;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketPeriod })
  period!: jsonTypes.MarketPeriod;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  end!: BN;

  @StringField({})
  scoringRule!: string;

  @StringField({})
  status!: string;

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

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketDisputeMechanism })
  mdm!: jsonTypes.MarketDisputeMechanism;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketHistory, nullable: true })
  marketHistory?: jsonTypes.MarketHistory[];

  constructor(init?: Partial<Market>) {
    super();
    Object.assign(this, init);
  }
}
