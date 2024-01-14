import { registerEnumType } from 'type-graphql';
import { BalanceInfoEvent, BaseAsset, OrderBy, TargetAsset, Unit, _Asset } from '../../consts';
import { AssetPriceResolver } from './assetPrice';
import { BalanceInfoResolver } from './balanceInfo';
import { MarketMetadataResolver } from './marketMetadata';
import { MarketStatsResolver } from './marketStats';
import { MarketStatsWithOrderResolver } from './marketStatsWithOrder';
import { PriceHistoryResolver } from './priceHistory';
import { StatsResolver } from './stats';
import { VolumeHistoryResolver } from './volumeHistory';

registerEnumType(_Asset, {
  name: 'AssetKind',
  description: 'Kind of asset',
});

registerEnumType(BalanceInfoEvent, {
  name: 'BalanceInfoEvent',
  description: 'Filtering balance based on event',
});

registerEnumType(BaseAsset, {
  name: 'BaseAsset',
});

registerEnumType(OrderBy, {
  name: 'OrderBy',
  description: 'Ordering stats',
});

registerEnumType(TargetAsset, {
  name: 'TargetAsset',
});

registerEnumType(Unit, {
  name: 'Unit',
  description: 'Unit for the interval',
});

export {
  AssetPriceResolver,
  BalanceInfoResolver,
  MarketMetadataResolver,
  MarketStatsResolver,
  MarketStatsWithOrderResolver,
  PriceHistoryResolver,
  StatsResolver,
  VolumeHistoryResolver,
};
