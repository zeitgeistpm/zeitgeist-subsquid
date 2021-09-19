import {MigrationInterface, QueryRunner} from "typeorm";

export class init1632049266714 implements MigrationInterface {
    name = 'init1632049266714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "block_timestamp" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_e719c30f77b20297166590031f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categorical_market" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "oracle" character varying NOT NULL, "creation" character varying NOT NULL, "categories" numeric NOT NULL, "block" integer NOT NULL, CONSTRAINT "PK_8b9ab4f2e33df5dbebeaff7f813" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "market" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "market_id" integer NOT NULL, "creator" character varying NOT NULL, "creation" character varying NOT NULL, "oracle" character varying NOT NULL, "market_type" jsonb NOT NULL, "period" jsonb NOT NULL, "status" character varying NOT NULL, "report" character varying, "resolved_outcome" character varying, "mdm" jsonb NOT NULL, "block" integer NOT NULL, CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "scalar_market" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "oracle" character varying NOT NULL, "end" numeric NOT NULL, "creation" character varying NOT NULL, "outcome_range" numeric array NOT NULL, "block" integer NOT NULL, CONSTRAINT "PK_cb749bae9b4d318da1e02768a2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "from" bytea NOT NULL, "to" bytea NOT NULL, "value" numeric NOT NULL, "comment" character varying, "block" integer NOT NULL, "tip" numeric NOT NULL, "timestamp" numeric NOT NULL, "inserted_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transfer"`);
        await queryRunner.query(`DROP TABLE "scalar_market"`);
        await queryRunner.query(`DROP TABLE "market"`);
        await queryRunner.query(`DROP TABLE "categorical_market"`);
        await queryRunner.query(`DROP TABLE "block_timestamp"`);
    }

}
