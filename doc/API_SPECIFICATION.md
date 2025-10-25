# 마이그레이션 API 명세서

## 📋 개요
이 문서는 NestJS 마이그레이션 시스템의 REST API 명세를 제공합니다.

**Base URL**: `http://localhost:3001/api` (기본 포트, 환경에 따라 변경 가능)

## 🔐 인증
현재 버전에서는 인증이 필요하지 않습니다. (개발/테스트 환경용)

## 📊 응답 형식

### 성공 응답
```json
{
  "success": true,
  "message": "작업 완료 메시지",
  "data": { /* 응답 데이터 */ }
}
```

### 실패 응답
```json
{
  "success": false,
  "message": "오류 메시지",
  "error": "상세 오류 정보"
}
```

## 🚀 API 엔드포인트

### 1. 데이터베이스 관리

#### 1.1 데이터베이스 초기화
**마이그레이션을 실행하여 데이터베이스를 초기화합니다.**

```http
POST /migration/init
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

**에러 응답:**
```json
{
  "success": false,
  "message": "Database initialization failed",
  "error": "Connection timeout"
}
```

---

#### 1.2 마이그레이션 실행
**대기 중인 모든 마이그레이션을 실행합니다.**

```http
POST /migration/run
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Migrations executed successfully"
}
```

---

#### 1.3 마이그레이션 되돌리기
**마지막 마이그레이션을 되돌립니다.**

```http
POST /migration/revert
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Migration reverted successfully"
}
```

---

#### 1.4 데이터베이스 상태 확인
**데이터베이스 연결 상태와 통계 정보를 조회합니다.**

```http
GET /migration/status
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "database": {
      "isConnected": true,
      "pendingMigrations": false,
      "lastMigration": "AddTestUsers1722000001000"
    },
    "statistics": {
      "totalUsers": 6,
      "adminUsers": 1,
      "regularUsers": 5
    }
  }
}
```

---

### 2. 마이그레이션 관리

#### 2.1 마이그레이션 상태 조회
**실행된 마이그레이션과 대기 중인 마이그레이션 목록을 조회합니다.**

```http
GET /migration/migrations
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "executed": [
      {
        "name": "InitialMigration1722000000000",
        "timestamp": "1722000000000"
      },
      {
        "name": "AddTestUsers1722000001000", 
        "timestamp": "1722000001000"
      }
    ],
    "pending": []
  }
}
```

---

#### 2.2 특정 마이그레이션까지 실행
**지정된 마이그레이션까지만 실행합니다.**

```http
POST /migration/run-to/{migrationName}
```

**Parameters:**
- `migrationName` (path): 실행할 마이그레이션 이름

**예시:**
```http
POST /migration/run-to/AddTestUsers1722000001000
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Migrations executed up to AddTestUsers1722000001000"
}
```

---

#### 2.3 마이그레이션 테스트
**모든 마이그레이션을 테스트하고 결과를 반환합니다.**

```http
POST /migration/test
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "migration": "InitialMigration1722000000000",
        "status": "skipped",
        "message": "Migration already executed",
        "duration": 0
      },
      {
        "migration": "AddTestUsers1722000001000",
        "status": "skipped", 
        "message": "Migration already executed",
        "duration": 0
      }
    ],
    "summary": {
      "total": 2,
      "executed": 0,
      "failed": 0,
      "skipped": 2
    }
  },
  "message": "All migrations tested successfully"
}
```

---

### 3. 테스트 데이터 관리

#### 3.1 테스트 데이터 생성
**사전 정의된 테스트 사용자를 생성합니다.**

```http
POST /migration/seed
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Test data seeded successfully"
}
```

**생성되는 테스트 사용자:**
- `admin` (admin123!) - 관리자
- `testuser1` (user123!) - 일반 사용자
- `testuser2` (user123!) - 일반 사용자  
- `testuser3` (user123!) - 일반 사용자
- `developer` (dev123!) - 일반 사용자
- `tester` (test123!) - 일반 사용자

---

#### 3.2 테스트 데이터 삭제
**모든 테스트 데이터를 삭제합니다.**

```http
DELETE /migration/clear
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Test data cleared successfully"
}
```

---

### 4. 데이터 검증

#### 4.1 사용자 데이터 검증
**데이터베이스의 사용자 데이터 무결성을 검사합니다.**

```http
GET /migration/validate-users
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 6,
    "adminUsers": 1,
    "regularUsers": 5,
    "testUsers": [
      "admin",
      "developer", 
      "tester",
      "testuser1",
      "testuser2",
      "testuser3"
    ],
    "isValid": true,
    "errors": []
  },
  "message": "User data is valid"
}
```

**검증 실패 시:**
```json
{
  "success": false,
  "data": {
    "totalUsers": 3,
    "adminUsers": 0,
    "regularUsers": 3,
    "testUsers": ["testuser1"],
    "isValid": false,
    "errors": [
      "No admin users found",
      "Missing test users: admin, testuser2, testuser3, developer, tester"
    ]
  },
  "message": "User data validation failed"
}
```

---

### 5. 통합 테스트

#### 5.1 전체 데이터베이스 테스트
**데이터베이스 초기화, 마이그레이션, 검증을 한 번에 수행합니다.**

```http
POST /migration/full-test
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "migrations": {
      "success": true,
      "results": [/* 마이그레이션 테스트 결과 */],
      "summary": {
        "total": 2,
        "executed": 0,
        "failed": 0,
        "skipped": 2
      }
    },
    "userValidation": {
      "totalUsers": 6,
      "adminUsers": 1,
      "regularUsers": 5,
      "testUsers": ["admin", "developer", "tester", "testuser1", "testuser2", "testuser3"],
      "isValid": true,
      "errors": []
    },
    "databaseHealth": {
      "isConnected": true,
      "pendingMigrations": false,
      "lastMigration": "AddTestUsers1722000001000"
    }
  },
  "message": "Full database test completed successfully"
}
```

---

### 6. 개발자 도구

#### 6.1 스키마 동기화 (개발환경에서만)
**엔티티 정의와 데이터베이스 스키마를 동기화합니다.**

```http
POST /migration/sync
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Schema synchronized successfully"
}
```

**프로덕션 환경에서의 응답:**
```json
{
  "success": false,
  "message": "Schema synchronization failed",
  "error": "Schema synchronization is not allowed in production"
}
```

---

## 🔨 CLI 명령어와 API의 연동

### npm 스크립트를 통한 API 호출
```bash
# 데이터베이스 초기화
npm run db:init

