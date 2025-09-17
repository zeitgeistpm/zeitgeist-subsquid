module.exports = class Data1758140709867 {
    name = 'Data1758140709867'

    async up(db) {
        await db.query(`ALTER TABLE "neo_pool" ADD "is_multi_market" boolean NOT NULL`)
        await db.query(`ALTER TABLE "neo_pool" ADD "volume" numeric NOT NULL`)
        await db.query(`ALTER TABLE "asset" ADD "market_ids" integer array`)
        await db.query(`ALTER TABLE "historical_asset" ADD "market_ids" integer array`)
        await db.query(`ALTER TABLE "historical_asset" ADD "pool_id" integer`)
        await db.query(`CREATE INDEX "IDX_388792c14a7fb126b68c596a8e" ON "neo_pool" ("is_multi_market") `)
        await db.query(`CREATE INDEX "IDX_cc1309673ee628967dca4798dc" ON "historical_asset" ("pool_id") `)
    }

    async down(db) {
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN "is_multi_market"`)
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN "volume"`)
        await db.query(`ALTER TABLE "asset" DROP COLUMN "market_ids"`)
        await db.query(`ALTER TABLE "historical_asset" DROP COLUMN "market_ids"`)
        await db.query(`ALTER TABLE "historical_asset" DROP COLUMN "pool_id"`)
        await db.query(`DROP INDEX "public"."IDX_388792c14a7fb126b68c596a8e"`)
        await db.query(`DROP INDEX "public"."IDX_cc1309673ee628967dca4798dc"`)
    }
}
