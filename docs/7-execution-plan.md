# TodoList 앱 실행 계획

**작성일**: 2026-05-28  
**기반 문서**: PRD v1.1, 도메인 정의서 v2.1, ERD v1.0, 프로젝트 구조 v1.0  
**개발 일정**: 2일 (MVP)

---

## 전체 Task 의존성 맵

```
[DB-01] ──┐
[DB-02] ──┤──▶ [BE-01] ──▶ [BE-02] ──▶ [BE-03] ──┐
[DB-03] ──┘                              [BE-04] ──┤──▶ [BE-07]
                                         [BE-05] ──┤
                                         [BE-06] ──┘
                                                    │
                                                    ▼
                          [FE-01] ──▶ [FE-02] ──▶ [FE-03] ──▶ [FE-04]
                                                    │            │
                                                    ▼            ▼
                                                 [FE-05]      [FE-06]
                                                    │            │
                                                    └─────┬──────┘
                                                          ▼
                                                       [FE-07]
                                                          │
                                                          ▼
                                                       [FE-08] (v2)
```

---

## PHASE 1: 데이터베이스

### DB-01. PostgreSQL 스키마 생성

**목표**: `users`, `categories`, `todos` 테이블 생성  
**의존성**: 없음

#### 완료 조건 체크리스트

- [x] `todolist` 데이터베이스 생성 확인
- [x] `theme` ENUM 타입 (`LIGHT`, `DARK`) 생성
- [x] `todo_status` ENUM 타입 (`TODO`, `IN_PROGRESS`, `DONE`) 생성
- [x] `users` 테이블 생성
  - [x] `id` (UUID PK, DEFAULT gen_random_uuid())
  - [x] `email` (VARCHAR(255) UNIQUE NOT NULL)
  - [x] `password` (VARCHAR(255) NOT NULL)
  - [x] `name` (VARCHAR(100) NOT NULL)
  - [x] `theme` (ENUM, DEFAULT 'LIGHT', NOT NULL)
  - [x] `language` (VARCHAR(10), DEFAULT 'ko', NOT NULL)
  - [x] `created_at` (TIMESTAMPTZ NOT NULL)
  - [x] `updated_at` (TIMESTAMPTZ NOT NULL)
- [x] `categories` 테이블 생성
  - [x] `id` (UUID PK)
  - [x] `user_id` (UUID FK → users.id, NULL 허용)
  - [x] `name` (VARCHAR(100) NOT NULL)
  - [x] `created_at` (TIMESTAMPTZ NOT NULL)
- [x] `todos` 테이블 생성
  - [x] `id` (UUID PK)
  - [x] `user_id` (UUID FK → users.id, NOT NULL)
  - [x] `category_id` (UUID FK → categories.id, NOT NULL)
  - [x] `title` (VARCHAR(255) NOT NULL)
  - [x] `description` (TEXT NULL 허용)
  - [x] `start_date` (DATE NULL 허용)
  - [x] `end_date` (DATE NULL 허용)
  - [x] `status` (ENUM DEFAULT 'TODO', NOT NULL)
  - [x] `created_at` (TIMESTAMPTZ NOT NULL)
  - [x] `updated_at` (TIMESTAMPTZ NOT NULL)
  - [x] CHECK 제약 `end_date >= start_date` (양쪽 NULL 허용 시 제외)
- [x] `backend/src/db/schema.sql` 파일로 저장

---

### DB-02. 기본 카테고리 초기 데이터 삽입

**목표**: `user_id = NULL`인 시스템 전역 '기본(DEFAULT)' 카테고리 삽입  
**의존성**: DB-01 완료

#### 완료 조건 체크리스트

- [x] `categories` 테이블에 `user_id = NULL`, `name = '기본'` 레코드 삽입 SQL 작성
- [x] 중복 삽입 방지 (`ON CONFLICT DO NOTHING` 또는 INSERT IF NOT EXISTS)
- [x] `backend/src/db/schema.sql` 또는 별도 `seed.sql`에 포함

