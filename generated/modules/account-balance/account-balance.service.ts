import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { AccountBalance } from './account-balance.model';

import { AccountBalanceWhereArgs, AccountBalanceWhereInput } from '../../warthog';

import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('AccountBalanceService')
export class AccountBalanceService extends HydraBaseService<AccountBalance> {
  @Inject('AccountService')
  public readonly accountService!: AccountService;

  constructor(@InjectRepository(AccountBalance) protected readonly repository: Repository<AccountBalance>) {
    super(AccountBalance, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<AccountBalance[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<AccountBalance[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<AccountBalance> {
    const where = <AccountBalanceWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { account } = where;
    delete where.account;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (account) {
      // OTO or MTO
      const accountQuery = this.accountService
        .buildFindQueryWithParams(<any>account, undefined, undefined, ['id'], 'account')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"accountbalance"."account_id" IN (${accountQuery.getQuery()})`);

      parameters = { ...parameters, ...accountQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
