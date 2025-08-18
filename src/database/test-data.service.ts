import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Question } from '../question/entities/question.entity';
import { Answer } from '../question/entities/answer.entity';
import { UserRole } from '../auth/user.dto/user.dto';
import { questionTestData, answerTestData } from './question-test-data';

@Injectable()
export class TestDataService {
  private readonly logger = new Logger(TestDataService.name);

  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @InjectRepository(Question)
    public questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    public answerRepository: Repository<Answer>,
  ) {}

  /**
   * 테스트 데이터를 생성합니다.
   */
  async seedTestData(): Promise<void> {
    try {
      this.logger.log('Seeding test data...');

      // 기존 데이터 확인
      const existingUsers = await this.userRepository.count();
      if (existingUsers > 0) {
        this.logger.log(
          'Users already exist, only seeding questions if needed',
        );
        const existingQuestions = await this.questionRepository.count();
        if (existingQuestions === 0) {
          const users = await this.userRepository.find({ take: 3 });
          if (users.length >= 3) {
            await this.seedTestQuestions(users);
          }
        }
        return;
      }

      // 테스트 사용자 생성 (평문 비밀번호 사용)
      const testUsers = [
        {
          userId: 'admin',
          password: 'admin123!',
          name: '시스템 관리자',
          email: 'admin@example.com',
          phone: '010-0000-0000',
          role: UserRole.ADMIN,
        },
        {
          userId: 'testuser1',
          password: 'user123!',
          name: '테스트 사용자1',
          email: 'test1@example.com',
          phone: '010-1111-1111',
          role: UserRole.USER,
        },
        {
          userId: 'testuser2',
          password: 'user123!',
          name: '테스트 사용자2',
          email: 'test2@example.com',
          phone: '010-2222-2222',
          role: UserRole.USER,
        },
        {
          userId: 'testuser3',
          password: 'user123!',
          name: '테스트 사용자3',
          email: 'test3@example.com',
          phone: '010-3333-3333',
          role: UserRole.USER,
        },
        {
          userId: 'developer',
          password: 'dev123!',
          name: '개발자',
          email: 'dev@example.com',
          phone: '010-4444-4444',
          role: UserRole.USER,
        },
        {
          userId: 'tester',
          password: 'test123!',
          name: '테스터',
          email: 'tester@example.com',
          phone: '010-5555-5555',
          role: UserRole.USER,
        },
      ];

      // 사용자 일괄 생성
      const users = this.userRepository.create(testUsers);
      const savedUsers = await this.userRepository.save(users);

      this.logger
        .log(`Created ${testUsers.length} test users with plain text passwords:
        - admin: admin123!
        - testuser1,2,3: user123!
        - developer: dev123!
        - tester: test123!`);

      // 테스트 질문 생성 (답변도 함께 생성됨)
      await this.seedTestQuestions(savedUsers);

      this.logger.log('Test data seeding completed');
    } catch (error) {
      this.logger.error('Test data seeding failed', error);
      throw error;
    }
  }

  /**
   * 테스트 질문을 생성합니다.
   */
  private async seedTestQuestions(users: User[]): Promise<void> {
    try {
      // 기존 질문 데이터를 사용자와 매핑
      const mappedQuestions = questionTestData.map((question, index) => ({
        ...question,
        mbrId: users[index % users.length].mbrId,
      }));

      const questions = this.questionRepository.create(mappedQuestions);
      const savedQuestions = await this.questionRepository.save(questions);

      this.logger.log(`Created ${mappedQuestions.length} test questions`);

      // 질문 생성 후 답변 생성
      await this.seedAnswersForQuestions(savedQuestions, users);
    } catch (error) {
      this.logger.error('Test questions seeding failed', error);
      throw error;
    }
  }

  /**
   * 테스트 데이터를 삭제합니다.
   */
  async clearTestData(): Promise<void> {
    try {
      this.logger.log('Clearing test data...');

      // 모든 질문 삭제 (외래키 제약조건 때문에 사용자보다 먼저 삭제)
      await this.questionRepository.delete({});

      // 모든 사용자 삭제
      await this.userRepository.delete({});

      this.logger.log('Test data cleared successfully');
    } catch (error) {
      this.logger.error('Test data clearing failed', error);
      throw error;
    }
  }

  /**
   * 특정 사용자를 생성합니다.
   */
  async createTestUser(userData: Partial<User>): Promise<User> {
    try {
      const user = this.userRepository.create({
        ...userData,
        password: userData.password || 'defaultPassword123!',
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`Created test user: ${savedUser.userId}`);

      return savedUser;
    } catch (error) {
      this.logger.error('Test user creation failed', error);
      throw error;
    }
  }

  /**
   * 특정 질문들에 대한 답변을 생성합니다.
   */
  private async seedAnswersForQuestions(
    questions: Question[],
    users: User[],
  ): Promise<void> {
    try {
      this.logger.log('Seeding test answers for questions...');

      // 답변 데이터를 실제 질문 ID에 맞춰 매핑
      const mappedAnswers = answerTestData
        .map((answer) => ({
          ...answer,
          questionId: questions[answer.questionId - 1]?.id || 0,
          mbrId: users[(answer.mbrId - 1) % users.length].mbrId,
        }))
        .filter((answer) => answer.questionId > 0);

      if (mappedAnswers.length === 0) {
        this.logger.warn('No valid answers to create');
        return;
      }

      const answers = this.answerRepository.create(mappedAnswers);
      await this.answerRepository.save(answers);

      // 각 질문의 답변 수 업데이트
      for (const question of questions) {
        const answerCount = mappedAnswers.filter(
          (a) => a.questionId === question.id,
        ).length;
        if (answerCount > 0) {
          await this.questionRepository.update(question.id, {
            answers: answerCount,
          });
        }
      }

      this.logger.log(`Created ${mappedAnswers.length} test answers`);
    } catch (error) {
      this.logger.error('Test answers seeding failed', error);
      throw error;
    }
  }

  /**
   * 데이터베이스 상태를 확인합니다.
   */
  async getDatabaseStats(): Promise<{
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
  }> {
    try {
      const totalUsers = await this.userRepository.count();
      const adminUsers = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
      const regularUsers = await this.userRepository.count({
        where: { role: UserRole.USER },
      });

      return {
        totalUsers,
        adminUsers,
        regularUsers,
      };
    } catch (error) {
      this.logger.error('Database stats retrieval failed', error);
      throw error;
    }
  }
}
