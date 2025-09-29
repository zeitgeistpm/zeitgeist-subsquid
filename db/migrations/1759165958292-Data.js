module.exports = class Data1759165958292 {
    name = 'Data1759165958292'

    async up(db) {
        await db.query(`DROP INDEX "public"."IDX_asset_pool_id"`)
        // Remove problematic FK constraint if it exists (for databases created before this migration)
        await db.query(`ALTER TABLE "asset" DROP CONSTRAINT IF EXISTS "FK_55d87b88a0e01b25819b9d4d5aa"`)
        await db.query(`ALTER TABLE "neo_pool" ADD COLUMN "parent_collection_ids" text array`)
        await db.query(`ALTER TABLE "neo_pool" ALTER COLUMN "is_multi_market" DROP DEFAULT`)
        await db.query(`ALTER TABLE "neo_pool" ALTER COLUMN "volume" DROP DEFAULT`)
    }

    async down(db) {
        await db.query(`CREATE INDEX "IDX_asset_pool_id" ON "asset" ("pool_id") `)
        await db.query(`ALTER TABLE "neo_pool" ALTER COLUMN "is_multi_market" SET DEFAULT false`)
        await db.query(`ALTER TABLE "neo_pool" ALTER COLUMN "volume" SET DEFAULT '0'`)
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN "parent_collection_ids"`)
    }
}
