module.exports = class Data1757105549470 {
    name = 'Data1757105549470'

    async up(db) {
        await db.query(`ALTER TABLE "neo_pool" ADD "market_ids" integer array`)
        await db.query(`UPDATE "neo_pool" SET "market_ids" = ARRAY["market_id"] WHERE "market_ids" IS NULL`)
        await db.query(`ALTER TABLE "neo_pool" ALTER COLUMN "market_ids" SET NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "neo_pool" DROP COLUMN "market_ids"`)
    }
}
