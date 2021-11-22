import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Account } from './account.model';

import { AccountWhereArgs, AccountWhereInput } from '../../warthog';

import { AssetBalance } from '../asset-balance/asset-balance.model';
import { AssetBalanceService } from '../asset-balance/asset-balance.service';
import { HistoricalAssetBalance } from '../historical-asset-balance/historical-asset-balance.model';
import { HistoricalAssetBalanceService } from '../historical-asset-balance/historical-asset-balance.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('AccountService')
export class AccountService extends HydraBaseService<Account> {
  @Inject('AssetBalanceService')
  public readonly assetBalancesService!: AssetBalanceService;
  @Inject('HistoricalAssetBalanceService')
  public readonly historicalAssetBalancesService!: HistoricalAssetBalanceService;

  constructor(@InjectRepository(Account) protected readonly repository: Repository<Account>) {
    super(Account, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Account[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Account[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Account> {
    const where = <AccountWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders

    const { assetBalances_some, assetBalances_none, assetBalances_every } = where;

    if (+!!assetBalances_some + +!!assetBalances_none + +!!assetBalances_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.assetBalances_some;
    delete where.assetBalances_none;
    delete where.assetBalances_every;
    // remove relation filters to enable warthog query builders

    const { historicalAssetBalances_some, historicalAssetBalances_none, historicalAssetBalances_every } = where;

    if (+!!historicalAssetBalances_some + +!!historicalAssetBalances_none + +!!historicalAssetBalances_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.historicalAssetBalances_some;
    delete where.historicalAssetBalances_none;
    delete where.historicalAssetBalances_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const assetBalancesFilter = assetBalances_some || assetBalances_none || assetBalances_every;

    if (assetBalancesFilter) {
      const assetBalancesQuery = this.assetBalancesService
        .buildFindQueryWithParams(<any>assetBalancesFilter, undefined, undefined, ['id'], 'assetBalances')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...assetBalancesQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'account.assetBalances',
          'assetBalances_filtered',
          `assetBalances_filtered.id IN (${assetBalancesQuery.getQuery()})`
        )
        .groupBy('account_id')
        .addSelect('count(assetBalances_filtered.id)', 'cnt_filtered')
        .addSelect('account.id', 'account_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('account.assetBalances', 'assetBalances_total')
        .groupBy('account_id')
        .addSelect('count(assetBalances_total.id)', 'cnt_total')
        .addSelect('account.id', 'account_id');

      const subQuery = `
                SELECT
                    f.account_id account_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.account_id = f.account_id`;

      if (assetBalances_none) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    assetBalances_subq.account_id
                FROM
                    (${subQuery}) assetBalances_subq
                WHERE
                    assetBalances_subq.cnt_filtered = 0
                )`);
      }

      if (assetBalances_some) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    assetBalances_subq.account_id
                FROM
                    (${subQuery}) assetBalances_subq
                WHERE
                    assetBalances_subq.cnt_filtered > 0
                )`);
      }

      if (assetBalances_every) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    assetBalances_subq.account_id
                FROM
                    (${subQuery}) assetBalances_subq
                WHERE
                    assetBalances_subq.cnt_filtered > 0
                    AND assetBalances_subq.cnt_filtered = assetBalances_subq.cnt_total
                )`);
      }
    }

    const historicalAssetBalancesFilter =
      historicalAssetBalances_some || historicalAssetBalances_none || historicalAssetBalances_every;

    if (historicalAssetBalancesFilter) {
      const historicalAssetBalancesQuery = this.historicalAssetBalancesService
        .buildFindQueryWithParams(
          <any>historicalAssetBalancesFilter,
          undefined,
          undefined,
          ['id'],
          'historicalAssetBalances'
        )
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...historicalAssetBalancesQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'account.historicalAssetBalances',
          'historicalAssetBalances_filtered',
          `historicalAssetBalances_filtered.id IN (${historicalAssetBalancesQuery.getQuery()})`
        )
        .groupBy('account_id')
        .addSelect('count(historicalAssetBalances_filtered.id)', 'cnt_filtered')
        .addSelect('account.id', 'account_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('account.historicalAssetBalances', 'historicalAssetBalances_total')
        .groupBy('account_id')
        .addSelect('count(historicalAssetBalances_total.id)', 'cnt_total')
        .addSelect('account.id', 'account_id');

      const subQuery = `
                SELECT
                    f.account_id account_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.account_id = f.account_id`;

      if (historicalAssetBalances_none) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    historicalAssetBalances_subq.account_id
                FROM
                    (${subQuery}) historicalAssetBalances_subq
                WHERE
                    historicalAssetBalances_subq.cnt_filtered = 0
                )`);
      }

      if (historicalAssetBalances_some) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    historicalAssetBalances_subq.account_id
                FROM
                    (${subQuery}) historicalAssetBalances_subq
                WHERE
                    historicalAssetBalances_subq.cnt_filtered > 0
                )`);
      }

      if (historicalAssetBalances_every) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    historicalAssetBalances_subq.account_id
                FROM
                    (${subQuery}) historicalAssetBalances_subq
                WHERE
                    historicalAssetBalances_subq.cnt_filtered > 0
                    AND historicalAssetBalances_subq.cnt_filtered = historicalAssetBalances_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
