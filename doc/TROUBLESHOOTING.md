# 트러블슈팅 가이드

## 📋 개요
이 문서는 마이그레이션 시스템 구축 과정에서 발생했던 문제들과 해결 방법을 정리합니다.

## 🔧 TypeScript 컴파일 오류

### 문제 1: 환경 변수 타입 오류
```
error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

**발생 위치:**
- `app.module.ts:18:22`
- `ormconfig.ts:7:22`

**원인:**
```typescript
port: parseInt(process.env.DB_PORT) || 3306,
```
`process.env.DB_PORT`가 `undefined`일 수 있어서 `parseInt()`에 전달할 수 없음

**해결방법:**
```typescript
port: parseInt(process.env.DB_PORT || '3306'),
```

---

### 문제 2: 마이그레이션 인터페이스 타입 오류
```
error TS2351: This expression is not constructable. Type 'MigrationInterface' has no construct signatures.
```

**발생 위치:**
- `migration.service.ts:91:41`

**원인:**
```typescript
const migrationInstance = new migration();
```
TypeORM 마이그레이션 클래스를 직접 인스턴스화할 때 타입 문제

**해결방법:**
```typescript
const MigrationClass = migration as any;
const migrationInstance = new MigrationClass();
```

---

### 문제 3: Index 생성 문법 오류
```
error TS2350: Only a void function can be called with the 'new' keyword.
error TS2769: No overload matches this call.
```

**발생 위치:**
- `InitialMigration.ts:76:48`

**원인:**
```typescript
await queryRunner.createIndex("users", new Index({
    name: "IDX_USERS_USERID",
    columnNames: ["userId"],
    isUnique: true,
}));
```
`Index` 대신 `TableIndex`를 사용해야 함

**해결방법:**
```typescript
import { TableIndex } from "typeorm";

await queryRunner.createIndex("users", new TableIndex({
    name: "IDX_USERS_USERID",
    columnNames: ["userId"],
    isUnique: true,
}));
```

---

## 🗄️ 데이터베이스 관련 오류

### 문제 4: 데이터베이스 존재하지 않음
```
Error: Unknown database 'node'
```

**발생 상황:**
마이그레이션 실행 시 데이터베이스가 존재하지 않음

**해결방법:**
1. **자동 생성 스크립트 사용:**
```javascript
// create-database.js
const mysql = require('mysql2/promise');

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'phantom',
    password: 'ehy1123?',
  });

  await connection.execute('CREATE DATABASE IF NOT EXISTS `node`');
  await connection.query('ALTER DATABASE `node` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await connection.end();
}
```

2. **수동 생성:**
```sql
CREATE DATABASE IF NOT EXISTS `node`;
ALTER DATABASE `node` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 문제 5: MySQL enum default 값 문법 오류
```
You have an error in your SQL syntax... near 'USER, `createdAt` timestamp'
```

**발생 위치:**
마이그레이션 실행 시 enum 필드 생성

**원인:**
```typescript
{
    name: "role",
    type: "enum",
    enum: ["USER", "ADMIN"],
    default: "USER",  // 따옴표 부족
    isNullable: false,
}
```

**해결방법:**
```typescript
{
    name: "role",
    type: "enum", 
    enum: ["USER", "ADMIN"],
    default: "'USER'",  // 문자열 리터럴로 감싸기
    isNullable: false,
}
```

---

## 📦 모듈 의존성 오류

### 문제 6: bcrypt 모듈 바이너리 호환성 오류
```
Error: \\?\C:\...\bcrypt_lib.node is not a valid Win32 application.
```

**발생 상황:**
마이그레이션에서 bcrypt 사용 시 Windows 환경에서 발생

**해결방법:**
```bash
# 모듈 재설치
npm uninstall bcrypt
npm install bcrypt

# 또는 캐시 정리 후 재설치
npm cache clean --force
npm install bcrypt
```

---

### 문제 7: 모듈 경로 오류
```
Error: Cannot find module 'C:\Users\...\UserslsjkeDesktopbackbackdistmain'
```

**발생 상황:**
빌드된 파일 실행 시 경로가 잘못 인식됨

**해결방법:**
```bash
# dist 폴더 삭제 후 재빌드
rm -rf dist
npm run build

# 또는 clean build
npm run build -- --clean
```

---

## 🌐 서버 및 네트워크 오류

### 문제 8: 포트 충돌 오류
```
Error: listen EADDRINUSE: address already in use :::3001
```

**발생 상황:**
서버 시작 시 포트가 이미 사용 중

**해결방법:**
1. **기존 프로세스 종료:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID번호] /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

2. **다른 포트 사용:**
```typescript
// main.ts
await app.listen(process.env.PORT || 3002);
```

3. **환경 변수로 포트 지정:**
```bash
PORT=3002 npm run start:dev
```

---

## 🔄 마이그레이션 실행 오류

