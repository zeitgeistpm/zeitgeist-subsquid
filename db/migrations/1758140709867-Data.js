module.exports = class Data1758140709867 {
    name = 'Data1758140709867'

    async up(db) {
        // Add columns with defaults for existing data
        await db.query(`ALTER TABLE "neo_pool" ADD COLUMN IF NOT EXISTS "market_ids" integer array`)
        await db.query(`ALTER TABLE "neo_pool" ADD COLUMN IF NOT EXISTS "is_multi_market" boolean NOT NULL DEFAULT FALSE`)
        await db.query(`ALTER TABLE "neo_pool" ADD COLUMN IF NOT EXISTS "volume" numeric NOT NULL DEFAULT 0`)

        // Update existing neo_pools to have proper market_ids array (single market pools)
        await db.query(`UPDATE "neo_pool" SET "market_ids" = ARRAY["market_id"] WHERE "market_ids" IS NULL`)

        // Add columns to other tables
        await db.query(`ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "market_ids" integer array`)
        await db.query(`ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "pool_id" integer`)
        await db.query(`ALTER TABLE "historical_asset" ADD COLUMN IF NOT EXISTS "market_ids" integer array`)
        await db.query(`ALTER TABLE "historical_asset" ADD COLUMN IF NOT EXISTS "pool_id" integer`)

        // Create indexes
        await db.query(`CREATE INDEX IF NOT EXISTS "IDX_388792c14a7fb126b68c596a8e" ON "neo_pool" ("is_multi_market") `)
        await db.query(`CREATE INDEX IF NOT EXISTS "IDX_cc1309673ee628967dca4798dc" ON "historical_asset" ("pool_id") `)
        await db.query(`CREATE INDEX IF NOT EXISTS "IDX_asset_pool_id" ON "asset" ("pool_id") `)
    }

    async down(db) {
        await db.query(`DROP INDEX IF EXISTS "public"."IDX_388792c14a7fb126b68c596a8e"`)
        await db.query(`DROP INDEX IF EXISTS "public"."IDX_cc1309673ee628967dca4798dc"`)
        await db.query(`DROP INDEX IF EXISTS "public"."IDX_asset_pool_id"`)
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN IF EXISTS "is_multi_market"`)
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN IF EXISTS "volume"`)
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN IF EXISTS "market_ids"`)
        await db.query(`ALTER TABLE "asset" DROP COLUMN IF EXISTS "market_ids"`)
        await db.query(`ALTER TABLE "asset" DROP COLUMN IF EXISTS "pool_id"`)
        await db.query(`ALTER TABLE "historical_asset" DROP COLUMN IF EXISTS "market_ids"`)
        await db.query(`ALTER TABLE "historical_asset" DROP COLUMN IF EXISTS "pool_id"`)
    }
}
