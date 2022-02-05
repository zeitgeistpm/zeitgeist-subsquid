import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Asset } from './asset.model';

import { AssetWhereArgs, AssetWhereInput } from '../../warthog';

import { HistoricalAssetPrice } from '../historical-asset-price/historical-asset-price.model';
import { HistoricalAssetPriceService } from '../historical-asset-price/historical-asset-price.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('AssetService')
export class AssetService extends HydraBaseService<Asset> {
  @Inject('HistoricalAssetPriceService')
  public readonly historicalAssetPriceService!: HistoricalAssetPriceService;

  constructor(@InjectRepository(Asset) protected readonly repository: Repository<Asset>) {
    super(Asset, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Asset[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Asset[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Asset> {
    const where = <AssetWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders

    const { historicalAssetPrice_some, historicalAssetPrice_none, historicalAssetPrice_every } = where;

    if (+!!historicalAssetPrice_some + +!!historicalAssetPrice_none + +!!historicalAssetPrice_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.historicalAssetPrice_some;
    delete where.historicalAssetPrice_none;
    delete where.historicalAssetPrice_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const historicalAssetPriceFilter =
      historicalAssetPrice_some || historicalAssetPrice_none || historicalAssetPrice_every;

    if (historicalAssetPriceFilter) {
      const historicalAssetPriceQuery = this.historicalAssetPriceService
        .buildFindQueryWithParams(<any>historicalAssetPriceFilter, undefined, undefined, ['id'], 'historicalAssetPrice')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...historicalAssetPriceQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'asset.historicalAssetPrice',
          'historicalAssetPrice_filtered',
          `historicalAssetPrice_filtered.id IN (${historicalAssetPriceQuery.getQuery()})`
        )
        .groupBy('asset_id')
        .addSelect('count(historicalAssetPrice_filtered.id)', 'cnt_filtered')
        .addSelect('asset.id', 'asset_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('asset.historicalAssetPrice', 'historicalAssetPrice_total')
        .groupBy('asset_id')
        .addSelect('count(historicalAssetPrice_total.id)', 'cnt_total')
        .addSelect('asset.id', 'asset_id');

      const subQuery = `
                SELECT
                    f.asset_id asset_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.asset_id = f.asset_id`;

      if (historicalAssetPrice_none) {
        mainQuery = mainQuery.andWhere(`asset.id IN
                (SELECT
                    historicalAssetPrice_subq.asset_id
                FROM
                    (${subQuery}) historicalAssetPrice_subq
                WHERE
                    historicalAssetPrice_subq.cnt_filtered = 0
                )`);
      }

      if (historicalAssetPrice_some) {
        mainQuery = mainQuery.andWhere(`asset.id IN
                (SELECT
                    historicalAssetPrice_subq.asset_id
                FROM
                    (${subQuery}) historicalAssetPrice_subq
                WHERE
                    historicalAssetPrice_subq.cnt_filtered > 0
                )`);
      }

      if (historicalAssetPrice_every) {
        mainQuery = mainQuery.andWhere(`asset.id IN
                (SELECT
                    historicalAssetPrice_subq.asset_id
                FROM
                    (${subQuery}) historicalAssetPrice_subq
                WHERE
                    historicalAssetPrice_subq.cnt_filtered > 0
                    AND historicalAssetPrice_subq.cnt_filtered = historicalAssetPrice_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