### 문제 9: 중복 삽입 오류
```
Duplicate entry 'admin' for key 'users.UQ_8bf09ba754322ab9c22a215c919'
```

**발생 상황:**
테스트 데이터 재생성 시 중복 사용자 삽입 시도

**해결방법:**
```typescript
// INSERT IGNORE 사용
await queryRunner.query(`
    INSERT IGNORE INTO users (userId, password, name, email, phone, role, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
`, userData);

// 또는 사전 검사
const existingUsers = await queryRunner.query(`
    SELECT COUNT(*) as count FROM users WHERE userId IN (?)
`, [userIds]);

if (existingUsers[0].count > 0) {
    console.log('사용자가 이미 존재합니다.');
    return;
}
```

---

## 🧪 테스트 관련 오류

### 문제 10: 테스트 실행 시 서버 연결 실패
```
❌ Server is not running. Please start the server first
```

**발생 상황:**
`test-migration.js` 실행 시 서버가 실행되지 않음

**해결방법:**
1. **서버 실행 확인:**
```bash
# 서버 시작
npm run start:dev

# 다른 터미널에서 테스트
node test-migration.js
```

2. **테스트 스크립트의 포트 확인:**
```javascript
// test-migration.js
const API_BASE = 'http://localhost:3001/api/migration';  // 포트 확인
```

---

## 📊 데이터 검증 오류

### 문제 11: 사용자 데이터 검증 실패
```json
{
  "isValid": false,
  "errors": ["No admin users found", "Missing test users: ..."]
}
```

**발생 상황:**
데이터베이스에 필요한 테스트 사용자가 없음

**해결방법:**
```bash
# 1. 테스트 데이터 삭제
curl -X DELETE http://localhost:3001/api/migration/clear

# 2. 마이그레이션 되돌리기
npm run typeorm:migration:revert

# 3. 마이그레이션 재실행
npm run typeorm:migration:run

# 4. 검증
curl -X GET http://localhost:3001/api/migration/validate-users
```

---

## 🔍 디버깅 팁

### TypeScript 컴파일 오류 해결
```bash
# 1. 타입 체크
npm run build

# 2. 린트 검사
npm run lint

# 3. 의존성 확인
npm ls
```

### 데이터베이스 연결 확인
```bash
# MySQL 연결 테스트
mysql -h localhost -u phantom -p -e "SELECT 1"

# 데이터베이스 목록 확인
mysql -h localhost -u phantom -p -e "SHOW DATABASES"
```

### 마이그레이션 상태 확인
```bash
# 마이그레이션 상태 조회
npm run typeorm:migration:show

# 마이그레이션 파일 검증
npm run typeorm -- migration:show -d ormconfig.ts
```

### 네트워크 연결 확인
```bash
# 포트 사용 상태 확인
netstat -tulpn | grep :3001

# API 엔드포인트 테스트
curl -v http://localhost:3001/api/migration/status
```

---

## 🚀 성능 최적화

### 마이그레이션 속도 개선
```typescript
// 배치 처리 사용
const batchSize = 1000;
for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    // 배치 단위로 처리
}
```

### 메모리 사용량 최적화
```typescript
// 스트리밍 방식 사용
const stream = await queryRunner.stream(`
    SELECT * FROM large_table
`);

stream.on('data', (row) => {
    // 행별 처리
});
```

---

## 📝 로그 분석

### 일반적인 로그 패턴
```
[32m[Nest] 432  - [39m2025. 07. 26. 오후 3:47:47 [32m    LOG[39m [38;5;3m[NestFactory] [39m[32mStarting Nest application...[39m
```

### 오류 로그 식별
```
[31m[Nest] 432  - [39m2025. 07. 26. 오후 3:47:47 [31m  ERROR[39m [38;5;3m[NestApplication] [39m[31mError: listen EADDRINUSE
```

### 쿼리 로그 해석
```
[90m[4mquery:[24m[39m [94mSELECT[0m [95mVERSION[0m[37m([0m[37m)[0m [94mAS[0m [37m`version`[0m
```

---

## 🛠️ 예방 조치

### 1. 정기적인 검증
```bash
# 주기적으로 전체 테스트 실행
npm run db:full-test
```

### 2. 백업 및 복원
```bash
# 데이터베이스 백업
mysqldump -h localhost -u phantom -p node > backup.sql

# 복원
mysql -h localhost -u phantom -p node < backup.sql
```

### 3. 환경 분리
```bash
# 환경별 설정 파일 사용
NODE_ENV=development npm run start:dev
NODE_ENV=production npm run start:prod
```

---

## 📞 추가 지원

### 공식 문서
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### 커뮤니티 리소스
- [NestJS Discord](https://discord.gg/nestjs)
- [TypeORM GitHub Issues](https://github.com/typeorm/typeorm/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs)

### 로그 및 모니터링
- 애플리케이션 로그 파일 위치: `logs/`
- MySQL 로그: `/var/log/mysql/error.log`
- 시스템 리소스 모니터링 도구 활용