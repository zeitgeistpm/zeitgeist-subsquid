import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { HistoricalAssetPrice } from './historical-asset-price.model';

import { HistoricalAssetPriceWhereArgs, HistoricalAssetPriceWhereInput } from '../../warthog';

import { Asset } from '../asset/asset.model';
import { AssetService } from '../asset/asset.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('HistoricalAssetPriceService')
export class HistoricalAssetPriceService extends HydraBaseService<HistoricalAssetPrice> {
  @Inject('AssetService')
  public readonly assetService!: AssetService;

  constructor(@InjectRepository(HistoricalAssetPrice) protected readonly repository: Repository<HistoricalAssetPrice>) {
    super(HistoricalAssetPrice, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<HistoricalAssetPrice[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<HistoricalAssetPrice[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<HistoricalAssetPrice> {
    const where = <HistoricalAssetPriceWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { asset } = where;
    delete where.asset;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (asset) {
      // OTO or MTO
      const assetQuery = this.assetService
        .buildFindQueryWithParams(<any>asset, undefined, undefined, ['id'], 'asset')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"historicalassetprice"."asset_id" IN (${assetQuery.getQuery()})`);

      parameters = { ...parameters, ...assetQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
