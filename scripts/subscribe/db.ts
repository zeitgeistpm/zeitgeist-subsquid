import Nedb from 'nedb-promises';

export default class Db {
  private store: Nedb;

  constructor(dbPath: string) {
    this.store = Nedb.create(dbPath);
  }

  async saveOrUpdateMarket(marketId: number, proposed_at: number): Promise<boolean> {
    const doc = await this.store.findOne({ marketId });
    if (!doc) {
      return !!(await this.store.insert({ marketId, proposed_at }));
    } else {
      return !!(await this.store.update({ marketId }, { $set: { proposed_at } }));
    }
  }

  async getMarketWithId(marketId: number): Promise<{ marketId: number; proposed_at: number } | null> {
    return await this.store.findOne({ marketId });
  }
}
