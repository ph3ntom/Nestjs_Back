const mysql = require('mysql2/promise');

async function verifyPasswords() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'phantom',
      password: 'ehy1123?',
      database: 'node',
    });

    console.log('🔍 데이터베이스에서 사용자 정보 조회 중...\n');

    const [rows] = await connection.execute(`
      SELECT userId, password, name, role, createdAt 
      FROM users 
      ORDER BY role DESC, userId ASC
    `);

    console.log('📋 현재 등록된 사용자 목록:');
    console.log('='.repeat(80));
    console.log(
      '사용자ID'.padEnd(12) + 
      '비밀번호'.padEnd(15) + 
      '이름'.padEnd(15) + 
      '역할'.padEnd(8) + 
      '생성일시'
    );
    console.log('-'.repeat(80));

    rows.forEach(user => {
      console.log(
        user.userId.padEnd(12) + 
        user.password.padEnd(15) + 
        user.name.padEnd(15) + 
        user.role.padEnd(8) + 
        user.createdAt.toISOString().slice(0, 19).replace('T', ' ')
      );
    });

    console.log('-'.repeat(80));
    console.log(`총 ${rows.length}명의 사용자가 등록되어 있습니다.\n`);

    // 비밀번호가 평문인지 확인
    console.log('🔐 비밀번호 저장 방식 확인:');
    let isPlainText = true;
    
    rows.forEach(user => {
      // bcrypt 해시는 $2b$로 시작하고 60자리
      const isBcrypted = user.password.startsWith('$2b$') && user.password.length === 60;
      if (isBcrypted) {
        isPlainText = false;
      }
      
      console.log(`- ${user.userId}: ${isBcrypted ? '암호화됨 (bcrypt)' : '평문'}`);
    });

    console.log('\n✅ 결과:', isPlainText ? '모든 비밀번호가 평문으로 저장됨' : '일부 비밀번호가 암호화되어 있음');

    await connection.end();
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

verifyPasswords();