# 테스트 데이터 생성  
npm run db:seed

# 사용자 데이터 검증
npm run db:validate

# 마이그레이션 테스트
npm run db:test

# 전체 테스트
npm run db:full-test

# 마이그레이션 상태 확인
npm run db:status

# 통합 테스트 스크립트
npm run migration:test
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 초기 설정
```bash
# 1. 데이터베이스 초기화
curl -X POST http://localhost:3001/api/migration/init

# 2. 테스트 데이터 생성
curl -X POST http://localhost:3001/api/migration/seed

# 3. 상태 확인
curl -X GET http://localhost:3001/api/migration/status
```

### 시나리오 2: 마이그레이션 관리
```bash
# 1. 마이그레이션 상태 확인
curl -X GET http://localhost:3001/api/migration/migrations

# 2. 마이그레이션 테스트
curl -X POST http://localhost:3001/api/migration/test

# 3. 마이그레이션 되돌리기
curl -X POST http://localhost:3001/api/migration/revert
```

### 시나리오 3: 데이터 검증
```bash
# 1. 사용자 데이터 검증
curl -X GET http://localhost:3001/api/migration/validate-users

# 2. 전체 테스트
curl -X POST http://localhost:3001/api/migration/full-test
```

---

## ⚠️ 주의사항

### 프로덕션 환경
- `POST /migration/sync` 엔드포인트는 프로덕션에서 사용 금지
- 테스트 데이터 생성/삭제 기능은 개발환경에서만 사용 권장

### 보안
- 현재 인증 시스템이 없으므로 프로덕션 배포 전 보안 검토 필요
- 데이터베이스 자격 증명은 환경 변수로 관리

### 성능
- 대용량 데이터베이스에서는 마이그레이션 시간이 오래 걸릴 수 있음
- `full-test` 엔드포인트는 전체 시스템 검사로 시간이 소요됨

---

## 📞 문제 해결

### 일반적인 오류
- **Connection timeout**: 데이터베이스 연결 설정 확인
- **Migration failed**: 마이그레이션 파일 문법 검토  
- **Port already in use**: 서버 포트 충돌 확인

### 디버깅
- 로그 레벨을 `debug`로 설정하여 상세 정보 확인
- 각 API 응답의 `error` 필드에서 상세 오류 정보 확인