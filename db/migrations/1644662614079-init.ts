import {MigrationInterface, QueryRunner} from "typeorm";

export class init1644662614079 implements MigrationInterface {
    name = 'init1644662614079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "wallet" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account_balance" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "account_id" character varying NOT NULL, "asset_id" character varying NOT NULL, "balance" numeric NOT NULL, CONSTRAINT "PK_bd893045760f719e24a95a42562" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "asset_id" character varying NOT NULL, "pool_id" integer, "price" double precision, "qty" numeric, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "historical_account_balance" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "account_id" character varying NOT NULL, "event" character varying NOT NULL, "asset_id" character varying NOT NULL, "amount" numeric NOT NULL, "balance" numeric NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_bfc701998dd9e45981c88f4d1af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "historical_asset" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "asset_id" character varying NOT NULL, "d_price" double precision NOT NULL, "d_qty" numeric NOT NULL, "price" double precision NOT NULL, "qty" numeric NOT NULL, "event" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_24bfbff0fb73bae4960d7301293" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "historical_pool" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "pool_id" integer NOT NULL, "event" character varying NOT NULL, "ztg_qty" numeric NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_6ee31afe7b6dc3500a94effc951" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "market" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "market_id" integer NOT NULL, "creator" character varying NOT NULL, "creation" character varying NOT NULL, "creator_fee" integer, "oracle" character varying NOT NULL, "outcome_assets" text array NOT NULL, "slug" character varying, "question" character varying, "description" character varying, "categories" jsonb, "tags" text array, "img" character varying, "market_type" jsonb NOT NULL, "period" jsonb NOT NULL, "end" numeric NOT NULL, "scoring_rule" character varying NOT NULL, "status" character varying NOT NULL, "pool_id" integer, "report" jsonb, "resolved_outcome" character varying, "mdm" jsonb NOT NULL, "market_history" jsonb, CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "pool_id" integer NOT NULL, "account_id" character varying, "base_asset" character varying NOT NULL, "market_id" integer NOT NULL, "pool_status" character varying NOT NULL, "scoring_rule" character varying NOT NULL, "swap_fee" character varying NOT NULL, "total_subsidy" character varying NOT NULL, "total_weight" character varying NOT NULL, "weights" jsonb NOT NULL, "ztg_qty" numeric NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "account_balance" ADD CONSTRAINT "FK_029576f147e256f1f93e4865c76" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account_balance" DROP CONSTRAINT "FK_029576f147e256f1f93e4865c76"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "market"`);
        await queryRunner.query(`DROP TABLE "historical_pool"`);
        await queryRunner.query(`DROP TABLE "historical_asset"`);
        await queryRunner.query(`DROP TABLE "historical_account_balance"`);
        await queryRunner.query(`DROP TABLE "asset"`);
        await queryRunner.query(`DROP TABLE "account_balance"`);
        await queryRunner.query(`DROP TABLE "account"`);
    }

}
