import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  /**
   * 자동으로 데이터베이스를 생성하고 마이그레이션을 실행합니다.
   */
  async initializeDatabase(): Promise<void> {
    try {
      this.logger.log('Initializing database...');

      // 데이터베이스 연결 확인
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        this.logger.log('Database connection established');
      }

      // 마이그레이션 실행
      await this.runMigrations();

      this.logger.log('Database initialization completed');
    } catch (error) {
      this.logger.error('Database initialization failed', error);
      throw error;
    }
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Running migrations...');

      const pendingMigrations = await this.dataSource.showMigrations();
      if (pendingMigrations) {
        this.logger.log(`Found ${pendingMigrations} pending migrations`);
        await this.dataSource.runMigrations();
        this.logger.log('Migrations completed successfully');
      } else {
        this.logger.log('No pending migrations found');
      }
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    }
  }

  /**
   * 마이그레이션을 되돌립니다.
   */
  async revertMigration(): Promise<void> {
    try {
      this.logger.log('Reverting last migration...');
      await this.dataSource.undoLastMigration();
      this.logger.log('Migration reverted successfully');
    } catch (error) {
      this.logger.error('Migration revert failed', error);
      throw error;
    }
  }

  /**
   * 데이터베이스 스키마를 동기화합니다 (개발 환경에서만 사용)
   */
  async synchronizeSchema(): Promise<void> {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Schema synchronization is not allowed in production');
    }

    try {
      this.logger.log('Synchronizing database schema...');
      await this.dataSource.synchronize();
      this.logger.log('Schema synchronization completed');
    } catch (error) {
      this.logger.error('Schema synchronization failed', error);
      throw error;
    }
  }

  /**
   * 데이터베이스 연결을 닫습니다.
   */
  async closeConnection(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.logger.log('Database connection closed');
    }
  }

  /**
   * 데이터베이스 상태를 확인합니다.
   */
  async checkDatabaseHealth(): Promise<{
    isConnected: boolean;
    pendingMigrations: boolean;
    lastMigration?: string;
  }> {
    try {
      const isConnected = this.dataSource.isInitialized;
      const pendingMigrations = await this.dataSource.showMigrations();

      const executedMigrations = await this.dataSource.query(
        'SELECT * FROM migrations_history ORDER BY timestamp DESC LIMIT 1',
      );

      return {
        isConnected,
        pendingMigrations: !!pendingMigrations,
        lastMigration: executedMigrations[0]?.name,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        isConnected: false,
        pendingMigrations: false,
      };
    }
  }
}
