import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { TestDataService } from './test-data.service';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { User } from '../auth/entities/user.entity';
import { Question } from '../question/entities/question.entity';
import { Answer } from '../question/entities/answer.entity';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Question, Answer])],
  controllers: [MigrationController],
  providers: [DatabaseService, TestDataService, MigrationService],
  exports: [DatabaseService, TestDataService, MigrationService],
})
export class DatabaseModule {}
