import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuestionAnswerMbrIdColumns1755338541222
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 현재 외래키 제약조건을 안전하게 삭제하고 컬럼 변경
    try {
      // Question 테이블의 기존 외래키 삭제 (존재하는 경우만)
      const questionConstraints = await queryRunner.query(`
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'questions' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `);

      for (const constraint of questionConstraints) {
        await queryRunner.query(
          `ALTER TABLE questions DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\``,
        );
      }
    } catch (error) {
      console.log('No foreign key constraints found for questions.user_id');
    }

    // Question 테이블 컬럼 변경
    await queryRunner.query(
      `ALTER TABLE questions CHANGE COLUMN user_id mbr_id int NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE questions ADD CONSTRAINT \`FK_questions_mbr_id\` FOREIGN KEY (mbr_id) REFERENCES users(mbrId) ON DELETE CASCADE`,
    );

    try {
      // Answer 테이블의 기존 외래키 삭제 (존재하는 경우만)
      const answerConstraints = await queryRunner.query(`
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'answers' 
                AND COLUMN_NAME = 'user_id' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `);

      for (const constraint of answerConstraints) {
        await queryRunner.query(
          `ALTER TABLE answers DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\``,
        );
      }
    } catch (error) {
      console.log('No foreign key constraints found for answers.user_id');
    }

    // Answer 테이블 컬럼 변경
    await queryRunner.query(
      `ALTER TABLE answers CHANGE COLUMN user_id mbr_id int NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE answers ADD CONSTRAINT \`FK_answers_mbr_id\` FOREIGN KEY (mbr_id) REFERENCES users(mbrId) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Answer 테이블 롤백
    await queryRunner.query(
      `ALTER TABLE answers DROP FOREIGN KEY \`FK_answers_mbr_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE answers CHANGE COLUMN mbr_id user_id int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE answers ADD CONSTRAINT \`FK_32f81b0c0f9195d8e6f49c39c8d\` FOREIGN KEY (user_id) REFERENCES users(mbrId) ON DELETE CASCADE`,
    );

    // Question 테이블 롤백
    await queryRunner.query(
      `ALTER TABLE questions DROP FOREIGN KEY \`FK_questions_mbr_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE questions CHANGE COLUMN mbr_id user_id int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE questions ADD CONSTRAINT \`FK_32f81b0c0f9195d8e6f49c39c8c\` FOREIGN KEY (user_id) REFERENCES users(mbrId) ON DELETE CASCADE`,
    );
  }
}
