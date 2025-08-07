import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/user.dto/user.dto';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 모든 마이그레이션 상태를 확인합니다.
   */
  async getMigrationStatus(): Promise<{
    executed: Array<{ name: string; timestamp: number }>;
    pending: Array<{ name: string; timestamp: number }>;
  }> {
    try {
      const executedMigrations = await this.dataSource.query(`
        SELECT name, timestamp FROM migrations_history ORDER BY timestamp ASC
      `);

      const allMigrations = this.dataSource.migrations;
      const executedNames = executedMigrations.map(m => m.name);
      
      const pending = allMigrations
        .filter(m => m.name && !executedNames.includes(m.name))
        .map(m => ({
          name: m.name || '',
          timestamp: parseInt((m.name || '').split('-')[0]) || 0
        }));

      return {
        executed: executedMigrations,
        pending
      };
    } catch (error) {
      this.logger.error('Failed to get migration status', error);
      throw error;
    }
  }

  /**
   * 특정 마이그레이션까지 실행합니다.
   */
  async runMigrationsTo(targetMigration?: string): Promise<void> {
    try {
      if (targetMigration) {
        this.logger.log(`Running migrations up to: ${targetMigration}`);
        // TypeORM에서는 특정 마이그레이션까지만 실행하는 기본 기능이 없으므로
        // 수동으로 구현해야 합니다.
        await this.runSpecificMigrations(targetMigration);
      } else {
        this.logger.log('Running all pending migrations');
        await this.dataSource.runMigrations();
      }
    } catch (error) {
      this.logger.error('Failed to run migrations', error);
      throw error;
    }
  }

  /**
   * 특정 마이그레이션들을 실행합니다.
   */
  private async runSpecificMigrations(targetMigration: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const migrations = this.dataSource.migrations;
      const targetIndex = migrations.findIndex(m => m.name === targetMigration);
      
      if (targetIndex === -1) {
        throw new Error(`Migration ${targetMigration} not found`);
      }

      const migrationsToRun = migrations.slice(0, targetIndex + 1);
      
      for (const migration of migrationsToRun) {
        const migrationName = migration.name || '';
        const isExecuted = await this.isMigrationExecuted(migrationName);
        if (!isExecuted) {
          this.logger.log(`Executing migration: ${migrationName}`);
          const MigrationClass = migration as any;
          const migrationInstance = new MigrationClass();
          await migrationInstance.up(queryRunner);
          
          // 마이그레이션 히스토리에 기록
          await queryRunner.query(`
            INSERT INTO migrations_history (timestamp, name) VALUES (?, ?)
          `, [Date.now(), migrationName]);
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 마이그레이션이 실행되었는지 확인합니다.
   */
  private async isMigrationExecuted(migrationName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM migrations_history WHERE name = ?
      `, [migrationName]);
      
      return result[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 데이터베이스의 사용자 데이터를 검증합니다.
   */
  async validateUserData(): Promise<{
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    testUsers: string[];
    isValid: boolean;
    errors: string[];
  }> {
    try {
      const totalUsers = await this.userRepository.count();
      const adminUsers = await this.userRepository.count({ 
        where: { role: UserRole.ADMIN } 
      });
      const regularUsers = await this.userRepository.count({ 
        where: { role: UserRole.USER } 
      });

      // 테스트 사용자들 확인
      const testUserIds = ['admin', 'testuser1', 'testuser2', 'testuser3', 'developer', 'tester'];
      const existingTestUsers = await this.userRepository.find({
        where: testUserIds.map(id => ({ userId: id })),
        select: ['userId']
      });

      const foundTestUsers = existingTestUsers.map(u => u.userId);
      const errors: string[] = [];

      // 검증 로직
      if (totalUsers === 0) {
        errors.push('No users found in database');
      }

      if (adminUsers === 0) {
        errors.push('No admin users found');
      }

      // 필수 테스트 사용자 확인
      const missingTestUsers = testUserIds.filter(id => !foundTestUsers.includes(id));
      if (missingTestUsers.length > 0) {
        errors.push(`Missing test users: ${missingTestUsers.join(', ')}`);
      }

      return {
        totalUsers,
        adminUsers,
        regularUsers,
        testUsers: foundTestUsers,
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error('Failed to validate user data', error);
      return {
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        testUsers: [],
        isValid: false,
        errors: [`Validation failed: ${error.message}`]
      };
    }
  }

  /**
   * 마이그레이션 테스트를 실행합니다.
   */
  async testMigrations(): Promise<{
    success: boolean;
    results: Array<{
      migration: string;
      status: 'success' | 'failed' | 'skipped';
      message: string;
      duration: number;
    }>;
    summary: {
      total: number;
      executed: number;
      failed: number;
      skipped: number;
    };
  }> {
    const results: Array<{
      migration: string;
      status: 'success' | 'failed' | 'skipped';
      message: string;
      duration: number;
    }> = [];
    let executed = 0;
    let failed = 0;
    let skipped = 0;

    try {
      const status = await this.getMigrationStatus();
      
      for (const migration of status.pending) {
        const startTime = Date.now();
        
        try {
          this.logger.log(`Testing migration: ${migration.name}`);
          
          // 마이그레이션 실행 테스트
          await this.runMigrationsTo(migration.name);
          
          const duration = Date.now() - startTime;
          results.push({
            migration: migration.name,
            status: 'success' as const,
            message: 'Migration executed successfully',
            duration
          });
          executed++;
          
        } catch (error: any) {
          const duration = Date.now() - startTime;
          results.push({
            migration: migration.name,
            status: 'failed' as const,
            message: error.message,
            duration
          });
          failed++;
        }
      }

      // 이미 실행된 마이그레이션들은 스킵됨으로 표시
      for (const migration of status.executed) {
        results.push({
          migration: migration.name,
          status: 'skipped' as const,
          message: 'Migration already executed',
          duration: 0
        });
        skipped++;
      }

      const total = results.length;
      
      return {
        success: failed === 0,
        results,
        summary: {
          total,
          executed,
          failed,
          skipped
        }
      };

    } catch (error) {
      this.logger.error('Migration test failed', error);
      throw error;
    }
  }
}