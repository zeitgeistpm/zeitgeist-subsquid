import Nedb from 'nedb-promises';
import { MarketStatus } from '../../src/model';

export class Db {
  private store: Nedb;

  constructor(dbPath: string) {
    this.store = Nedb.create(dbPath);
  }

  async saveOrUpdateMarket(marketId: number, status: MarketStatus): Promise<boolean> {
    const doc = await this.store.findOne({ marketId });
    if (!doc) {
      return !!(await this.store.insert({ marketId, status }));
    } else {
      return !!(await this.store.update({ marketId }, { $set: { status } }));
    }
  }

  async getMarketWithId(marketId: number): Promise<{ marketId: number; status: MarketStatus } | null> {
    return await this.store.findOne({ marketId });
  }
}

export class DisburseDb {
  private store: Nedb;

  constructor(dbPath: string) {
    this.store = Nedb.create(dbPath);
  }

  async saveAccount(accountId: string, timestamp: string, amount: number): Promise<boolean> {
    console.log(`Saving ${accountId} with Timestamp:${timestamp} & Amount:${amount}`);
    return !!(await this.store.insert({ accountId, timestamp, amount }));
  }

  async getAccountWithId(accountId: string): Promise<{ accountId: string; timestamp: string; amount: number } | null> {
    return await this.store.findOne({ accountId });
  }

  async getTotalAmount(searchString: string): Promise<number> {
    const searchExp = new RegExp(searchString);
    const res = await this.store.find({ timestamp: searchExp }, { amount: 1, _id: 0 });
    const amounts = res as unknown as [{ amount: number }];
    const total = amounts.reduce((accumulator, obj) => {
      return accumulator + obj.amount;
    }, 0);
    return total / 10 ** 10;
  }
}
