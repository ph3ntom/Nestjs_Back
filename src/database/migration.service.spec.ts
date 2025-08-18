import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { MigrationService } from './migration.service';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/user.dto/user.dto';

describe('MigrationService', () => {
  let service: MigrationService;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
    } as any;

    mockDataSource = {
      query: jest.fn(),
      migrations: [],
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      runMigrations: jest.fn().mockResolvedValue([]),
    } as any;

    mockUserRepository = {
      count: jest.fn(),
      find: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<MigrationService>(MigrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMigrationStatus', () => {
    it('should return migration status with executed and pending migrations', async () => {
      const executedMigrations = [
        { name: 'InitialMigration1722000000000', timestamp: 1722000000000 },
      ];

      mockDataSource.query.mockResolvedValue(executedMigrations);
      mockDataSource.migrations = [
        { name: 'InitialMigration1722000000000' },
        { name: 'AddTestUsers1722000001000' },
      ] as any;

      const result = await service.getMigrationStatus();

      expect(result.executed).toEqual(executedMigrations);
      expect(result.pending).toHaveLength(1);
      expect(result.pending[0].name).toBe('AddTestUsers1722000001000');
    });

    it('should handle database query errors', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Database error'));

      await expect(service.getMigrationStatus()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('validateUserData', () => {
    it('should return valid user data validation', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(6) // total users
        .mockResolvedValueOnce(1) // admin users
        .mockResolvedValueOnce(5); // regular users

      const testUsers = [
        { userId: 'admin' },
        { userId: 'testuser1' },
        { userId: 'testuser2' },
        { userId: 'testuser3' },
        { userId: 'developer' },
        { userId: 'tester' },
      ] as User[];

      mockUserRepository.find.mockResolvedValue(testUsers);

      const result = await service.validateUserData();

      expect(result.isValid).toBe(true);
      expect(result.totalUsers).toBe(6);
      expect(result.adminUsers).toBe(1);
      expect(result.regularUsers).toBe(5);
      expect(result.testUsers).toHaveLength(6);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing test users', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(3) // total users
        .mockResolvedValueOnce(1) // admin users
        .mockResolvedValueOnce(2); // regular users

      const testUsers = [
        { userId: 'admin' },
        { userId: 'testuser1' },
      ] as User[];

      mockUserRepository.find.mockResolvedValue(testUsers);

      const result = await service.validateUserData();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Missing test users: testuser2, testuser3, developer, tester',
      );
    });

    it('should detect no admin users', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(5) // total users
        .mockResolvedValueOnce(0) // admin users
        .mockResolvedValueOnce(5); // regular users

      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateUserData();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No admin users found');
    });

    it('should detect empty database', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(0) // total users
        .mockResolvedValueOnce(0) // admin users
        .mockResolvedValueOnce(0); // regular users

      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateUserData();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No users found in database');
    });

    it('should handle validation errors gracefully', async () => {
      mockUserRepository.count.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const result = await service.validateUserData();

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        'Validation failed: Database connection failed',
      );
    });
  });

  describe('testMigrations', () => {
    it('should test all pending migrations successfully', async () => {
      const mockMigrationStatus = {
        executed: [
          { name: 'InitialMigration1722000000000', timestamp: 1722000000000 },
        ],
        pending: [
          { name: 'AddTestUsers1722000001000', timestamp: 1722000001000 },
        ],
      };

      jest
        .spyOn(service, 'getMigrationStatus')
        .mockResolvedValue(mockMigrationStatus);
      jest.spyOn(service, 'runMigrationsTo').mockResolvedValue();

      const result = await service.testMigrations();

      expect(result.success).toBe(true);
      expect(result.summary.total).toBe(2);
      expect(result.summary.executed).toBe(1);
      expect(result.summary.skipped).toBe(1);
      expect(result.summary.failed).toBe(0);

      const executedMigration = result.results.find(
        (r) => r.migration === 'AddTestUsers1722000001000',
      );
      expect(executedMigration?.status).toBe('success');

      const skippedMigration = result.results.find(
        (r) => r.migration === 'InitialMigration1722000000000',
      );
      expect(skippedMigration?.status).toBe('skipped');
    });

    it('should handle migration execution failures', async () => {
      const mockMigrationStatus = {
        executed: [],
        pending: [{ name: 'FailingMigration', timestamp: 1722000002000 }],
      };

      jest
        .spyOn(service, 'getMigrationStatus')
        .mockResolvedValue(mockMigrationStatus);
      jest
        .spyOn(service, 'runMigrationsTo')
        .mockRejectedValue(new Error('Migration failed'));

      const result = await service.testMigrations();

      expect(result.success).toBe(false);
      expect(result.summary.failed).toBe(1);
      expect(result.results[0].status).toBe('failed');
      expect(result.results[0].message).toBe('Migration failed');
    });
  });
});
