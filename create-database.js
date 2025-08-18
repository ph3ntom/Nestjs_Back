const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    // 데이터베이스 없이 MySQL에 연결
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'phantom',
      password: 'ehy1123?',
    });

    console.log('MySQL에 연결되었습니다.');

    // 데이터베이스 생성
    await connection.execute('CREATE DATABASE IF NOT EXISTS `node`');
    console.log('✅ 데이터베이스 "node"가 생성되었습니다.');

    // 문자 집합 설정
    await connection.query('ALTER DATABASE `node` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 데이터베이스 문자 집합이 utf8mb4로 설정되었습니다.');

    await connection.end();
    console.log('✅ 데이터베이스 생성이 완료되었습니다.');
    
  } catch (error) {
    console.error('❌ 데이터베이스 생성 중 오류 발생:', error.message);
    process.exit(1);
  }
}

createDatabase();