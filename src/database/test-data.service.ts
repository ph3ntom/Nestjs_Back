import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/user.dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestDataService {
  private readonly logger = new Logger(TestDataService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
        this.logger.log('Test data already exists, skipping seed');
        return;
      }

      // 테스트 사용자 생성
      const testUsers = [
        {
          userId: 'admin',
          password: await bcrypt.hash('admin123', 10),
          name: '관리자',
          email: 'admin@test.com',
          phone: '010-1234-5678',
          role: UserRole.ADMIN,
        },
        {
          userId: 'user1',
          password: await bcrypt.hash('user123', 10),
          name: '테스트 사용자1',
          email: 'user1@test.com',
          phone: '010-2345-6789',
          role: UserRole.USER,
        },
        {
          userId: 'user2',
          password: await bcrypt.hash('user123', 10),
          name: '테스트 사용자2',
          email: 'user2@test.com',
          phone: '010-3456-7890',
          role: UserRole.USER,
        },
      ];

      // 사용자 일괄 생성
      const users = this.userRepository.create(testUsers);
      await this.userRepository.save(users);

      this.logger.log(`Created ${testUsers.length} test users`);
      this.logger.log('Test data seeding completed');
    } catch (error) {
      this.logger.error('Test data seeding failed', error);
      throw error;
    }
  }

  /**
   * 테스트 데이터를 삭제합니다.
   */
  async clearTestData(): Promise<void> {
    try {
      this.logger.log('Clearing test data...');
      
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
      const hashedPassword = userData.password 
        ? await bcrypt.hash(userData.password, 10)
        : await bcrypt.hash('defaultPassword', 10);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
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