import { BaseModel, IntField, Model, StringField, JSONField } from '@subsquid/warthog';

import { Column } from 'typeorm';
import { Field } from 'type-graphql';
import { WarthogField } from '@subsquid/warthog';

import { MarketType } from '../variants/variants.model';
import { MarketPeriod } from '../variants/variants.model';
import { MarketDisputeMechanism } from '../variants/variants.model';

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

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketType, {})
  marketType!: typeof MarketType;

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketPeriod, {})
  period!: typeof MarketPeriod;

  @StringField({})
  status!: string;

  @StringField({
    nullable: true,
  })
  report?: string;

  @StringField({
    nullable: true,
  })
  resolvedOutcome?: string;

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketDisputeMechanism, {})
  mdm!: typeof MarketDisputeMechanism;

  @IntField({})
  block!: number;

  constructor(init?: Partial<Market>) {
    super();
    Object.assign(this, init);
  }
}
