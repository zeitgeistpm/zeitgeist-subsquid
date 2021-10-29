import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Market } from './market.model';

import { MarketWhereArgs, MarketWhereInput } from '../../warthog';

import { MarketData } from '../market-data/market-data.model';
import { MarketDataService } from '../market-data/market-data.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('MarketService')
export class MarketService extends HydraBaseService<Market> {
  @Inject('MarketDataService')
  public readonly marketDataService!: MarketDataService;

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
    const { marketData } = where;
    delete where.marketData;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (marketData) {
      // OTO or MTO
      const marketDataQuery = this.marketDataService
        .buildFindQueryWithParams(<any>marketData, undefined, undefined, ['id'], 'marketData')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"market"."market_data_id" IN (${marketDataQuery.getQuery()})`);

      parameters = { ...parameters, ...marketDataQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
