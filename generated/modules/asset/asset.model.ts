import { BaseModel, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import { HistoricalAssetPrice } from '../historical-asset-price/historical-asset-price.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Asset extends BaseModel {
  @StringField({})
  assetId!: string;

  @JSONField({ filter: true, gqlFieldType: jsonTypes.Price, nullable: true })
  price?: jsonTypes.Price;

  @OneToMany(() => HistoricalAssetPrice, (param: HistoricalAssetPrice) => param.asset, {
    nullable: true,
    modelName: 'Asset',
    relModelName: 'HistoricalAssetPrice',
    propertyName: 'historicalAssetPrice',
  })
  historicalAssetPrice?: HistoricalAssetPrice[];

  constructor(init?: Partial<Asset>) {
    super();
    Object.assign(this, init);
  }
}
