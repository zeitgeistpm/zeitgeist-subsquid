import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { MarketData } from './market-data.model';

import { MarketDataWhereArgs, MarketDataWhereInput } from '../../warthog';

import { Market } from '../market/market.model';
import { MarketService } from '../market/market.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('MarketDataService')
export class MarketDataService extends HydraBaseService<MarketData> {
  @Inject('MarketService')
  public readonly marketmarketDataService!: MarketService;

  constructor(@InjectRepository(MarketData) protected readonly repository: Repository<MarketData>) {
    super(MarketData, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<MarketData[]> {
    let records = await this.findWithRelations<W>(where, orderBy, limit, offset, fields);
    if (records.length) {
    }
    return records;
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<MarketData[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<MarketData> {
    const where = <MarketDataWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders

    const { marketmarketData_some, marketmarketData_none, marketmarketData_every } = where;

    if (+!!marketmarketData_some + +!!marketmarketData_none + +!!marketmarketData_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.marketmarketData_some;
    delete where.marketmarketData_none;
    delete where.marketmarketData_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const marketmarketDataFilter = marketmarketData_some || marketmarketData_none || marketmarketData_every;

    if (marketmarketDataFilter) {
      const marketmarketDataQuery = this.marketmarketDataService
        .buildFindQueryWithParams(<any>marketmarketDataFilter, undefined, undefined, ['id'], 'marketmarketData')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...marketmarketDataQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'marketdata.marketmarketData',
          'marketmarketData_filtered',
          `marketmarketData_filtered.id IN (${marketmarketDataQuery.getQuery()})`
        )
        .groupBy('marketdata_id')
        .addSelect('count(marketmarketData_filtered.id)', 'cnt_filtered')
        .addSelect('marketdata.id', 'marketdata_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('marketdata.marketmarketData', 'marketmarketData_total')
        .groupBy('marketdata_id')
        .addSelect('count(marketmarketData_total.id)', 'cnt_total')
        .addSelect('marketdata.id', 'marketdata_id');

      const subQuery = `
                SELECT
                    f.marketdata_id marketdata_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.marketdata_id = f.marketdata_id`;

      if (marketmarketData_none) {
        mainQuery = mainQuery.andWhere(`marketdata.id IN
                (SELECT
                    marketmarketData_subq.marketdata_id
                FROM
                    (${subQuery}) marketmarketData_subq
                WHERE
                    marketmarketData_subq.cnt_filtered = 0
                )`);
      }

      if (marketmarketData_some) {
        mainQuery = mainQuery.andWhere(`marketdata.id IN
                (SELECT
                    marketmarketData_subq.marketdata_id
                FROM
                    (${subQuery}) marketmarketData_subq
                WHERE
                    marketmarketData_subq.cnt_filtered > 0
                )`);
      }

      if (marketmarketData_every) {
        mainQuery = mainQuery.andWhere(`marketdata.id IN
                (SELECT
                    marketmarketData_subq.marketdata_id
                FROM
                    (${subQuery}) marketmarketData_subq
                WHERE
                    marketmarketData_subq.cnt_filtered > 0
                    AND marketmarketData_subq.cnt_filtered = marketmarketData_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
