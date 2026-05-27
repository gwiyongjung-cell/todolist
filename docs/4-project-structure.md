# TodoList 앱 프로젝트 구조 설계 원칙

**버전**: 1.0
**작성일**: 2026-05-27
**작성자**: GWJung

---

## 1. 공통 최상위 원칙

### 1.1 단순성 원칙 (1인 개발, 2일 MVP 기준)

- 추상화 계층은 필요한 만큼만 만든다. 불필요한 인터페이스, 팩토리, 제네릭 래퍼를 금지한다.
- 디렉토리 중첩은 최대 3단계로 제한한다.
- 기능 확장보다 동작하는 코드 완성을 우선한다.
- 공통화는 중복이 3회 이상 발생한 시점에만 수행한다.

### 1.2 관심사 분리 원칙

- UI 렌더링, 서버 상태 관리, 비즈니스 로직, DB 접근은 각각 다른 계층에서 담당한다.
- 하나의 파일은 하나의 역할만 수행한다.
- 프론트엔드와 백엔드는 HTTP API 계약으로만 통신한다. 코드를 공유하지 않는다.

### 1.3 단방향 의존성 원칙

- 상위 계층은 하위 계층에만 의존한다. 역방향 의존은 금지한다.
- 프론트엔드: `UI 컴포넌트 → 상태/쿼리 훅 → API 호출 함수`
- 백엔드: `Route → Controller → Service → Repository → DB`
- 같은 계층 간 직접 호출은 허용하지 않는다 (예: Service에서 다른 Service 직접 호출 금지, 필요 시 Repository를 통해 처리).

---

## 2. 의존성/레이어 원칙

### 2.1 프론트엔드 레이어

| 레이어                           | 역할                                            | 기술                    |
| -------------------------------- | ----------------------------------------------- | ----------------------- |
| UI (pages, components, features) | 렌더링, 사용자 이벤트 처리                      | React 19, TypeScript    |
| 상태/쿼리 (stores, hooks)        | 클라이언트 상태 관리, 서버 데이터 fetching/캐싱 | Zustand, TanStack Query |
| API 호출 (api/)                  | HTTP 요청 함수, 에러 처리                       | fetch (내장)            |
| 다국어 (v2)                      | 다국어 번역 처리                                | react-i18next           |

- `pages`와 `features` 컴포넌트는 `stores`, `hooks`, `api`를 사용할 수 있다.
- `api/` 함수는 `stores`나 컴포넌트를 참조하지 않는다.
- `components/`의 공통 UI 컴포넌트는 `api`, `stores`를 직접 참조하지 않는다.

### 2.2 백엔드 레이어

| 레이어     | 역할                                            |
| ---------- | ----------------------------------------------- |
| Route      | URL 경로와 HTTP 메서드를 Controller 함수에 연결 |
| Controller | 요청 파싱, 응답 직렬화, 에러 처리               |
| Service    | 비즈니스 로직 (소유권 검증, 상태 전이 규칙 등)  |
| Repository | SQL 쿼리 실행, pg 풀 사용                       |
| DB         | PostgreSQL 17 연결 풀, 스키마 SQL               |

### 2.3 레이어 간 의존 방향 규칙

```
Route → Controller → Service → Repository → DB
```

- Controller는 Repository를 직접 호출하지 않는다. 반드시 Service를 경유한다.
- Repository는 Service나 Controller의 코드를 import하지 않는다.
- 역방향 의존(하위 → 상위)은 어떤 이유로도 허용하지 않는다.

### 2.4 공통 타입/인터페이스 위치

- 프론트엔드 공통 타입: `frontend/src/types/`
- 각 도메인별 타입은 해당 `features/<domain>/` 안에 위치시킬 수 있다.
- 백엔드는 JavaScript를 사용하므로 별도 타입 파일 없이 JSDoc 주석으로 타입을 명시한다.
- 프론트엔드와 백엔드 간 타입 코드 공유는 하지 않는다. API 응답 스펙을 기준으로 각각 독립적으로 정의한다.

---

## 3. 코드/네이밍 원칙

### 3.1 파일명 규칙

