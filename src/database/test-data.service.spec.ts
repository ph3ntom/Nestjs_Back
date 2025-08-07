import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestDataService } from './test-data.service';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/user.dto/user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('TestDataService', () => {
  let service: TestDataService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockUserRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDataService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TestDataService>(TestDataService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedTestData', () => {
    it('should create test data when no users exist', async () => {
      userRepository.count.mockResolvedValue(0);
      userRepository.create.mockReturnValue({} as User);
      userRepository.save.mockResolvedValue([{} as User]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.seedTestData();

      expect(userRepository.count).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledTimes(3);
    });

    it('should skip seeding when users already exist', async () => {
      userRepository.count.mockResolvedValue(5);

      await service.seedTestData();

      expect(userRepository.count).toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('clearTestData', () => {
    it('should clear all test data', async () => {
      userRepository.delete.mockResolvedValue({} as any);

      await service.clearTestData();

      expect(userRepository.delete).toHaveBeenCalledWith({});
    });
  });

  describe('createTestUser', () => {
    it('should create a test user with hashed password', async () => {
      const userData = {
        userId: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '010-1234-5678',
        role: UserRole.USER,
      };

      const expectedUser = { ...userData, mbrId: 1 } as User;
      
      userRepository.create.mockReturnValue(expectedUser);
      userRepository.save.mockResolvedValue(expectedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.createTestUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: 'hashedPassword',
      });
      expect(userRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should use default password when none provided', async () => {
      const userData = {
        userId: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        phone: '010-1234-5678',
      };

      userRepository.create.mockReturnValue({} as User);
      userRepository.save.mockResolvedValue({} as User);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedDefaultPassword');

      await service.createTestUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('defaultPassword', 10);
    });
  });

  describe('getDatabaseStats', () => {
    it('should return database statistics', async () => {
      userRepository.count
        .mockResolvedValueOnce(10) // total users
        .mockResolvedValueOnce(2)  // admin users
        .mockResolvedValueOnce(8); // regular users

      const result = await service.getDatabaseStats();

      expect(result).toEqual({
        totalUsers: 10,
        adminUsers: 2,
        regularUsers: 8,
      });

      expect(userRepository.count).toHaveBeenCalledTimes(3);
      expect(userRepository.count).toHaveBeenNthCalledWith(1);
      expect(userRepository.count).toHaveBeenNthCalledWith(2, { 
        where: { role: UserRole.ADMIN } 
      });
      expect(userRepository.count).toHaveBeenNthCalledWith(3, { 
        where: { role: UserRole.USER } 
      });
    });
  });
});