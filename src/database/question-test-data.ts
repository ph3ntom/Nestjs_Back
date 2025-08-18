export const questionTestData = [
  {
    title: 'NestJS에서 TypeORM을 사용한 데이터베이스 연결 방법',
    description: `NestJS 프로젝트에서 TypeORM을 사용해서 MySQL 데이터베이스에 연결하는 방법을 알고 싶습니다.

다음과 같은 설정을 사용했는데 제대로 작동하지 않습니다:

\`\`\`typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'test',
  entities: [User],
  synchronize: true,
})
\`\`\`

어떤 부분이 문제일까요?`,
    tags: ['nestjs', 'typeorm', 'mysql', 'database'],
    mbrId: 1,
    votes: 5,
    views: 150,
  },
  {
    title: 'React와 NestJS CORS 설정 문제',
    description: `React 프론트엔드에서 NestJS 백엔드로 요청을 보낼 때 CORS 오류가 발생합니다.

\`\`\`
Access to fetch at 'http://localhost:3000/api/users' from origin 'http://localhost:3001' has been blocked by CORS policy
\`\`\`

NestJS에서 CORS를 어떻게 설정해야 하나요?`,
    tags: ['react', 'nestjs', 'cors', 'frontend'],
    mbrId: 2,
    votes: 12,
    views: 280,
  },
  {
    title: 'JWT 토큰 인증 구현 방법',
    description: `NestJS에서 JWT 기반 인증 시스템을 구현하고 싶습니다.

로그인 시 JWT 토큰을 발급하고, 보호된 라우트에서 토큰을 검증하는 방법을 알려주세요.

Guard와 Strategy를 어떻게 설정해야 하는지 궁금합니다.`,
    tags: ['jwt', 'authentication', 'security', 'guard'],
    mbrId: 1,
    votes: 8,
    views: 320,
  },
  {
    title: 'TypeScript에서 Generic 타입 활용법',
    description: `TypeScript의 Generic을 사용해서 재사용 가능한 함수를 만들고 싶습니다.

특히 API 응답 타입을 Generic으로 정의하는 방법이 궁금합니다.

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
\`\`\`

이런 식으로 정의하는 게 맞나요?`,
    tags: ['typescript', 'generic', 'types', 'api'],
    mbrId: 3,
    votes: 15,
    views: 450,
  },
  {
    title: 'Docker를 사용한 NestJS 애플리케이션 배포',
    description: `NestJS 애플리케이션을 Docker 컨테이너로 배포하고 싶습니다.

Dockerfile 작성법과 docker-compose.yml 설정 방법을 알려주세요.

데이터베이스와 연결하는 부분도 포함해서 설명해주시면 감사하겠습니다.`,
    tags: ['docker', 'deployment', 'nestjs', 'devops'],
    mbrId: 2,
    votes: 6,
    views: 200,
  },
  {
    title: 'GraphQL과 REST API 차이점과 선택 기준',
    description: `새로운 프로젝트를 시작하는데 GraphQL과 REST API 중 어떤 것을 선택해야 할지 고민입니다.

각각의 장단점과 언제 어떤 것을 사용하는 게 좋은지 알려주세요.

특히 팀의 학습 곡선과 프로젝트 복잡도를 고려했을 때 어떤 기준으로 선택해야 하나요?`,
    tags: ['graphql', 'rest', 'api', 'architecture'],
    mbrId: 1,
    votes: 20,
    views: 600,
  },
  {
    title: 'Redis를 사용한 캐싱 전략',
    description: `NestJS 애플리케이션에서 Redis를 사용해서 캐싱을 구현하고 싶습니다.

어떤 데이터를 캐시해야 하고, TTL은 어떻게 설정하는 게 좋을까요?

Cache-Aside, Write-Through, Write-Behind 패턴 중 어떤 것을 선택해야 하나요?`,
    tags: ['redis', 'caching', 'performance', 'database'],
    mbrId: 3,
    votes: 9,
    views: 180,
  },
  {
    title: '마이크로서비스 아키텍처 설계 방법',
    description: `단일 애플리케이션을 마이크로서비스로 분할하려고 합니다.

서비스 간 통신 방법과 데이터 일관성을 어떻게 보장해야 하나요?

NestJS에서 마이크로서비스를 구현하는 모범 사례가 있나요?`,
    tags: ['microservices', 'architecture', 'distributed', 'design'],
    mbrId: 2,
    votes: 18,
    views: 520,
  },
  {
    title: '단위 테스트와 통합 테스트 작성법',
    description: `NestJS 애플리케이션에서 Jest를 사용해서 테스트를 작성하고 있습니다.

Service와 Controller의 단위 테스트는 어떻게 작성해야 하고,
데이터베이스를 포함한 통합 테스트는 어떻게 설정해야 하나요?

Mock 객체 사용법도 알려주세요.`,
    tags: ['testing', 'jest', 'unit-test', 'integration-test'],
    mbrId: 1,
    votes: 11,
    views: 380,
  },
  {
    title: '웹소켓을 사용한 실시간 채팅 구현',
    description: `NestJS에서 Socket.IO를 사용해서 실시간 채팅 기능을 구현하고 싶습니다.

여러 방(Room)을 만들고, 사용자가 특정 방에 입장/퇴장할 수 있는 기능이 필요합니다.

Gateway 설정과 클라이언트 연결 관리 방법을 알려주세요.`,
    tags: ['websocket', 'socket.io', 'realtime', 'chat'],
    mbrId: 3,
    votes: 14,
    views: 420,
  },
];

