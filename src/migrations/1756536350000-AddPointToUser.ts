import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPointToUser1756536350000 implements MigrationInterface {
    name = 'AddPointToUser1756536350000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`point\` int NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`point\``);
    }
}