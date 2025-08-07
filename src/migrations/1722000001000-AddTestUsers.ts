import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestUsers1722000001000 implements MigrationInterface {
    name = 'AddTestUsers1722000001000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // 이미 테스트 사용자가 있는지 확인
            const existingUsers = await queryRunner.query(`
                SELECT COUNT(*) as count FROM users WHERE userId IN ('admin', 'testuser1', 'testuser2', 'testuser3', 'developer', 'tester')
            `);
            
            if (existingUsers[0].count > 0) {
                console.log('테스트 사용자가 이미 존재합니다. 스킵합니다.');
                return;
            }

            // 테스트용 관리자 계정 추가 (평문 비밀번호)
            await queryRunner.query(`
                INSERT IGNORE INTO users (userId, password, name, email, phone, role, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, ['admin', 'admin123!', '시스템 관리자', 'admin@example.com', '010-0000-0000', 'ADMIN']);

            // 테스트용 일반 사용자들 추가 (평문 비밀번호)
            const testUsers = [
                ['testuser1', 'user123!', '테스트 사용자1', 'test1@example.com', '010-1111-1111', 'USER'],
                ['testuser2', 'user123!', '테스트 사용자2', 'test2@example.com', '010-2222-2222', 'USER'],
                ['testuser3', 'user123!', '테스트 사용자3', 'test3@example.com', '010-3333-3333', 'USER'],
                ['developer', 'dev123!', '개발자', 'dev@example.com', '010-4444-4444', 'USER'],
                ['tester', 'test123!', '테스터', 'tester@example.com', '010-5555-5555', 'USER']
            ];

            for (const user of testUsers) {
                await queryRunner.query(`
                    INSERT IGNORE INTO users (userId, password, name, email, phone, role, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, user);
            }

            console.log('테스트 사용자 6명이 평문 비밀번호로 성공적으로 추가되었습니다.');
            console.log('비밀번호 정보:');
            console.log('- admin: admin123!');
            console.log('- testuser1,2,3: user123!');
            console.log('- developer: dev123!');
            console.log('- tester: test123!');
        } catch (error) {
            console.error('테스트 사용자 추가 중 오류 발생:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 추가된 테스트 사용자들 삭제
        const testUserIds = ['admin', 'testuser1', 'testuser2', 'testuser3', 'developer', 'tester'];
        
        for (const userId of testUserIds) {
            await queryRunner.query(`DELETE FROM users WHERE userId = ?`, [userId]);
        }

        console.log('테스트 사용자들이 성공적으로 삭제되었습니다.');
    }
}