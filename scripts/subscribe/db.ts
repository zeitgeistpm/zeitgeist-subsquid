import Nedb from 'nedb-promises';
import { MarketStatus } from '../../src/model';

export default class Db {
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
