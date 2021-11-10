import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Market } from './market.model';

import { MarketWhereArgs, MarketWhereInput } from '../../warthog';

import { MarketHistory } from '../market-history/market-history.model';
import { MarketHistoryService } from '../market-history/market-history.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('MarketService')
export class MarketService extends HydraBaseService<Market> {
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

    const { marketHistory_some, marketHistory_none, marketHistory_every } = where;

    if (+!!marketHistory_some + +!!marketHistory_none + +!!marketHistory_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.marketHistory_some;
    delete where.marketHistory_none;
    delete where.marketHistory_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

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
