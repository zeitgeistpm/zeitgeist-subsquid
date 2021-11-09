import { BaseModel, IntField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import { Column } from 'typeorm';
import { Field } from 'type-graphql';
import { WarthogField } from '@subsquid/warthog';

import { MarketType } from '../variants/variants.model';

import { MarketData } from '../market-data/market-data.model';

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

  @ManyToOne(() => MarketData, (param: MarketData) => param.marketmarketData, {
    skipGraphQLField: true,

    modelName: 'Market',
    relModelName: 'MarketData',
    propertyName: 'marketData',
  })
  marketData!: MarketData;

  constructor(init?: Partial<Market>) {
    super();
    Object.assign(this, init);
  }
}
