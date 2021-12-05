import { BaseModel, IntField, Model, OneToMany, CustomField, StringField, JSONField } from '@subsquid/warthog';

import { CategoryMetadata } from '../category-metadata/category-metadata.model';
import { MarketHistory } from '../market-history/market-history.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Market extends BaseModel {
  @IntField({})
  marketId!: number;

  @StringField({})
  creator!: string;

  @StringField({})
  creation!: string;

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

  @OneToMany(() => CategoryMetadata, (param: CategoryMetadata) => param.market, {
    nullable: true,
    modelName: 'Market',
    relModelName: 'CategoryMetadata',
    propertyName: 'categories',
  })
  categories?: CategoryMetadata[];

  @CustomField({
    db: { type: 'text', array: true, nullable: true },
    api: { type: 'string', nullable: true },
  })
  tags?: string[];

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketType })
  marketType!: jsonTypes.MarketType;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.MarketPeriod })
  period!: jsonTypes.MarketPeriod;

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

  @OneToMany(() => MarketHistory, (param: MarketHistory) => param.market, {
    nullable: true,
    modelName: 'Market',
    relModelName: 'MarketHistory',
    propertyName: 'marketHistory',
  })
  marketHistory?: MarketHistory[];

  constructor(init?: Partial<Market>) {
    super();
    Object.assign(this, init);
  }
}
