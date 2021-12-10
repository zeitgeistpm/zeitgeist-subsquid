import { BaseModel, IntField, Model, CustomField, StringField, JSONField } from '@subsquid/warthog';

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

  @StringField({})
  end!: string;

  @StringField({})
  scoringRule!: string;

  @StringField({})
  status!: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketReport, nullable: true })
  report?: jsonTypes.MarketReport;

  @StringField({
    nullable: true,
  })
  resolvedOutcome?: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketDisputeMechanism })
  mdm!: jsonTypes.MarketDisputeMechanism;

  @CustomField({
    db: { type: 'text', array: true, nullable: true },
    api: { type: 'string', nullable: true },
  })
  outcomeAssets?: string[];

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketHistory, nullable: true })
  marketHistory?: jsonTypes.MarketHistory[];

  constructor(init?: Partial<Market>) {
    super();
    Object.assign(this, init);
  }
}
