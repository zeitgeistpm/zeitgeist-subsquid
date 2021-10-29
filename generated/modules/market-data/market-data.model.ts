import { BaseModel, IntField, NumericField, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Column } from 'typeorm';
import { Field } from 'type-graphql';
import { WarthogField } from '@subsquid/warthog';

import { MarketPeriod } from '../variants/variants.model';
import { MarketDisputeMechanism } from '../variants/variants.model';

import { Market } from '../market/market.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class MarketData extends BaseModel {
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
  blockNumber!: number;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  timestamp!: BN;

  @OneToMany(() => Market, (param: Market) => param.marketData, {
    nullable: true,
    modelName: 'MarketData',
    relModelName: 'Market',
    propertyName: 'marketmarketData',
  })
  marketmarketData?: Market[];

  constructor(init?: Partial<MarketData>) {
    super();
    Object.assign(this, init);
  }
}
