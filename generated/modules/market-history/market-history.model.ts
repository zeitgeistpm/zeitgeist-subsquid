import {
  BaseModel,
  IntField,
  NumericField,
  Model,
  ManyToOne,
  EnumField,
  StringField,
  JSONField,
} from '@subsquid/warthog';

import BN from 'bn.js';

import { Market } from '../market/market.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

import { MarketEvent } from '../enums/enums';
export { MarketEvent };

@Model({ api: {} })
export class MarketHistory extends BaseModel {
  @ManyToOne(() => Market, (param: Market) => param.marketHistory, {
    skipGraphQLField: true,

    modelName: 'MarketHistory',
    relModelName: 'Market',
    propertyName: 'market',
  })
  market!: Market;

  @EnumField('MarketEvent', MarketEvent, {})
  event!: MarketEvent;

  @StringField({
    nullable: true,
  })
  status?: string;

  @StringField({
    nullable: true,
  })
  report?: string;

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

  constructor(init?: Partial<MarketHistory>) {
    super();
    Object.assign(this, init);
  }
}
