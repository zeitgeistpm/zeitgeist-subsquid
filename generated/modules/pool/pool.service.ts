import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Pool } from './pool.model';

import { PoolWhereArgs, PoolWhereInput } from '../../warthog';

import { HistoricalPool } from '../historical-pool/historical-pool.model';
import { HistoricalPoolService } from '../historical-pool/historical-pool.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('PoolService')
export class PoolService extends HydraBaseService<Pool> {
  @Inject('HistoricalPoolService')
  public readonly historicalPoolService!: HistoricalPoolService;

  constructor(@InjectRepository(Pool) protected readonly repository: Repository<Pool>) {
    super(Pool, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Pool[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Pool[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Pool> {
    const where = <PoolWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders

    const { historicalPool_some, historicalPool_none, historicalPool_every } = where;

    if (+!!historicalPool_some + +!!historicalPool_none + +!!historicalPool_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.historicalPool_some;
    delete where.historicalPool_none;
    delete where.historicalPool_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const historicalPoolFilter = historicalPool_some || historicalPool_none || historicalPool_every;

    if (historicalPoolFilter) {
      const historicalPoolQuery = this.historicalPoolService
        .buildFindQueryWithParams(<any>historicalPoolFilter, undefined, undefined, ['id'], 'historicalPool')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...historicalPoolQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'pool.historicalPool',
          'historicalPool_filtered',
          `historicalPool_filtered.id IN (${historicalPoolQuery.getQuery()})`
        )
        .groupBy('pool_id')
        .addSelect('count(historicalPool_filtered.id)', 'cnt_filtered')
        .addSelect('pool.id', 'pool_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('pool.historicalPool', 'historicalPool_total')
        .groupBy('pool_id')
        .addSelect('count(historicalPool_total.id)', 'cnt_total')
        .addSelect('pool.id', 'pool_id');

      const subQuery = `
                SELECT
                    f.pool_id pool_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.pool_id = f.pool_id`;

      if (historicalPool_none) {
        mainQuery = mainQuery.andWhere(`pool.id IN
                (SELECT
                    historicalPool_subq.pool_id
                FROM
                    (${subQuery}) historicalPool_subq
                WHERE
                    historicalPool_subq.cnt_filtered = 0
                )`);
      }

      if (historicalPool_some) {
        mainQuery = mainQuery.andWhere(`pool.id IN
                (SELECT
                    historicalPool_subq.pool_id
                FROM
                    (${subQuery}) historicalPool_subq
                WHERE
                    historicalPool_subq.cnt_filtered > 0
                )`);
      }

      if (historicalPool_every) {
        mainQuery = mainQuery.andWhere(`pool.id IN
                (SELECT
                    historicalPool_subq.pool_id
                FROM
                    (${subQuery}) historicalPool_subq
                WHERE
                    historicalPool_subq.cnt_filtered > 0
                    AND historicalPool_subq.cnt_filtered = historicalPool_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
