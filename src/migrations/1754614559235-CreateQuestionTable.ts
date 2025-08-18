import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestionTable1754614559235 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT NOT NULL,
                votes INT NOT NULL DEFAULT 0,
                answers INT NOT NULL DEFAULT 0,
                views INT NOT NULL DEFAULT 0,
                tags JSON,
                user_id INT NOT NULL,
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX IDX_questions_user_id (user_id),
                INDEX IDX_questions_created_at (createdAt),
                CONSTRAINT FK_questions_user_id FOREIGN KEY (user_id) REFERENCES users(mbrId) ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE questions`);
  }
}
