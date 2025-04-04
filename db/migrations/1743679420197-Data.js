module.exports = class Data1743679420197 {
    name = 'Data1743679420197'

    async up(db) {
        await db.query(`CREATE TABLE "historical_token" ("id" character varying NOT NULL, "account_id" text NOT NULL, "amount" numeric NOT NULL, "asset_in" text array NOT NULL, "asset_out" text array NOT NULL, "block_number" integer NOT NULL, "market_id" integer NOT NULL, "event" character varying(13) NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_6181028c0ad8e105e36e6cdc802" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_8dd1f65ad82068bc08aaf301fa" ON "historical_token" ("account_id") `)
        await db.query(`CREATE INDEX "IDX_e017cc34a939c4011556b5dd7d" ON "historical_token" ("market_id") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "historical_token"`)
        await db.query(`DROP INDEX "public"."IDX_8dd1f65ad82068bc08aaf301fa"`)
        await db.query(`DROP INDEX "public"."IDX_e017cc34a939c4011556b5dd7d"`)
    }
}
