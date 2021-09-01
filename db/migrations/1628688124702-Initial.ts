import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1628688124702 implements MigrationInterface {
    name = 'Initial1628688124702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "historical_balance" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "account_id" character varying NOT NULL, "balance" numeric NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_74ac29ad0bdffb6d1281a1e17e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "wallet" character varying NOT NULL, "balance" numeric NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "historical_balance" ADD CONSTRAINT "FK_383ff006e4b59db91d32cb891e9" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "historical_balance" DROP CONSTRAINT "FK_383ff006e4b59db91d32cb891e9"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "historical_balance"`);
    }

}
