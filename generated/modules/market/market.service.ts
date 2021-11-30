import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Market } from './market.model';

import { MarketWhereArgs, MarketWhereInput } from '../../warthog';

import { CategoryMetadata } from '../category-metadata/category-metadata.model';
import { CategoryMetadataService } from '../category-metadata/category-metadata.service';
import { MarketHistory } from '../market-history/market-history.model';
import { MarketHistoryService } from '../market-history/market-history.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('MarketService')
export class MarketService extends HydraBaseService<Market> {
  @Inject('CategoryMetadataService')
  public readonly categoriesService!: CategoryMetadataService;
  @Inject('MarketHistoryService')
  public readonly marketHistoryService!: MarketHistoryService;

  constructor(@InjectRepository(Market) protected readonly repository: Repository<Market>) {
    super(Market, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Market[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Market[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Market> {
    const where = <MarketWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders

    const { categories_some, categories_none, categories_every } = where;

    if (+!!categories_some + +!!categories_none + +!!categories_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.categories_some;
    delete where.categories_none;
    delete where.categories_every;
    // remove relation filters to enable warthog query builders

    const { marketHistory_some, marketHistory_none, marketHistory_every } = where;

    if (+!!marketHistory_some + +!!marketHistory_none + +!!marketHistory_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.marketHistory_some;
    delete where.marketHistory_none;
    delete where.marketHistory_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const categoriesFilter = categories_some || categories_none || categories_every;

    if (categoriesFilter) {
      const categoriesQuery = this.categoriesService
        .buildFindQueryWithParams(<any>categoriesFilter, undefined, undefined, ['id'], 'categories')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...categoriesQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'market.categories',
          'categories_filtered',
          `categories_filtered.id IN (${categoriesQuery.getQuery()})`
        )
        .groupBy('market_id')
        .addSelect('count(categories_filtered.id)', 'cnt_filtered')
        .addSelect('market.id', 'market_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('market.categories', 'categories_total')
        .groupBy('market_id')
        .addSelect('count(categories_total.id)', 'cnt_total')
        .addSelect('market.id', 'market_id');

      const subQuery = `
                SELECT
                    f.market_id market_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.market_id = f.market_id`;

      if (categories_none) {
        mainQuery = mainQuery.andWhere(`market.id IN
                (SELECT
                    categories_subq.market_id
                FROM
                    (${subQuery}) categories_subq
                WHERE
                    categories_subq.cnt_filtered = 0
                )`);
      }

      if (categories_some) {
        mainQuery = mainQuery.andWhere(`market.id IN
                (SELECT
                    categories_subq.market_id
                FROM
                    (${subQuery}) categories_subq
                WHERE
                    categories_subq.cnt_filtered > 0
                )`);
      }

      if (categories_every) {
        mainQuery = mainQuery.andWhere(`market.id IN
                (SELECT
                    categories_subq.market_id
                FROM
                    (${subQuery}) categories_subq
                WHERE
                    categories_subq.cnt_filtered > 0
                    AND categories_subq.cnt_filtered = categories_subq.cnt_total
                )`);
      }
    }

    const marketHistoryFilter = marketHistory_some || marketHistory_none || marketHistory_every;

    if (marketHistoryFilter) {
      const marketHistoryQuery = this.marketHistoryService
        .buildFindQueryWithParams(<any>marketHistoryFilter, undefined, undefined, ['id'], 'marketHistory')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...marketHistoryQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'market.marketHistory',
          'marketHistory_filtered',
          `marketHistory_filtered.id IN (${marketHistoryQuery.getQuery()})`
        )
        .groupBy('market_id')
        .addSelect('count(marketHistory_filtered.id)', 'cnt_filtered')
        .addSelect('market.id', 'market_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('market.marketHistory', 'marketHistory_total')
        .groupBy('market_id')
        .addSelect('count(marketHistory_total.id)', 'cnt_total')
        .addSelect('market.id', 'market_id');

      const subQuery = `
                SELECT
                    f.market_id market_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.market_id = f.market_id`;

      if (marketHistory_none) {
        mainQuery = mainQuery.andWhere(`market.id IN
                (SELECT
                    marketHistory_subq.market_id
                FROM
                    (${subQuery}) marketHistory_subq
                WHERE
                    marketHistory_subq.cnt_filtered = 0
                )`);
      }

      if (marketHistory_some) {
        mainQuery = mainQuery.andWhere(`market.id IN
                (SELECT
                    marketHistory_subq.market_id
                FROM
                    (${subQuery}) marketHistory_subq
                WHERE
                    marketHistory_subq.cnt_filtered > 0
                )`);
      }

      if (marketHistory_every) {
        mainQuery = mainQuery.andWhere(`market.id IN
                (SELECT
                    marketHistory_subq.market_id
                FROM
                    (${subQuery}) marketHistory_subq
                WHERE
                    marketHistory_subq.cnt_filtered > 0
                    AND marketHistory_subq.cnt_filtered = marketHistory_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