| 구분                     | 규칙                           | 예시                                     |
| ------------------------ | ------------------------------ | ---------------------------------------- |
| React 컴포넌트           | PascalCase                     | `TodoItem.tsx`, `CategoryList.tsx`       |
| 커스텀 훅                | camelCase, `use` 접두사        | `useTodos.ts`, `useAuthStore.ts`         |
| API 클라이언트 함수 파일 | camelCase                      | `todoApi.ts`, `authApi.ts`               |
| 서비스 (백엔드)          | camelCase, `Service` 접미사    | `todoService.js`, `authService.js`       |
| 레포지토리 (백엔드)      | camelCase, `Repository` 접미사 | `todoRepository.js`, `userRepository.js` |
| 컨트롤러 (백엔드)        | camelCase, `Controller` 접미사 | `todoController.js`, `authController.js` |
| 유틸 함수                | camelCase                      | `dateUtils.ts`, `hashUtils.js`           |
| 상수 파일                | camelCase                      | `statusConstants.ts`, `errorCodes.js`    |

### 3.2 함수/변수명 규칙

- 함수명과 변수명은 camelCase를 사용한다.
- 불리언 변수는 `is`, `has`, `can` 접두사를 사용한다 (예: `isLoading`, `hasError`).
- 비동기 함수는 동작을 명확히 표현한다 (예: `fetchTodos`, `createTodo`, `deleteTodo`).
- 약어 사용을 지양하고 의미를 알 수 있는 이름을 사용한다.

### 3.3 DB 컬럼명 규칙

- 모든 DB 컬럼명은 snake_case를 사용한다.
- 예: `user_id`, `category_id`, `start_date`, `end_date`, `created_at`, `updated_at`

### 3.4 API 경로 규칙

- RESTful 원칙을 따른다.
- 경로는 소문자 kebab-case를 사용한다.
- 리소스는 복수형 명사를 사용한다.
- 예: `/api/todos`, `/api/categories`, `/api/auth/login`, `/api/users/me/preferences`

### 3.5 상수/열거형 규칙

- 상수와 열거형 값은 SCREAMING_SNAKE_CASE를 사용한다.
- 예: `TODO`, `IN_PROGRESS`, `DONE`, `LIGHT`, `DARK`
- 백엔드 상수는 `constants/` 디렉토리에 모아서 관리한다.
- 프론트엔드 상수는 `constants/` 디렉토리에 모아서 관리한다.

---

## 4. 테스트/품질 원칙

### 4.1 1인 개발 현실에 맞는 최소 테스트 전략

- 100% 커버리지를 목표로 하지 않는다. 핵심 비즈니스 로직 보호에 집중한다.
- MVP 2일 일정 안에서 핵심 서비스 단위 테스트와 주요 API 통합 테스트만 작성한다.
- UI 컴포넌트 단위 테스트는 MVP 범위에서 제외한다.

### 4.2 핵심 비즈니스 로직 단위 테스트 우선 (백엔드 Service 레이어)

우선적으로 테스트해야 할 항목:

- `todoService`: 상태 전이 규칙 (완료 → 다른 상태 전이 불가), 소유권 검증, 날짜 유효성 검사 (종료일 >= 시작일)
- `categoryService`: 기본(DEFAULT) 카테고리 수정/삭제 방지, 소유권 검증
- `authService`: 비밀번호 암호화, 이중 이메일 등록 방지

### 4.3 API 통합 테스트 범위

다음 엔드포인트에 대한 성공/실패 케이스 통합 테스트를 작성한다:

- `POST /api/auth/register`: 정상 가입, 중복 이메일 거부
- `POST /api/auth/login`: 정상 로그인, 잘못된 비밀번호 거부
- `GET /api/todos`: 인증 없이 접근 시 401 반환
- `DELETE /api/todos/:id`: 타인 리소스 삭제 시도 시 403 반환
- `DELETE /api/categories/:id`: 기본 카테고리 삭제 시도 시 403 반환

---

## 5. 설정/보안/운영 원칙

### 5.1 환경변수 관리

- 모든 민감한 설정(DB 접속 정보, JWT 시크릿 등)은 `.env` 파일로 관리한다.
- `.env` 파일은 `.gitignore`에 등록하여 저장소에 커밋하지 않는다.
- `.env.example` 파일을 제공하여 필요한 환경변수 목록을 문서화한다.
- 환경변수는 `backend/src/config/env.js`에서 한 번만 로딩하고 검증한다. 다른 파일에서 `process.env`를 직접 참조하지 않는다.

#### 백엔드 환경변수 (`backend/.env`)

