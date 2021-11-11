import { BaseModel, IntField, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import { Column } from 'typeorm';
import { Field } from 'type-graphql';
import { WarthogField } from '@subsquid/warthog';

import { MarketType } from '../variants/variants.model';
import { MarketPeriod } from '../variants/variants.model';
import { MarketDisputeMechanism } from '../variants/variants.model';

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

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketType, {})
  marketType!: typeof MarketType;

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketPeriod, {})
  period!: typeof MarketPeriod;

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

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketDisputeMechanism, {})
  mdm!: typeof MarketDisputeMechanism;

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
