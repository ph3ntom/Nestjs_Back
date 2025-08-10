import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageReputationToUser1754649968401 implements MigrationInterface {
    name = 'AddImageReputationToUser1754649968401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const imageColumnExists = await queryRunner.hasColumn('users', 'image');
        const reputationColumnExists = await queryRunner.hasColumn('users', 'reputation');
        
        if (!imageColumnExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`image\` varchar(255) NULL`);
        }
        
        if (!reputationColumnExists) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`reputation\` int NOT NULL DEFAULT '0'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`reputation\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`image\``);
    }

}
