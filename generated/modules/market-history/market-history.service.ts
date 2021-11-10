import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { MarketHistory } from './market-history.model';

import { MarketHistoryWhereArgs, MarketHistoryWhereInput } from '../../warthog';

import { Market } from '../market/market.model';
import { MarketService } from '../market/market.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('MarketHistoryService')
export class MarketHistoryService extends HydraBaseService<MarketHistory> {
  @Inject('MarketService')
  public readonly marketService!: MarketService;

  constructor(@InjectRepository(MarketHistory) protected readonly repository: Repository<MarketHistory>) {
    super(MarketHistory, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<MarketHistory[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<MarketHistory[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<MarketHistory> {
    const where = <MarketHistoryWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { market } = where;
    delete where.market;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (market) {
      // OTO or MTO
      const marketQuery = this.marketService
        .buildFindQueryWithParams(<any>market, undefined, undefined, ['id'], 'market')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"markethistory"."market_id" IN (${marketQuery.getQuery()})`);

      parameters = { ...parameters, ...marketQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
