import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class InitialMigration1722000000000 implements MigrationInterface {
    name = 'InitialMigration1722000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "mbrId",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "userId",
                        type: "varchar",
                        length: "255",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "password",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                    },
                    {
                        name: "role",
                        type: "enum",
                        enum: ["USER", "ADMIN"],
                        default: "'USER'",
                        isNullable: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create unique index on userId
        await queryRunner.createIndex("users", new TableIndex({
            name: "IDX_USERS_USERID",
            columnNames: ["userId"],
            isUnique: true,
        }));

        // Create index on email for faster queries
        await queryRunner.createIndex("users", new TableIndex({
            name: "IDX_USERS_EMAIL",
            columnNames: ["email"],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.dropIndex("users", "IDX_USERS_EMAIL");
        await queryRunner.dropIndex("users", "IDX_USERS_USERID");
        
        // Drop table
        await queryRunner.dropTable("users");
    }
}