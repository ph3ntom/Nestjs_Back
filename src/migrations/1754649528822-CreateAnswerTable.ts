import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnswerTable1754649528822 implements MigrationInterface {
  name = 'CreateAnswerTable1754649528822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`answers\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`content\` text NOT NULL,
                \`votes\` int NOT NULL DEFAULT '0',
                \`accepted\` tinyint NOT NULL DEFAULT 0,
                \`question_id\` int NOT NULL,
                \`user_id\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_answers_question\` (\`question_id\`),
                KEY \`FK_answers_user\` (\`user_id\`),
                CONSTRAINT \`FK_answers_question\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\` (\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_answers_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`mbrId\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`answers\``);
  }
}