| 변수명           | 예시 값                 | 설명                                     |
| ---------------- | ----------------------- | ---------------------------------------- |
| `NODE_ENV`       | `development`           | 실행 환경 (`development` / `production`) |
| `PORT`           | `3000`                  | Express 서버 포트                        |
| `DB_HOST`        | `localhost`             | PostgreSQL 호스트                        |
| `DB_PORT`        | `5432`                  | PostgreSQL 포트                          |
| `DB_NAME`        | `todolist`              | 데이터베이스 이름                        |
| `DB_USER`        | `postgres`              | 데이터베이스 사용자                      |
| `DB_PASSWORD`    | `password`              | 데이터베이스 비밀번호                    |
| `JWT_SECRET`     | `your-secret-key`       | JWT 서명 시크릿 (32자 이상 권장)         |
| `JWT_EXPIRES_IN` | `24h`                   | JWT 만료 시간                            |
| `CORS_ORIGIN`    | `http://localhost:5173` | 허용할 프론트엔드 오리진                 |

#### 프론트엔드 환경변수 (`frontend/.env`)

| 변수명              | 예시 값                 | 설명                |
| ------------------- | ----------------------- | ------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000` | 백엔드 API 기본 URL |

### 5.2 비밀번호 암호화 원칙

- 비밀번호는 반드시 bcrypt로 해싱하여 저장한다. 평문 저장은 금지한다.
- bcrypt salt rounds는 10을 기본값으로 사용한다.
- 비밀번호 비교 시 `bcrypt.compare()`를 사용한다.

### 5.3 JWT 토큰 관리 원칙

- Access Token은 HTTP Authorization 헤더 (`Bearer <token>`)로 전달한다.
- 토큰 만료 시간은 `24h`로 설정한다 (MVP 기준).
- JWT 시크릿은 반드시 환경변수로 관리한다.
- 토큰 페이로드에는 `userId`와 `email`만 포함한다. 비밀번호 등 민감한 정보를 포함하지 않는다.
- 로그아웃은 클라이언트에서 토큰을 삭제하는 방식으로 처리한다.

### 5.4 CORS 설정 원칙

- 허용 오리진은 환경변수 `CORS_ORIGIN`으로 설정한다.
- 개발 환경: `http://localhost:5173` (Vite 기본 포트)
- 운영 환경: 실제 프론트엔드 도메인만 허용한다.
- `credentials: true`를 설정하여 인증 헤더 전달을 허용한다.

### 5.5 pg 연결 풀 관리

- `pg.Pool`을 사용하여 연결 풀을 생성하고 `backend/src/db/pool.js`에서 단일 인스턴스로 관리한다.
- 연결 풀 설정: `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 2000`
- 쿼리 실행 후 `client.release()`를 반드시 호출한다 (try/finally 블록 사용).
- DB 연결 정보(host, port, database, user, password)는 환경변수로 관리한다.

---

## 6. 디렉토리 구조

