import { registerEnumType } from 'type-graphql';
import { BalanceInfoEvent, BaseAsset, OrderBy, TargetAsset, Unit, _Asset } from '../../consts';
import { AssetPriceResolver } from './assetPrice';
import { BalanceInfoResolver } from './balanceInfo';
import { IssuanceHistoryResolver } from './issuanceHistory';
import { LiquidityHistoryResolver } from './liquidityHistory';
import { MarketMetadataResolver } from './marketMetadata';
import { MarketStatsResolver } from './marketStats';
import { MarketStatsWithOrderResolver } from './marketStatsWithOrder';
import { PoolStatsResolver } from './poolStats';
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
  IssuanceHistoryResolver,
  LiquidityHistoryResolver,
  MarketMetadataResolver,
  MarketStatsResolver,
  MarketStatsWithOrderResolver,
  PoolStatsResolver,
  PriceHistoryResolver,
  StatsResolver,
  VolumeHistoryResolver,
};
