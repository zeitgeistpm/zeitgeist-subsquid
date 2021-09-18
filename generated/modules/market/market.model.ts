import { BaseModel, IntField, Model, StringField, JSONField } from '@subsquid/warthog';

import { Column } from 'typeorm';
import { Field } from 'type-graphql';
import { WarthogField } from '@subsquid/warthog';

import { MarketEnd } from '../variants/variants.model';
import { MarketType } from '../variants/variants.model';

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
  @Field((type) => MarketEnd, {})
  end!: typeof MarketEnd;

  @StringField({})
  metadata!: string;

  @Column('jsonb')
  @WarthogField('json')
  @Field((type) => MarketType, {})
  marketType!: typeof MarketType;

  @IntField({})
  block!: number;

  constructor(init?: Partial<Market>) {
    super();
    Object.assign(this, init);
  }
}
