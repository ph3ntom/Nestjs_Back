import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Question } from '../question/entities/question.entity';
import { Answer } from '../question/entities/answer.entity';
import { UserRole } from '../auth/user.dto/user.dto';

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
        this.logger.log('Users already exist, only seeding questions if needed');
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

      this.logger.log(`Created ${testUsers.length} test users with plain text passwords:
        - admin: admin123!
        - testuser1,2,3: user123!
        - developer: dev123!
        - tester: test123!`);

      // 테스트 질문 생성
      await this.seedTestQuestions(savedUsers);

      // 테스트 답변 생성
      await this.seedTestAnswers();

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
      const testQuestions = [
        {
          title: "Why did Vue choose a reactivity-based state management approach, and why does Vue 3 support both 'ref()' and 'reactive()'?",
          description: "I'm curious about the background and philosophy behind Vue's decision to adopt a reactivity-based state management approach. I understand the various benefits of using a reactive state...",
          votes: 0,
          answers: 0,
          views: 2,
          tags: ["vue.js", "vuejs2", "vuejs3", "reactive"],
          userId: users[0].mbrId,
        },
        {
          title: "How to find the start of a substring that isn't proceeded by a certain character, and ends with a character not proceeded by a character, in regex",
          description: "So, I have a regex problem I'm trying to solve and can't figure out. I need to find a string that starts with R or K, but not followed by a #, continuing onwards til it finds another R or K which...",
          votes: 0,
          answers: 0,
          views: 5,
          tags: ["regex", "string"],
          userId: users[1].mbrId,
        },
        {
          title: "SignalR in dotnet 9 and Angular v19 errors - Websockets issues",
          description: "here is errors from Chrome Debugger's screen: [2025-03-14T07:24:52.776Z] Information: Normalizing '/downloadHub' to 'https://127.0.0.1:63349/downloadHub'. Utils.js:148 [2025-03-14T07:24:52.776Z]...",
          votes: 0,
          answers: 0,
          views: 5,
          tags: [".net", "angular", "asp.net-core-signalr"],
          userId: users[2].mbrId,
        },
      ];

      const questions = this.questionRepository.create(testQuestions);
      await this.questionRepository.save(questions);

      this.logger.log(`Created ${testQuestions.length} test questions`);
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
   * 테스트 답변을 생성합니다.
   */
  async seedTestAnswers(): Promise<void> {
    try {
      this.logger.log('Seeding test answers...');
      
      // 질문 6번 찾기
      const question6 = await this.questionRepository.findOne({ where: { id: 6 } });
      if (!question6) {
        this.logger.warn('Question 6 not found, cannot create test answers');
        return;
      }

      // 사용자 찾기
      const users = await this.userRepository.find({ take: 3 });
      if (users.length < 2) {
        this.logger.warn('Not enough users found for creating test answers');
        return;
      }

      // 기존 답변이 있는지 확인
      const existingAnswers = await this.answerRepository.count({ where: { questionId: 6 } });
      if (existingAnswers > 0) {
        this.logger.log('Answers already exist for question 6');
        return;
      }

      // 테스트 답변 데이터 - 영문으로 작성하여 인코딩 문제 방지
      const testAnswers = [
        {
          content: "To resolve this SignalR issue, try the following steps:\n\n1. **Check CORS settings**: Verify that CORS is properly configured in ASP.NET Core.\n2. **Verify port and URL**: Make sure the server is actually running at https://127.0.0.1:63349/downloadHub.\n3. **WebSocket transport**: Ensure WebSocket is explicitly enabled in SignalR configuration.\n4. **Browser dev tools**: Check WebSocket connection status in the Network tab.\n\nAdditional debugging tip: Check the browser console for detailed error messages.",
          votes: 2,
          accepted: true,
          questionId: 6,
          userId: users[0].mbrId,
        },
        {
          content: "This is a common issue when using Angular v19 with SignalR. Try this solution:\n\n```typescript\n// Add these options when setting up hub connection\nconst connection = new HubConnectionBuilder()\n  .withUrl('/downloadHub', {\n    skipNegotiation: true,\n    transport: HttpTransportType.WebSockets\n  })\n  .build();\n```\n\nAlso verify these server settings:\n- Configure SignalR before UseHttpsRedirection()\n- Include SignalR Hub in CORS policy\n- Check firewall settings for WebSocket connections",
          votes: 1,
          accepted: false,
          questionId: 6,
          userId: users[1].mbrId,
        }
      ];

      const answers = this.answerRepository.create(testAnswers);
      await this.answerRepository.save(answers);

      // 질문의 답변 수 업데이트
      await this.questionRepository.update(6, { answers: testAnswers.length });

      this.logger.log(`Created ${testAnswers.length} test answers for question 6`);
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
        where: { role: UserRole.ADMIN } 
      });
      const regularUsers = await this.userRepository.count({ 
        where: { role: UserRole.USER } 
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