import { BaseModel, Model, StringField, JSONField } from '@subsquid/warthog';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Asset extends BaseModel {
  @StringField({})
  assetId!: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.PoolInfo, nullable: true })
  poolInfo?: jsonTypes.PoolInfo;

  constructor(init?: Partial<Asset>) {
    super();
    Object.assign(this, init);
  }
}