---

### DB-03. pg 연결 풀 설정

**목표**: `backend/src/db/pool.js` 싱글턴 연결 풀 구성  
**의존성**: DB-01 완료

#### 완료 조건 체크리스트

- [x] `backend/src/db/pool.js` 파일 생성
- [x] `pg.Pool` 인스턴스 생성: `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 2000`
- [x] DB 연결 정보 (`host`, `port`, `database`, `user`, `password`)를 환경변수에서 로딩
- [x] `pool` 싱글턴 export
- [x] `backend/.env.example` 파일에 필수 환경변수 목록 작성 (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)

---

## PHASE 2: 백엔드

### BE-01. 프로젝트 기반 설정

**목표**: Express 앱 초기 구조 및 공통 설정 구성  
**의존성**: DB-03 완료

#### 완료 조건 체크리스트

- [x] `backend/` 디렉토리 `npm init` 및 의존성 설치 (`express`, `pg`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`)
- [x] `backend/src/config/env.js` 작성
  - [x] `process.env` 로딩 및 필수값 검증 (없으면 프로세스 종료)
  - [x] `NODE_ENV`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` 포함
- [x] `backend/src/utils/hashUtils.js` 작성 (`bcrypt` 해싱/비교 함수)
- [x] `backend/src/utils/jwtUtils.js` 작성 (JWT 생성/검증 함수)
- [x] `backend/src/constants/statusConstants.js` 작성 (`TODO`, `IN_PROGRESS`, `DONE`, `LIGHT`, `DARK`)
- [x] `backend/src/middlewares/errorMiddleware.js` 작성 (전역 에러 핸들러)
- [x] `backend/src/app.js` 작성 (CORS, JSON 파싱, 라우터 등록, 에러 미들웨어 등록)
- [x] `backend/src/index.js` 진입점 작성 (서버 listen)
- [x] `node backend/src/index.js` 실행 시 서버가 정상 기동됨

---

### BE-02. 인증 미들웨어 구현

**목표**: JWT 검증 미들웨어 (`req.user` 주입)  
**의존성**: BE-01 완료

#### 완료 조건 체크리스트

- [x] `backend/src/middlewares/authMiddleware.js` 작성
  - [x] `Authorization: Bearer <token>` 헤더 파싱
  - [x] 토큰 없거나 유효하지 않으면 `401` 반환
  - [x] 유효한 토큰이면 `req.user = { userId, email }` 주입 후 `next()` 호출
- [x] 인증 없이 보호된 라우트 접근 시 `401` 반환 검증

---

### BE-03. 인증 API 구현 (UC-01, UC-02, UC-11)

**목표**: 회원가입, 로그인, 로그아웃 API  
**의존성**: BE-01, BE-02 완료

#### 완료 조건 체크리스트

- [x] `backend/src/repositories/userRepository.js` 작성
  - [x] `findByEmail(email)` — 이메일로 사용자 조회
  - [x] `create({ email, password, name })` — 사용자 생성 (theme, language 기본값 적용)
  - [x] `findById(id)` — ID로 사용자 조회
  - [x] `update(id, fields)` — 사용자 정보 수정 (name, password, theme, language)
- [x] `backend/src/services/authService.js` 작성
  - [x] `register({ email, password, name })`: 이메일 중복 검사 → bcrypt 해싱 → DB 저장
  - [x] `login({ email, password })`: 사용자 조회 → 비밀번호 비교 → JWT 생성 반환
- [x] `backend/src/controllers/authController.js` 작성
  - [x] `POST /api/auth/register` → 201 또는 409(중복 이메일)
  - [x] `POST /api/auth/login` → 200 + JWT 또는 401
  - [x] `POST /api/auth/logout` → 200 (클라이언트 측 토큰 삭제 방식)
- [x] `backend/src/routes/authRoutes.js` 작성
- [x] 통합 테스트
  - [x] 정상 회원가입 → 201 반환
  - [x] 중복 이메일 회원가입 → 409 반환
  - [x] 정상 로그인 → 200 + JWT 반환
  - [x] 잘못된 비밀번호 로그인 → 401 반환

---

### BE-04. 사용자 API 구현 (UC-03, UC-12, UC-13)

**목표**: 내 정보 수정 및 환경설정 API  
**의존성**: BE-02, BE-03 완료 (userRepository 재사용)

#### 완료 조건 체크리스트

- [x] `backend/src/services/userService.js` 작성
  - [x] `updateProfile(userId, { name, password })`: 비밀번호 변경 시 bcrypt 해싱
  - [x] `updatePreferences(userId, { theme, language })`: theme 유효값(LIGHT/DARK) 검증
  - [x] `getProfile(userId)`: 사용자 정보 조회 (비밀번호 필드 제외)
- [x] `backend/src/controllers/userController.js` 작성
  - [x] `GET /api/users/me` → 200 + 사용자 정보 (theme, language 포함)
  - [x] `PATCH /api/users/me` → 200
  - [x] `PATCH /api/users/me/preferences` → 200, 유효하지 않은 theme 값이면 400
- [x] `backend/src/routes/userRoutes.js` 작성 (모두 authMiddleware 적용)

---

### BE-05. 카테고리 API 구현 (UC-08, UC-09, UC-10)

**목표**: 카테고리 CRUD API (기본 카테고리 보호 포함)  
**의존성**: BE-02 완료

#### 완료 조건 체크리스트

- [x] `backend/src/repositories/categoryRepository.js` 작성
  - [x] `findAllByUser(userId)`: 시스템 기본 카테고리(user_id IS NULL) + 사용자 카테고리 조회
  - [x] `findById(id)`: 단건 조회
  - [x] `create({ userId, name })`: 카테고리 생성
  - [x] `update(id, { name })`: 이름 수정
  - [x] `deleteById(id)`: 삭제
- [x] `backend/src/services/categoryService.js` 작성
  - [x] `getCategories(userId)`: 카테고리 목록 반환
  - [x] `createCategory(userId, name)`: 생성
  - [x] `updateCategory(categoryId, userId, name)`: 소유권 검증 + 기본 카테고리 수정 방지(403)
  - [x] `deleteCategory(categoryId, userId)`: 소유권 검증 + 기본 카테고리 삭제 방지(403)
- [x] `backend/src/controllers/categoryController.js` 작성
  - [x] `GET /api/categories` → 200
  - [x] `POST /api/categories` → 201
  - [x] `PATCH /api/categories/:id` → 200 또는 403
  - [x] `DELETE /api/categories/:id` → 204 또는 403
- [x] `backend/src/routes/categoryRoutes.js` 작성
- [x] 통합 테스트
  - [x] 기본 카테고리 삭제 시도 → 403 반환

---

### BE-06. 할일 API 구현 (UC-04, UC-05, UC-06, UC-07)

**목표**: 할일 CRUD API (소유권 검증, 상태 전이 규칙, 날짜 검증, 필터 포함)  
**의존성**: BE-02, BE-05 완료

#### 완료 조건 체크리스트

- [x] `backend/src/repositories/todoRepository.js` 작성
  - [x] `findAllByUser(userId, filters)`: 카테고리/상태/기한초과 필터 쿼리 파라미터 지원
  - [x] `findById(id)`: 단건 조회
  - [x] `create({ userId, categoryId, title, description, startDate, endDate })`: 상태 기본값 `TODO`, category_id 미제공 시 기본 카테고리 ID 사용
  - [x] `update(id, fields)`: 부분 수정
  - [x] `deleteById(id)`: 삭제
- [x] `backend/src/services/todoService.js` 작성
  - [x] `getTodos(userId, filters)`: 목록 조회
  - [x] `createTodo(userId, data)`: 날짜 유효성 검사 (end_date >= start_date)
  - [x] `updateTodo(todoId, userId, data)`: 소유권 검증 + 상태 전이 규칙 검증 (DONE → 다른 상태 불가) + 날짜 유효성 검사
  - [x] `deleteTodo(todoId, userId)`: 소유권 검증 (타인 리소스 → 403)
- [x] `backend/src/controllers/todoController.js` 작성
  - [x] `GET /api/todos` → 200 (쿼리 파라미터: `category_id`, `status`, `overdue`)
  - [x] `POST /api/todos` → 201 또는 400(날짜 오류)
  - [x] `PATCH /api/todos/:id` → 200 또는 400/403
  - [x] `DELETE /api/todos/:id` → 204 또는 403
- [x] `backend/src/routes/todoRoutes.js` 작성
- [x] 통합 테스트
  - [x] 인증 없이 `GET /api/todos` → 401 반환
  - [x] 타인 할일 삭제 시도 → 403 반환
  - [x] DONE 상태 할일을 다른 상태로 변경 시도 → 400 반환

---

### BE-07. 백엔드 서비스 단위 테스트

**목표**: 핵심 비즈니스 로직 단위 테스트 작성  
**의존성**: BE-03, BE-04, BE-05, BE-06 완료

#### 완료 조건 체크리스트

- [x] 테스트 프레임워크 설치 (`jest`)
- [x] `todoService` 테스트
  - [x] 상태 전이: DONE → TODO 전이 시도 → 오류 발생 확인
  - [x] 상태 전이: IN_PROGRESS → TODO 되돌리기 → 성공 확인
  - [x] 날짜 검증: end_date < start_date → 오류 발생 확인
  - [x] 소유권 검증: 타인 ID로 수정 시도 → 403 오류 확인
- [x] `categoryService` 테스트
  - [x] 기본 카테고리(user_id=NULL) 수정 시도 → 오류 발생 확인
  - [x] 기본 카테고리 삭제 시도 → 오류 발생 확인
  - [x] 타인 카테고리 삭제 시도 → 403 오류 확인
- [x] `authService` 테스트
  - [x] 비밀번호 bcrypt 해싱 저장 확인 (평문 저장 아님)
  - [x] 중복 이메일 등록 시도 → 오류 발생 확인

---

## PHASE 3: 프론트엔드

### FE-01. 프로젝트 기반 설정

**목표**: React 19 + TypeScript 프로젝트 초기 구성  
**의존성**: 없음 (백엔드와 병렬 진행 가능)

#### 완료 조건 체크리스트

- [ ] `frontend/` Vite + React 19 + TypeScript 프로젝트 생성
- [ ] 의존성 설치: `zustand`, `@tanstack/react-query`, `react-router-dom`
- [ ] `frontend/.env` 파일 생성 (`VITE_API_BASE_URL=http://localhost:3000`)
- [ ] `frontend/src/api/client.ts` 작성
  - [ ] `baseURL` 환경변수 기반 설정
  - [ ] `Authorization: Bearer <token>` 헤더 자동 주입 함수
  - [ ] 공통 에러 처리 (401 시 로그인 리다이렉트)
- [ ] `frontend/src/constants/statusConstants.ts` 작성 (`TODO`, `IN_PROGRESS`, `DONE`, `LIGHT`, `DARK`)
- [ ] `frontend/src/types/` 공통 타입 정의
  - [ ] `auth.ts` (LoginRequest, RegisterRequest, AuthResponse)
  - [ ] `todo.ts` (Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter)
  - [ ] `category.ts` (Category, CreateCategoryRequest)
  - [ ] `user.ts` (User, UpdateProfileRequest, UpdatePreferencesRequest)
- [ ] `frontend/src/utils/dateUtils.ts` 작성 (날짜 포맷, 기한 초과 계산)
- [ ] `frontend/src/App.tsx` 라우터 스켈레톤 작성
- [ ] `npm run dev` 실행 시 빈 앱이 정상 기동됨

---

### FE-02. 인증 상태 관리 및 라우팅 가드

**목표**: Zustand 인증 스토어 및 보호 라우트 구현  
**의존성**: FE-01 완료

#### 완료 조건 체크리스트

- [ ] `frontend/src/stores/authStore.ts` 작성
  - [ ] `token`, `user` 상태 관리
  - [ ] `setAuth(token, user)`, `clearAuth()` 액션
  - [ ] `localStorage` 연동 (새로고침 시 인증 유지)
  - [ ] `isAuthenticated` 파생 상태
- [ ] `frontend/src/api/authApi.ts` 작성
  - [ ] `register(data)`, `login(data)`, `logout()` 함수
- [ ] 보호 라우트 컴포넌트 작성 (`PrivateRoute`)
  - [ ] 비인증 상태에서 접근 시 `/login`으로 리다이렉트
- [ ] `frontend/src/App.tsx` 라우팅 구성
  - [ ] 공개 라우트: `/login`, `/register`
  - [ ] 보호 라우트: `/todos`, `/todos/new`, `/todos/:id/edit`, `/categories`, `/profile`, `/settings`
- [ ] 비인증 상태에서 `/todos` 접근 시 `/login`으로 리다이렉트 동작 확인

---

### FE-03. 인증 화면 구현 (S-01, S-02)

**목표**: 로그인, 회원가입 화면 구현 및 API 연동  
**의존성**: FE-02 완료, BE-03 완료

#### 완료 조건 체크리스트

- [ ] `frontend/src/components/` 공통 컴포넌트 작성
  - [ ] `Button.tsx` (로딩 상태 포함)
  - [ ] `Input.tsx` (에러 메시지 표시 포함)
- [ ] `frontend/src/pages/LoginPage.tsx` 구현
  - [ ] 이메일/비밀번호 입력 폼
  - [ ] 로그인 성공 시 `/todos`로 이동 + authStore 갱신
  - [ ] 로그인 실패 시 에러 메시지 표시
  - [ ] 회원가입 페이지 링크
- [ ] `frontend/src/pages/RegisterPage.tsx` 구현
  - [ ] 이름/이메일/비밀번호 입력 폼
  - [ ] 회원가입 성공 시 `/login`으로 이동
  - [ ] 중복 이메일 오류 메시지 표시
- [ ] 로그인 → 할일 목록 화면 이동 E2E 동작 확인

---

### FE-04. 카테고리 관리 화면 구현 (S-06, UC-08~10)

**목표**: 카테고리 목록 조회, 등록, 수정, 삭제 화면  
**의존성**: FE-02 완료, BE-05 완료

#### 완료 조건 체크리스트

- [ ] `frontend/src/api/categoryApi.ts` 작성
  - [ ] `getCategories()`, `createCategory(name)`, `updateCategory(id, name)`, `deleteCategory(id)` 함수
- [ ] `frontend/src/features/category/` 구현
  - [ ] `useCategoryQuery.ts`: TanStack Query로 카테고리 목록 조회
  - [ ] `useCategoryMutations.ts`: 등록/수정/삭제 뮤테이션
- [ ] `frontend/src/pages/CategoryPage.tsx` 구현 (S-06)
  - [ ] 카테고리 목록 표시 (기본 카테고리 수정/삭제 버튼 비활성화)
  - [ ] 카테고리 이름 입력 + 추가 버튼
  - [ ] 카테고리별 수정/삭제 버튼
  - [ ] 기본 카테고리 수정/삭제 시도 차단 및 오류 메시지 표시
- [ ] 카테고리 CRUD 전체 동작 확인

---

### FE-05. 할일 목록 화면 구현 (S-03, UC-05)

**목표**: 할일 목록 조회 및 필터 기능 구현  
**의존성**: FE-03, FE-04 완료, BE-06 완료

#### 완료 조건 체크리스트

- [ ] `frontend/src/api/todoApi.ts` 작성
  - [ ] `getTodos(filters)`, `createTodo(data)`, `updateTodo(id, data)`, `deleteTodo(id)` 함수
- [ ] `frontend/src/features/todo/` 구현
  - [ ] `useTodosQuery.ts`: TanStack Query로 할일 목록 조회 (필터 파라미터 포함)
  - [ ] `useTodoMutations.ts`: 등록/수정/삭제 뮤테이션
- [ ] `frontend/src/pages/TodoListPage.tsx` 구현 (S-03)
  - [ ] 할일 목록 렌더링 (제목, 상태, 카테고리, 날짜 표시)
  - [ ] 카테고리 필터 선택 UI
  - [ ] 상태 필터 선택 UI (전체/대기/진행중/완료)
  - [ ] 기한 초과 미완료 필터 선택 UI
  - [ ] 할일 등록 버튼 → `/todos/new`로 이동
  - [ ] 할일 항목 클릭 → `/todos/:id/edit`로 이동
  - [ ] 할일 삭제 버튼 및 확인 처리
  - [ ] 로그아웃 버튼 → authStore 초기화 + `/login`으로 이동
- [ ] 필터 조합 동작 확인 (카테고리 + 상태 + 기한 초과)

---

### FE-06. 할일 등록/수정 화면 구현 (S-04, S-05, UC-04, UC-06, UC-07)

**목표**: 할일 등록 및 수정 폼 화면 구현  
**의존성**: FE-04, FE-05 완료

#### 완료 조건 체크리스트

- [ ] `frontend/src/components/DatePicker.tsx` 구현 (캘린더 날짜 선택)
- [ ] `frontend/src/pages/TodoFormPage.tsx` 구현 (S-04 등록 / S-05 수정 공용)
  - [ ] 제목 입력 (필수)
  - [ ] 카테고리 선택 드롭다운 (기본 카테고리 포함)
  - [ ] 시작일자 캘린더 선택
  - [ ] 종료일자 캘린더 선택
  - [ ] 날짜 유효성 검사: end_date < start_date 시 저장 차단 + 오류 메시지
  - [ ] 상세 내용 텍스트 입력 (선택)
  - [ ] 수정 화면에서 상태 변경 UI
    - [ ] 상태 전이 규칙 UI 반영: DONE 상태 시 다른 상태로 변경 UI 비활성화
  - [ ] 저장 성공 시 `/todos`로 이동
  - [ ] 카테고리 미지정 시 자동으로 기본 카테고리 적용 확인
- [ ] 등록 → 목록 반영 / 수정 → 목록 갱신 동작 확인

---

### FE-07. 내 정보 수정 화면 구현 (S-07, UC-03)

**목표**: 이름 및 비밀번호 수정 화면 구현  
**의존성**: FE-03 완료, BE-04 완료

#### 완료 조건 체크리스트

- [ ] `frontend/src/api/userApi.ts` 작성
  - [ ] `getMe()`, `updateProfile(data)`, `updatePreferences(data)` 함수
- [ ] `frontend/src/pages/ProfilePage.tsx` 구현 (S-07)
  - [ ] 현재 이름 표시 및 수정 입력
  - [ ] 새 비밀번호 입력 (선택, 미입력 시 변경 없음)
  - [ ] 저장 성공 메시지 표시
- [ ] 이름 수정 저장 동작 확인
- [ ] 비밀번호 변경 후 재로그인 동작 확인

---

### FE-08. 환경설정 화면 구현 — v2 (S-08, UC-12, UC-13)

**목표**: 테마 모드 및 다국어 설정 화면 구현  
**의존성**: FE-07 완료, BE-04 완료

#### 완료 조건 체크리스트

- [ ] `react-i18next` 의존성 설치
- [ ] `frontend/src/i18n.ts` 초기화 설정 작성
- [ ] `frontend/src/locales/ko.json` 한국어 번역 파일 작성 (전체 앱 텍스트)
- [ ] `frontend/src/locales/en.json` 영어 번역 파일 작성
- [ ] `frontend/src/stores/uiStore.ts` 작성
  - [ ] `theme` (LIGHT/DARK), `language` 상태 관리
  - [ ] `setTheme(theme)`, `setLanguage(language)` 액션
- [ ] `frontend/src/pages/SettingsPage.tsx` 구현 (S-08)
  - [ ] 테마 모드 토글 (Dark/Light)
  - [ ] 언어 선택 드롭다운 (한국어/English)
  - [ ] 테마 변경 시 UI 즉시 전환 확인
  - [ ] 언어 변경 시 앱 전체 텍스트 즉시 전환 확인
- [ ] 로그인 후 저장된 테마/언어 자동 적용 확인
- [ ] 비인증 화면(로그인/회원가입)에서도 언어 선택 적용 확인

---

## Task 요약 표

| Task ID | 구분 | 설명                                | 의존성              | 우선순위 |
| ------- | ---- | ----------------------------------- | ------------------- | -------- |
| DB-01   | DB   | PostgreSQL 스키마 생성              | 없음                | 1        |
| DB-02   | DB   | 기본 카테고리 초기 데이터 삽입      | DB-01               | 1        |
| DB-03   | DB   | pg 연결 풀 설정                     | DB-01               | 1        |
| BE-01   | BE   | 백엔드 프로젝트 기반 설정           | DB-03               | 2        |
| BE-02   | BE   | 인증 미들웨어 구현                  | BE-01               | 2        |
| BE-03   | BE   | 인증 API (회원가입/로그인/로그아웃) | BE-01, BE-02        | 2        |
| BE-04   | BE   | 사용자 API (내 정보 수정/환경설정)  | BE-02, BE-03        | 2        |
| BE-05   | BE   | 카테고리 API (CRUD)                 | BE-02               | 2        |
| BE-06   | BE   | 할일 API (CRUD + 필터)              | BE-02, BE-05        | 2        |
| BE-07   | BE   | 백엔드 단위 테스트                  | BE-03~06            | 3        |
| FE-01   | FE   | 프론트엔드 기반 설정                | 없음                | 2        |
| FE-02   | FE   | 인증 상태 관리 및 라우팅 가드       | FE-01               | 2        |
| FE-03   | FE   | 인증 화면 (로그인/회원가입)         | FE-02, BE-03        | 2        |
| FE-04   | FE   | 카테고리 관리 화면                  | FE-02, BE-05        | 3        |
| FE-05   | FE   | 할일 목록 화면 (필터 포함)          | FE-03, FE-04, BE-06 | 3        |
| FE-06   | FE   | 할일 등록/수정 화면                 | FE-04, FE-05        | 3        |
| FE-07   | FE   | 내 정보 수정 화면                   | FE-03, BE-04        | 3        |
| FE-08   | FE   | 환경설정 화면 (v2: 테마/다국어)     | FE-07, BE-04        | 4        |

---

## 개발 일정

### Day 1 — 백엔드 및 DB

| 시간      | 작업                       |
| --------- | -------------------------- |
| 오전      | DB-01, DB-02, DB-03, BE-01 |
| 오후 전반 | BE-02, BE-03               |
| 오후 후반 | BE-04, BE-05, BE-06        |
| 저녁      | BE-07 (핵심 단위 테스트)   |

### Day 2 — 프론트엔드 및 연동

| 시간      | 작업                       |
| --------- | -------------------------- |
| 오전      | FE-01, FE-02, FE-03        |
| 오후 전반 | FE-04, FE-05               |
| 오후 후반 | FE-06, FE-07               |
| 저녁      | FE-08 (v2), 전체 연동 확인 |
