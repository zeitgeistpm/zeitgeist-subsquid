import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { HistoricalAssetPrice } from './historical-asset-price.model';

import { HistoricalAssetPriceWhereArgs, HistoricalAssetPriceWhereInput } from '../../warthog';

@Service('HistoricalAssetPriceService')
export class HistoricalAssetPriceService extends HydraBaseService<HistoricalAssetPrice> {
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

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
