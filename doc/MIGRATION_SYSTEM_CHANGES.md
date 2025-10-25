# 마이그레이션 시스템 변경사항 문서

## 📋 개요
이 문서는 NestJS 프로젝트의 자동 DB 생성 및 테스트 가능한 마이그레이션 시스템 구축 과정에서 수행된 모든 변경사항을 기록합니다.

## 🔧 주요 변경사항

### 1. 프로젝트 구조 개선

#### 새로 추가된 파일들
```
src/
├── database/                    # 새로 추가된 데이터베이스 관리 모듈
│   ├── database.module.ts       # 데이터베이스 모듈 설정
│   ├── database.service.ts      # 마이그레이션 핵심 서비스
│   ├── database.service.spec.ts # 데이터베이스 서비스 테스트
│   ├── migration.service.ts     # 마이그레이션 관리 서비스
│   ├── migration.service.spec.ts# 마이그레이션 서비스 테스트
│   ├── test-data.service.ts     # 테스트 데이터 관리 서비스
│   ├── test-data.service.spec.ts# 테스트 데이터 서비스 테스트
│   └── migration.controller.ts  # 마이그레이션 API 컨트롤러
├── migrations/                  # 마이그레이션 파일들
│   ├── 1722000000000-InitialMigration.ts
│   └── 1722000001000-AddTestUsers.ts
```

#### 루트 레벨 파일들
```
ormconfig.ts                     # TypeORM CLI 설정
create-database.js               # 데이터베이스 자동 생성 스크립트
test-migration.js                # 마이그레이션 테스트 스크립트
verify-passwords.js              # 비밀번호 검증 스크립트
README-MIGRATION.md              # 마이그레이션 가이드
```

### 2. TypeORM 설정 개선

#### app.module.ts 변경사항
```typescript
// 기존
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'phantom',
  password: 'ehy1123?',
  database: 'node',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: true,
}),

// 개선 후
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'phantom',
  password: process.env.DB_PASSWORD || 'ehy1123?',
  database: process.env.DB_NAME || 'node',
  entities: [User],
  migrations: ['dist/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrationsRun: false,
  migrationsTableName: 'migrations_history',
}),
```

**주요 개선점:**
- 환경 변수 지원 추가
- 타입 안전성 개선 (`parseInt(process.env.DB_PORT || '3306')`)
- 명시적 엔티티 등록
- 마이그레이션 테이블 이름 지정
- ConfigModule 전역 설정 추가

#### ormconfig.ts 신규 추가
```typescript
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
```

### 3. 엔티티 개선

#### User 엔티티 업데이트
```typescript
// 추가된 필드들
@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;
```

### 4. 마이그레이션 파일 생성

#### InitialMigration (1722000000000-InitialMigration.ts)
- Users 테이블 생성
- 인덱스 설정 (userId 유니크, email 일반)
- 컬럼 제약조건 설정
- 타임스탬프 필드 추가

**수정된 부분:**
- TableIndex 올바른 사용법 적용
- MySQL enum default 값 문법 수정 (`default: "'USER'"`)

#### AddTestUsers (1722000001000-AddTestUsers.ts)
- 6명의 테스트 사용자 추가
- 중복 삽입 방지 로직
- 평문 비밀번호 저장 (bcrypt 제거)
- 에러 핸들링 추가

**테스트 사용자 정보:**
```
admin     - admin123!  (ADMIN)
testuser1 - user123!   (USER)
testuser2 - user123!   (USER)
testuser3 - user123!   (USER)
developer - dev123!    (USER)
tester    - test123!   (USER)
```

### 5. 서비스 계층 구현

#### DatabaseService
- 자동 데이터베이스 초기화
- 마이그레이션 실행/되돌리기
- 데이터베이스 상태 확인
- 스키마 동기화 (개발환경에서만)

#### MigrationService
- 마이그레이션 상태 조회
- 특정 마이그레이션까지 실행
- 사용자 데이터 검증
- 마이그레이션 테스트 실행

#### TestDataService  
- 테스트 데이터 자동 생성
- 데이터 정리 기능
- 사용자별 데이터 생성
- 데이터베이스 통계 조회

