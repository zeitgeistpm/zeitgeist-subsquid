import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Account } from './account.model';

import { AccountWhereArgs, AccountWhereInput } from '../../warthog';

import { AccountBalance } from '../account-balance/account-balance.model';
import { AccountBalanceService } from '../account-balance/account-balance.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('AccountService')
export class AccountService extends HydraBaseService<Account> {
  @Inject('AccountBalanceService')
  public readonly accountBalancesService!: AccountBalanceService;

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

    const { accountBalances_some, accountBalances_none, accountBalances_every } = where;

    if (+!!accountBalances_some + +!!accountBalances_none + +!!accountBalances_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.accountBalances_some;
    delete where.accountBalances_none;
    delete where.accountBalances_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const accountBalancesFilter = accountBalances_some || accountBalances_none || accountBalances_every;

    if (accountBalancesFilter) {
      const accountBalancesQuery = this.accountBalancesService
        .buildFindQueryWithParams(<any>accountBalancesFilter, undefined, undefined, ['id'], 'accountBalances')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...accountBalancesQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'account.accountBalances',
          'accountBalances_filtered',
          `accountBalances_filtered.id IN (${accountBalancesQuery.getQuery()})`
        )
        .groupBy('account_id')
        .addSelect('count(accountBalances_filtered.id)', 'cnt_filtered')
        .addSelect('account.id', 'account_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('account.accountBalances', 'accountBalances_total')
        .groupBy('account_id')
        .addSelect('count(accountBalances_total.id)', 'cnt_total')
        .addSelect('account.id', 'account_id');

      const subQuery = `
                SELECT
                    f.account_id account_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.account_id = f.account_id`;

      if (accountBalances_none) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    accountBalances_subq.account_id
                FROM
                    (${subQuery}) accountBalances_subq
                WHERE
                    accountBalances_subq.cnt_filtered = 0
                )`);
      }

      if (accountBalances_some) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    accountBalances_subq.account_id
                FROM
                    (${subQuery}) accountBalances_subq
                WHERE
                    accountBalances_subq.cnt_filtered > 0
                )`);
      }

      if (accountBalances_every) {
        mainQuery = mainQuery.andWhere(`account.id IN
                (SELECT
                    accountBalances_subq.account_id
                FROM
                    (${subQuery}) accountBalances_subq
                WHERE
                    accountBalances_subq.cnt_filtered > 0
                    AND accountBalances_subq.cnt_filtered = accountBalances_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
