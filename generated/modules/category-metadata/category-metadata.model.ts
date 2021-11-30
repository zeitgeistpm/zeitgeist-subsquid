import { BaseModel, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import { Market } from '../market/market.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class CategoryMetadata extends BaseModel {
  @ManyToOne(() => Market, (param: Market) => param.categories, {
    skipGraphQLField: true,

    modelName: 'CategoryMetadata',
    relModelName: 'Market',
    propertyName: 'market',
  })
  market!: Market;

  @StringField({})
  name!: string;

  @StringField({
    nullable: true,
  })
  ticker?: string;

  @StringField({
    nullable: true,
  })
  img?: string;

  @StringField({
    nullable: true,
  })
  color?: string;

  constructor(init?: Partial<CategoryMetadata>) {
    super();
    Object.assign(this, init);
  }
}