export const answerTestData = [
  // Question 1에 대한 답변들
  {
    questionId: 1,
    content: `TypeORM 설정에서 몇 가지 수정이 필요합니다:

\`\`\`typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'test',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 엔티티 경로 수정
  synchronize: true, // 프로덕션에서는 false로 설정
  logging: true, // 디버깅용
})
\`\`\`

또한 package.json에 mysql2 드라이버가 설치되어 있는지 확인하세요:
\`npm install mysql2\``,
    mbrId: 2,
    votes: 8,
    accepted: true,
  },
  {
    questionId: 1,
    content: `추가로 환경변수를 사용하는 것을 권장합니다:

\`\`\`typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: process.env.NODE_ENV !== 'production',
  }),
})
\`\`\``,
    mbrId: 3,
    votes: 5,
    accepted: false,
  },

  // Question 2에 대한 답변들
  {
    questionId: 2,
    content: `main.ts에서 CORS를 활성화하세요:

\`\`\`typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
\`\`\`

또는 모든 origin을 허용하려면:
\`app.enableCors();\``,
    mbrId: 1,
    votes: 15,
    accepted: true,
  },

  // Question 3에 대한 답변들
  {
    questionId: 3,
    content: `JWT 인증 구현 단계:

1. 필요한 패키지 설치:
\`npm install @nestjs/jwt @nestjs/passport passport passport-jwt\`

2. JWT 모듈 설정:
\`\`\`typescript
JwtModule.register({
  secret: 'your-secret-key',
  signOptions: { expiresIn: '1h' },
})
\`\`\`

3. JWT Strategy 구현:
\`\`\`typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
\`\`\``,
    mbrId: 2,
    votes: 12,
    accepted: true,
  },

  // Question 4에 대한 답변들
  {
    questionId: 4,
    content: `네, 올바른 Generic 정의입니다! 몇 가지 개선사항을 제안드립니다:

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp?: Date;
}

// 사용 예시
interface User {
  id: number;
  name: string;
  email: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: 'John', email: 'john@example.com' },
  status: 200,
  message: 'Success'
};

// 배열 타입도 가능
const usersResponse: ApiResponse<User[]> = {
  data: [user1, user2, user3],
  status: 200,
  message: 'Users fetched successfully'
};
\`\`\``,
    mbrId: 1,
    votes: 18,
    accepted: true,
  },

  // Question 5에 대한 답변들
  {
    questionId: 5,
    content: `Docker 설정 예시:

**Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
\`\`\`

**docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=password
      - DB_NAME=testdb
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=testdb
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
\`\`\``,
    mbrId: 3,
    votes: 10,
    accepted: true,
  },
];
