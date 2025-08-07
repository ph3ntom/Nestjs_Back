import { Controller, Post, Get, Delete, UseGuards, Logger, Query, Param } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TestDataService } from './test-data.service';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  private readonly logger = new Logger(MigrationController.name);

  constructor(
    private databaseService: DatabaseService,
    private testDataService: TestDataService,
    private migrationService: MigrationService,
  ) {}

  /**
   * 데이터베이스 초기화 (마이그레이션 실행)
   */
  @Post('init')
  async initializeDatabase() {
    try {
      await this.databaseService.initializeDatabase();
      return {
        success: true,
        message: 'Database initialized successfully',
      };
    } catch (error) {
      this.logger.error('Database initialization failed', error);
      return {
        success: false,
        message: 'Database initialization failed',
        error: error.message,
      };
    }
  }

  /**
   * 마이그레이션 실행
   */
  @Post('run')
  async runMigrations() {
    try {
      await this.databaseService.runMigrations();
      return {
        success: true,
        message: 'Migrations executed successfully',
      };
    } catch (error) {
      this.logger.error('Migration execution failed', error);
      return {
        success: false,
        message: 'Migration execution failed',
        error: error.message,
      };
    }
  }

  /**
   * 마이그레이션 되돌리기
   */
  @Post('revert')
  async revertMigration() {
    try {
      await this.databaseService.revertMigration();
      return {
        success: true,
        message: 'Migration reverted successfully',
      };
    } catch (error) {
      this.logger.error('Migration revert failed', error);
      return {
        success: false,
        message: 'Migration revert failed',
        error: error.message,
      };
    }
  }

  /**
   * 데이터베이스 상태 확인
   */
  @Get('status')
  async getDatabaseStatus() {
    try {
      const health = await this.databaseService.checkDatabaseHealth();
      const stats = await this.testDataService.getDatabaseStats();
      
      return {
        success: true,
        data: {
          database: health,
          statistics: stats,
        },
      };
    } catch (error) {
      this.logger.error('Database status check failed', error);
      return {
        success: false,
        message: 'Database status check failed',
        error: error.message,
      };
    }
  }

  /**
   * 테스트 데이터 생성
   */
  @Post('seed')
  async seedTestData() {
    try {
      await this.testDataService.seedTestData();
      return {
        success: true,
        message: 'Test data seeded successfully',
      };
    } catch (error) {
      this.logger.error('Test data seeding failed', error);
      return {
        success: false,
        message: 'Test data seeding failed',
        error: error.message,
      };
    }
  }

  /**
   * 테스트 데이터 삭제
   */
  @Delete('clear')
  async clearTestData() {
    try {
      await this.testDataService.clearTestData();
      return {
        success: true,
        message: 'Test data cleared successfully',
      };
    } catch (error) {
      this.logger.error('Test data clearing failed', error);
      return {
        success: false,
        message: 'Test data clearing failed',
        error: error.message,
      };
    }
  }

  /**
   * 스키마 동기화 (개발환경에서만)
   */
  @Post('sync')
  async syncSchema() {
    try {
      await this.databaseService.synchronizeSchema();
      return {
        success: true,
        message: 'Schema synchronized successfully',
      };
    } catch (error) {
      this.logger.error('Schema synchronization failed', error);
      return {
        success: false,
        message: 'Schema synchronization failed',
        error: error.message,
      };
    }
  }

  /**
   * 마이그레이션 상태 조회
   */
  @Get('migrations')
  async getMigrationStatus() {
    try {
      const status = await this.migrationService.getMigrationStatus();
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error('Failed to get migration status', error);
      return {
        success: false,
        message: 'Failed to get migration status',
        error: error.message,
      };
    }
  }

  /**
   * 특정 마이그레이션까지 실행
   */
  @Post('run-to/:migrationName')
  async runMigrationsTo(@Param('migrationName') migrationName: string) {
    try {
      await this.migrationService.runMigrationsTo(migrationName);
      return {
        success: true,
        message: `Migrations executed up to ${migrationName}`,
      };
    } catch (error) {
      this.logger.error('Failed to run migrations', error);
      return {
        success: false,
        message: 'Failed to run migrations',
        error: error.message,
      };
    }
  }

  /**
   * 사용자 데이터 검증
   */
  @Get('validate-users')
  async validateUserData() {
    try {
      const validation = await this.migrationService.validateUserData();
      return {
        success: validation.isValid,
        data: validation,
        message: validation.isValid ? 'User data is valid' : 'User data validation failed',
      };
    } catch (error) {
      this.logger.error('User data validation failed', error);
      return {
        success: false,
        message: 'User data validation failed',
        error: error.message,
      };
    }
  }

  /**
   * 마이그레이션 테스트 실행
   */
  @Post('test')
  async testMigrations() {
    try {
      const testResults = await this.migrationService.testMigrations();
      return {
        success: testResults.success,
        data: testResults,
        message: testResults.success 
          ? 'All migrations tested successfully' 
          : `Migration tests completed with ${testResults.summary.failed} failures`,
      };
    } catch (error) {
      this.logger.error('Migration testing failed', error);
      return {
        success: false,
        message: 'Migration testing failed',
        error: error.message,
      };
    }
  }

  /**
   * 완전한 데이터베이스 테스트 (초기화 + 마이그레이션 + 검증)
   */
  @Post('full-test')
  async fullDatabaseTest() {
    try {
      this.logger.log('Starting full database test...');
      
      // 1. 데이터베이스 초기화
      await this.databaseService.initializeDatabase();
      this.logger.log('✓ Database initialized');
      
      // 2. 마이그레이션 테스트
      const migrationTest = await this.migrationService.testMigrations();
      this.logger.log(`✓ Migration test completed: ${migrationTest.summary.executed} executed, ${migrationTest.summary.failed} failed`);
      
      // 3. 사용자 데이터 검증
      const userValidation = await this.migrationService.validateUserData();
      this.logger.log(`✓ User validation completed: ${userValidation.totalUsers} users found`);
      
      // 4. 데이터베이스 상태 확인
      const dbHealth = await this.databaseService.checkDatabaseHealth();
      this.logger.log('✓ Database health check completed');
      
      const overallSuccess = migrationTest.success && userValidation.isValid && dbHealth.isConnected;
      
      return {
        success: overallSuccess,
        data: {
          migrations: migrationTest,
          userValidation,
          databaseHealth: dbHealth,
        },
        message: overallSuccess 
          ? 'Full database test completed successfully' 
          : 'Full database test completed with issues',
      };
    } catch (error) {
      this.logger.error('Full database test failed', error);
      return {
        success: false,
        message: 'Full database test failed',
        error: error.message,
      };
    }
  }
}