module.exports = class Data1666407659013 {
  name = 'Data1666407659013'

  async up(db) {
    await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "account_id" text NOT NULL, "market_id" integer, "pool_id" integer, "pvalue" numeric NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "account_balance" ("id" character varying NOT NULL, "asset_id" text NOT NULL, "balance" numeric NOT NULL, "value" numeric, "account_id" character varying, CONSTRAINT "PK_bd893045760f719e24a95a42562" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_029576f147e256f1f93e4865c7" ON "account_balance" ("account_id") `)
    await db.query(`CREATE TABLE "historical_account_balance" ("id" character varying NOT NULL, "account_id" text NOT NULL, "asset_id" text NOT NULL, "d_balance" numeric NOT NULL, "balance" numeric NOT NULL, "d_value" numeric, "value" numeric, "pvalue" numeric, "event" text NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_bfc701998dd9e45981c88f4d1af" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "asset" ("id" character varying NOT NULL, "asset_id" text NOT NULL, "pool_id" integer, "price" numeric, "amount_in_pool" numeric, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "historical_asset" ("id" character varying NOT NULL, "account_id" text, "ztg_traded" numeric, "asset_id" text NOT NULL, "d_price" numeric, "d_amount_in_pool" numeric, "new_price" numeric, "new_amount_in_pool" numeric, "event" text NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_24bfbff0fb73bae4960d7301293" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "market" ("id" character varying NOT NULL, "market_id" integer NOT NULL, "creator" text NOT NULL, "creation" text NOT NULL, "creator_fee" integer, "oracle" text NOT NULL, "outcome_assets" text array NOT NULL, "slug" text, "question" text, "description" text, "categories" jsonb, "scalar_type" text, "deadlines" jsonb NOT NULL, "tags" text array, "img" text, "metadata" text NOT NULL, "market_type" jsonb NOT NULL, "period" jsonb NOT NULL, "end" numeric NOT NULL, "scoring_rule" text NOT NULL, "status" text NOT NULL, "pool_id" integer, "report" jsonb, "resolved_outcome" text, "dispute_mechanism" jsonb NOT NULL, CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "historical_market" ("id" character varying NOT NULL, "market_id" integer NOT NULL, "pool_id" integer, "status" text, "report" jsonb, "resolved_outcome" text, "event" text NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8b5b3dfdac79a88102b94d55498" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "pool" ("id" character varying NOT NULL, "pool_id" integer NOT NULL, "account_id" text, "base_asset" text NOT NULL, "market_id" integer NOT NULL, "pool_status" text NOT NULL, "scoring_rule" text NOT NULL, "swap_fee" text NOT NULL, "total_subsidy" text NOT NULL, "total_weight" text NOT NULL, "weights" jsonb NOT NULL, "ztg_qty" numeric NOT NULL, "volume" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "historical_pool" ("id" character varying NOT NULL, "pool_id" integer NOT NULL, "pool_status" text, "ztg_qty" numeric, "volume" numeric, "event" text NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_6ee31afe7b6dc3500a94effc951" PRIMARY KEY ("id"))`)
    await db.query(`ALTER TABLE "account_balance" ADD CONSTRAINT "FK_029576f147e256f1f93e4865c76" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "account"`)
    await db.query(`DROP TABLE "account_balance"`)
    await db.query(`DROP INDEX "public"."IDX_029576f147e256f1f93e4865c7"`)
    await db.query(`DROP TABLE "historical_account_balance"`)
    await db.query(`DROP TABLE "asset"`)
    await db.query(`DROP TABLE "historical_asset"`)
    await db.query(`DROP TABLE "market"`)
    await db.query(`DROP TABLE "historical_market"`)
    await db.query(`DROP TABLE "pool"`)
    await db.query(`DROP TABLE "historical_pool"`)
    await db.query(`ALTER TABLE "account_balance" DROP CONSTRAINT "FK_029576f147e256f1f93e4865c76"`)
  }
}