### 6. package.json 스크립트 추가

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "typeorm:migration:generate": "npm run typeorm -- migration:generate -d ormconfig.ts",
    "typeorm:migration:create": "npm run typeorm -- migration:create",
    "typeorm:migration:run": "npm run typeorm -- migration:run -d ormconfig.ts",
    "typeorm:migration:revert": "npm run typeorm -- migration:revert -d ormconfig.ts",
    "typeorm:schema:sync": "npm run typeorm -- schema:sync -d ormconfig.ts",
    "typeorm:schema:drop": "npm run typeorm -- schema:drop -d ormconfig.ts",
    "db:init": "npm run build && npm run typeorm:migration:run",
    "db:reset": "npm run typeorm:schema:drop && npm run typeorm:migration:run",
    "db:seed": "curl -X POST http://localhost:3001/api/migration/seed",
    "db:test": "curl -X POST http://localhost:3001/api/migration/test",
    "db:validate": "curl -X GET http://localhost:3001/api/migration/validate-users",
    "db:full-test": "curl -X POST http://localhost:3001/api/migration/full-test",
    "db:status": "curl -X GET http://localhost:3001/api/migration/migrations",
    "migration:test": "node test-migration.js"
  }
}
```

### 7. 의존성 추가

```json
{
  "dependencies": {
    "@nestjs/config": "^4.0.2"
  }
}
```

### 8. 서버 설정 개선

#### main.ts 변경사항
```typescript
// 기존
await app.listen(3001);

// 개선 후  
await app.listen(process.env.PORT || 3001);
```

## 🐛 해결된 문제들

### 1. TypeScript 컴파일 오류
- **문제**: 환경 변수 타입 안전성 오류
- **해결**: `parseInt(process.env.DB_PORT || '3306')` 방식으로 수정

### 2. TypeORM Index 생성 오류
- **문제**: `new Index()` 사용법 오류
- **해결**: `new TableIndex()` 올바른 사용법 적용

### 3. MySQL enum default 값 오류
- **문제**: `default: "USER"` 문법 오류
- **해결**: `default: "'USER'"` 올바른 문법 적용

### 4. bcrypt 모듈 호환성 문제
- **문제**: 바이너리 호환성 오류
- **해결**: 모듈 재설치로 해결

### 5. 데이터베이스 존재하지 않음 오류
- **문제**: 'node' 데이터베이스 미존재
- **해결**: `create-database.js` 스크립트로 자동 생성

## 🚀 성능 및 안정성 개선

### 1. 중복 방지
- `INSERT IGNORE` 구문 사용
- 사용자 존재 여부 사전 검사

### 2. 에러 핸들링
- try-catch 구문 적용
- 상세한 에러 메시지 제공

### 3. 로깅 개선
- 각 단계별 로그 출력
- 성공/실패 상태 명확히 구분

### 4. 테스트 커버리지
- 모든 서비스에 대한 단위 테스트 추가
- 마이그레이션 통합 테스트 구현

## 📊 최종 결과

### 데이터베이스 구조
```sql
CREATE TABLE users (
  mbrId int PRIMARY KEY AUTO_INCREMENT,
  userId varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  phone varchar(20) NOT NULL,
  role enum('USER', 'ADMIN') DEFAULT 'USER' NOT NULL,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IDX_USERS_USERID ON users (userId);
CREATE INDEX IDX_USERS_EMAIL ON users (email);
```

### 테스트 결과
- ✅ 데이터베이스 초기화: 성공
- ✅ 마이그레이션 실행: 2개 완료
- ✅ 테스트 사용자 생성: 6명 성공
- ✅ 평문 비밀번호 저장: 확인됨
- ✅ API 엔드포인트: 정상 작동

## 🔄 향후 개선 계획

1. **보안 강화**: 프로덕션 환경에서 비밀번호 암호화 적용
2. **환경 분리**: 개발/테스트/프로덕션 환경별 설정 분리
3. **모니터링**: 마이그레이션 실행 히스토리 모니터링
4. **자동화**: CI/CD 파이프라인과 연동