```
todolist/
├── frontend/                       # 프론트엔드 (React 19 + TypeScript)
│   ├── public/                     # 정적 파일
│   └── src/
│       ├── pages/                  # 라우트 단위 페이지 컴포넌트
│       │   ├── LoginPage.tsx       # 로그인 화면 (S-01)
│       │   ├── RegisterPage.tsx    # 회원가입 화면 (S-02)
│       │   ├── TodoListPage.tsx    # 할일 목록 화면 (S-03)
│       │   ├── TodoFormPage.tsx    # 할일 등록/수정 화면 (S-04, S-05)
│       │   ├── CategoryPage.tsx    # 카테고리 관리 화면 (S-06)
│       │   ├── ProfilePage.tsx     # 내 정보 수정 화면 (S-07)
│       │   └── SettingsPage.tsx    # 환경설정 화면 (S-08, v2)
│       ├── components/             # 도메인 무관 공통 UI 컴포넌트
│       │   ├── Button.tsx          # 공통 버튼
│       │   ├── Input.tsx           # 공통 입력 필드
│       │   ├── Modal.tsx           # 공통 모달
│       │   └── DatePicker.tsx      # 캘린더 날짜 선택
│       ├── features/               # 도메인별 기능 단위 컴포넌트 및 훅
│       │   ├── auth/               # 인증 관련 (로그인, 회원가입)
│       │   ├── todo/               # 할일 관련 (목록, 등록, 수정, 삭제)
│       │   ├── category/           # 카테고리 관련 (목록, 등록, 수정, 삭제)
│       │   └── settings/           # 환경설정 관련 (테마, 언어, v2)
│       ├── hooks/                  # 도메인 무관 공통 커스텀 훅
│       │   └── useDebounce.ts      # 디바운스 훅 (예시)
│       ├── stores/                 # Zustand 전역 상태 스토어
│       │   ├── authStore.ts        # 인증 상태 (token, user 정보)
│       │   └── uiStore.ts          # UI 상태 (테마, 언어)
│       ├── api/                    # TanStack Query + fetch 기반 API 클라이언트
│       │   ├── client.ts           # fetch 공통 설정 (baseURL, 인증 헤더)
│       │   ├── authApi.ts          # 인증 API 호출 함수
│       │   ├── todoApi.ts          # 할일 API 호출 함수
│       │   ├── categoryApi.ts      # 카테고리 API 호출 함수
│       │   └── userApi.ts          # 사용자 API 호출 함수
│       ├── types/                  # 공통 TypeScript 타입 정의
│       │   ├── auth.ts             # 인증 관련 타입
│       │   ├── todo.ts             # 할일 관련 타입
│       │   ├── category.ts         # 카테고리 관련 타입
│       │   └── user.ts             # 사용자 관련 타입
│       ├── utils/                  # 순수 유틸 함수 (부수효과 없음)
│       │   └── dateUtils.ts        # 날짜 포맷, 기한 초과 계산 등
│       ├── locales/                # 다국어 번역 파일 (v2, react-i18next)
│       │   ├── ko.json             # 한국어 번역
│       │   └── en.json             # 영어 번역
│       ├── i18n.ts                 # react-i18next 초기화 설정 (v2)
│       ├── constants/              # 앱 전역 상수
│       │   └── statusConstants.ts  # TODO, IN_PROGRESS, DONE 등 상수
│       ├── App.tsx                 # 라우터 설정 및 최상위 컴포넌트
│       └── main.tsx                # 앱 엔트리포인트
│
└── backend/                        # 백엔드 (Node.js + Express)
    └── src/
        ├── routes/                 # Express 라우터 (URL → Controller 연결)
        │   ├── authRoutes.js       # /api/auth 경로 라우터
        │   ├── userRoutes.js       # /api/users 경로 라우터
        │   ├── todoRoutes.js       # /api/todos 경로 라우터
        │   └── categoryRoutes.js   # /api/categories 경로 라우터
        ├── controllers/            # 요청 파싱 및 응답 처리
        │   ├── authController.js   # 회원가입, 로그인, 로그아웃 처리
        │   ├── userController.js   # 내 정보 조회/수정, 환경설정 처리
        │   ├── todoController.js   # 할일 CRUD 처리
        │   └── categoryController.js # 카테고리 CRUD 처리
        ├── services/               # 비즈니스 로직 (소유권 검증, 상태 전이 규칙 등)
        │   ├── authService.js      # 회원가입/로그인 비즈니스 로직
        │   ├── userService.js      # 사용자 정보 수정 비즈니스 로직
        │   ├── todoService.js      # 할일 비즈니스 로직 (상태 전이, 날짜 검증)
        │   └── categoryService.js  # 카테고리 비즈니스 로직 (기본 카테고리 보호)
        ├── repositories/           # SQL 쿼리 실행 (pg 직접 사용)
        │   ├── userRepository.js   # users 테이블 쿼리
        │   ├── todoRepository.js   # todos 테이블 쿼리
        │   └── categoryRepository.js # categories 테이블 쿼리
        ├── middlewares/            # Express 미들웨어
        │   ├── authMiddleware.js   # JWT 검증 및 req.user 주입
        │   └── errorMiddleware.js  # 전역 에러 핸들러
        ├── db/                     # PostgreSQL 연결 및 스키마
        │   ├── pool.js             # pg.Pool 단일 인스턴스 생성 및 export
        │   └── schema.sql          # 테이블 생성 SQL (users, categories, todos)
        ├── utils/                  # 공통 유틸 함수
        │   ├── hashUtils.js        # bcrypt 해싱/비교 함수
        │   └── jwtUtils.js         # JWT 생성/검증 함수
        ├── constants/              # 앱 전역 상수
        │   └── statusConstants.js  # TODO, IN_PROGRESS, DONE, LIGHT, DARK 등
        ├── config/                 # 환경변수 로딩 및 검증
        │   └── env.js              # process.env 로딩, 필수값 검증 후 export
        └── app.js                  # Express 앱 설정 (미들웨어, 라우터 등록)
```
