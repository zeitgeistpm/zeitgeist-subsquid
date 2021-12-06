import {MigrationInterface, QueryRunner} from "typeorm";

export class init1638795219207 implements MigrationInterface {
    name = 'init1638795219207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "asset_balance" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "account_id" character varying NOT NULL, "asset_id" character varying NOT NULL, "balance" numeric NOT NULL, CONSTRAINT "PK_7ffc793d0d7d680c10e4741f173" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "historical_asset_balance" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "account_id" character varying NOT NULL, "event" character varying NOT NULL, "asset_id" character varying NOT NULL, "amount" numeric NOT NULL, "balance" numeric NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_b5aba392a49c81c54c23d837ac9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "wallet" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "pool_id" integer NOT NULL, "base_asset" character varying NOT NULL, "market_id" integer NOT NULL, "pool_status" character varying NOT NULL, "scoring_rule" character varying NOT NULL, "swap_fee" character varying NOT NULL, "total_subsidy" character varying NOT NULL, "total_weight" character varying NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "historical_pool" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "pool_id" character varying NOT NULL, "event" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_6ee31afe7b6dc3500a94effc951" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "market" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "market_id" integer NOT NULL, "creator" character varying NOT NULL, "creation" character varying NOT NULL, "creator_fee" integer, "oracle" character varying NOT NULL, "slug" character varying, "question" character varying, "description" character varying, "categories" jsonb, "tags" text array, "img" character varying, "market_type" jsonb NOT NULL, "period" jsonb NOT NULL, "scoring_rule" character varying NOT NULL, "status" character varying NOT NULL, "report" jsonb, "resolved_outcome" character varying, "mdm" jsonb NOT NULL, "outcome_assets" text array, "market_history" jsonb, CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "asset_balance" ADD CONSTRAINT "FK_55a3340913f4ffe21ffaa0e0510" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historical_asset_balance" ADD CONSTRAINT "FK_e6dbc274155cda8822d49bf7341" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historical_pool" ADD CONSTRAINT "FK_ece5ebe700d56362810f33888f4" FOREIGN KEY ("pool_id") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "historical_pool" DROP CONSTRAINT "FK_ece5ebe700d56362810f33888f4"`);
        await queryRunner.query(`ALTER TABLE "historical_asset_balance" DROP CONSTRAINT "FK_e6dbc274155cda8822d49bf7341"`);
        await queryRunner.query(`ALTER TABLE "asset_balance" DROP CONSTRAINT "FK_55a3340913f4ffe21ffaa0e0510"`);
        await queryRunner.query(`DROP TABLE "market"`);
        await queryRunner.query(`DROP TABLE "historical_pool"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "historical_asset_balance"`);
        await queryRunner.query(`DROP TABLE "asset_balance"`);
    }

}
