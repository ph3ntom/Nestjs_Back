import { DataSource } from 'typeorm';
import { User } from './src/auth/entities/user.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'phantom',
  password: process.env.DB_PASSWORD || 'ehy1123?',
  database: process.env.DB_NAME || 'node',
  entities: [User],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrationsRun: false,
  migrationsTableName: 'migrations_history',
});