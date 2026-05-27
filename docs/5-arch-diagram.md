# TodoList 앱 기술 아키텍처 다이어그램

**작성자**: GWJung | **버전**: 1.0 | **작성일**: 2026-05-27

---

## 다이어그램 1: 시스템 전체 구성

브라우저에서 시작하는 전체 시스템 흐름을 나타냅니다. React SPA와 Express 백엔드 간 JWT 기반 인증 통신을 포함합니다.

```mermaid
flowchart TB
    Browser["🌐 웹 브라우저"]
    Frontend["⚛️ 프론트엔드<br/>(React 19 SPA)"]
    Auth["🔐 JWT 인증<br/>(Bearer Token)"]
    Backend["🔧 백엔드 API<br/>(Express Server)"]
    DB[("💾 PostgreSQL 17")]

    Browser -->|HTTP/HTTPS| Frontend
    Frontend -->|요청 + JWT| Auth
    Auth -->|인증된 요청| Backend
    Backend -->|쿼리| DB
    DB -->|결과| Backend
    Backend -->|응답| Frontend
    Frontend -->|렌더링| Browser
```

---

## 다이어그램 2: 백엔드 레이어 아키텍처

요청이 Route에서 시작하여 각 계층을 순차적으로 통과하며 데이터에 접근하는 구조입니다.

```mermaid
flowchart LR
    Route["📍 Route<br/>(routes/*)"]
    Controller["🎮 Controller<br/>(controllers/*)"]
    Service["⚙️ Service<br/>(services/*)"]
    Repository["📦 Repository<br/>(repositories/*)"]
    DB[("💾 DB<br/>(pg.Pool)")]

    Route -->|요청 전달| Controller
    Controller -->|비즈니스 로직 호출| Service
    Service -->|데이터 접근| Repository
    Repository -->|SQL 쿼리| DB
    DB -->|데이터 반환| Repository
    Repository -->|엔티티| Service
    Service -->|결과| Controller
    Controller -->|응답| Route
```

---

## 다이어그램 3: 프론트엔드 레이어 아키텍처

UI 컴포넌트에서 시작하여 상태 관리와 API 통신을 거쳐 백엔드와 상호작용하는 구조입니다.

```mermaid
flowchart LR
    Pages["📄 Pages/Features<br/>(pages/, features/)"]
    Hooks["🪝 Stores/Hooks<br/>(stores/, hooks/)"]
    API["📡 API Client<br/>(api/)"]
    Backend["🔧 Backend API"]

    Pages -->|상태 구독| Hooks
    Hooks -->|Zustand/Query| Pages
    Hooks -->|API 호출| API
    API -->|HTTP 요청| Backend
    Backend -->|응답| API
    API -->|데이터| Hooks
```

---

## 다이어그램 4: 엔티티 관계 다이어그램 (ERD)

세 가지 핵심 엔티티와 그들 간의 관계, 각 엔티티의 주요 속성을 표현합니다.

```mermaid
erDiagram
    USER ||--o{ CATEGORY : creates
    USER ||--o{ TODO : creates
    CATEGORY ||--o{ TODO : contains

    USER {
        int id PK
        string email UK
        string password
        string name
        string theme "LIGHT|DARK"
        string language
        timestamp created_at
        timestamp updated_at
    }

    CATEGORY {
        int id PK
        int user_id FK "NULL = 기본 카테고리"
        string name
        timestamp created_at
    }

    TODO {
        int id PK
        int user_id FK
        int category_id FK
        string title
        string description
        date start_date
        date end_date
        string status "TODO|IN_PROGRESS|DONE"
        timestamp created_at
        timestamp updated_at
    }
```

---

## 다이어그램 5: Todo 상태 전이 다이어그램

Todo 항목의 생명주기를 나타냅니다. 허용된 상태 전이와 불가능한 전이를 표현합니다.

```mermaid
stateDiagram-v2
    [*] --> TODO

    TODO --> IN_PROGRESS: 시작
    IN_PROGRESS --> DONE: 완료
    IN_PROGRESS --> TODO: 되돌리기

    DONE --> [*]

    note right of TODO
        새로 생성된 항목
    end note

    note right of IN_PROGRESS
        진행 중인 항목
    end note

    note right of DONE
        완료 항목
        (상태 변경 불가)
    end note
```

---

## 요약

| 계층             | 기술                    | 역할                         |
| ---------------- | ----------------------- | ---------------------------- |
| **클라이언트**   | React 19, TypeScript    | UI 렌더링, 사용자 상호작용   |
| **상태 관리**    | Zustand, TanStack Query | 클라이언트 상태, 서버 동기화 |
| **HTTP 통신**    | fetch (내장)            | 백엔드와의 데이터 교환       |
| **인증**         | JWT (Bearer Token)      | 사용자 인증 및 권한 검증     |
| **서버**         | Express.js              | API 엔드포인트 제공          |
| **데이터 접근**  | pg.Pool, Repository     | 데이터베이스 쿼리 실행       |
| **데이터베이스** | PostgreSQL 17           | 데이터 영구 저장             |
| **다국어 (v2)**  | react-i18next           | 다국어 지원                  |
