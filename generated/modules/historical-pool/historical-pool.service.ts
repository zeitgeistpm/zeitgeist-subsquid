import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { HistoricalPool } from './historical-pool.model';

import { HistoricalPoolWhereArgs, HistoricalPoolWhereInput } from '../../warthog';

import { Pool } from '../pool/pool.model';
import { PoolService } from '../pool/pool.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('HistoricalPoolService')
export class HistoricalPoolService extends HydraBaseService<HistoricalPool> {
  @Inject('PoolService')
  public readonly poolService!: PoolService;

  constructor(@InjectRepository(HistoricalPool) protected readonly repository: Repository<HistoricalPool>) {
    super(HistoricalPool, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<HistoricalPool[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<HistoricalPool[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<HistoricalPool> {
    const where = <HistoricalPoolWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { pool } = where;
    delete where.pool;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (pool) {
      // OTO or MTO
      const poolQuery = this.poolService
        .buildFindQueryWithParams(<any>pool, undefined, undefined, ['id'], 'pool')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"historicalpool"."pool_id" IN (${poolQuery.getQuery()})`);

      parameters = { ...parameters, ...poolQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
