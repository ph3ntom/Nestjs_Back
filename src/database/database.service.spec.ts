import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockDataSource: Partial<DataSource>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockDataSource = {
      isInitialized: false,
      initialize: jest.fn().mockResolvedValue(undefined),
      showMigrations: jest.fn().mockResolvedValue(false),
      runMigrations: jest.fn().mockResolvedValue([]),
      undoLastMigration: jest.fn().mockResolvedValue(undefined),
      synchronize: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([]),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeDatabase', () => {
    it('should initialize database and run migrations', async () => {
      mockDataSource.isInitialized = false;
      mockDataSource.showMigrations = jest.fn().mockResolvedValue(true);

      await service.initializeDatabase();

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(mockDataSource.runMigrations).toHaveBeenCalled();
    });

    it('should skip initialization if already initialized', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.showMigrations = jest.fn().mockResolvedValue(false);

      await service.initializeDatabase();

      expect(mockDataSource.initialize).not.toHaveBeenCalled();
      expect(mockDataSource.runMigrations).not.toHaveBeenCalled();
    });
  });

  describe('runMigrations', () => {
    it('should run migrations when pending migrations exist', async () => {
      mockDataSource.showMigrations = jest.fn().mockResolvedValue(true);

      await service.runMigrations();

      expect(mockDataSource.showMigrations).toHaveBeenCalled();
      expect(mockDataSource.runMigrations).toHaveBeenCalled();
    });

    it('should skip migrations when no pending migrations', async () => {
      mockDataSource.showMigrations = jest.fn().mockResolvedValue(false);

      await service.runMigrations();

      expect(mockDataSource.showMigrations).toHaveBeenCalled();
      expect(mockDataSource.runMigrations).not.toHaveBeenCalled();
    });
  });

  describe('revertMigration', () => {
    it('should revert last migration', async () => {
      await service.revertMigration();

      expect(mockDataSource.undoLastMigration).toHaveBeenCalled();
    });
  });

  describe('synchronizeSchema', () => {
    it('should synchronize schema in non-production environment', async () => {
      mockConfigService.get = jest.fn().mockReturnValue('development');

      await service.synchronizeSchema();

      expect(mockDataSource.synchronize).toHaveBeenCalled();
    });

    it('should throw error in production environment', async () => {
      mockConfigService.get = jest.fn().mockReturnValue('production');

      await expect(service.synchronizeSchema()).rejects.toThrow(
        'Schema synchronization is not allowed in production'
      );
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return database health status', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.showMigrations = jest.fn().mockResolvedValue(false);
      mockDataSource.query = jest.fn().mockResolvedValue([
        { name: 'TestMigration1722000000000' }
      ]);

      const result = await service.checkDatabaseHealth();

      expect(result).toEqual({
        isConnected: true,
        pendingMigrations: false,
        lastMigration: 'TestMigration1722000000000',
      });
    });

    it('should handle database health check errors', async () => {
      mockDataSource.showMigrations = jest.fn().mockRejectedValue(new Error('DB Error'));

      const result = await service.checkDatabaseHealth();

      expect(result).toEqual({
        isConnected: false,
        pendingMigrations: false,
      });
    });
  });
});