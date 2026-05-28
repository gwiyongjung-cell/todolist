-- =================================================================
-- TodoList 데이터베이스 스키마
-- 버전: 1.0
-- 작성일: 2026-05-27
-- 작성자: GWJung
-- 대상 DB: PostgreSQL 17
-- =================================================================


-- -----------------------------------------------------------------
-- 0. 초기화 (재실행 시 기존 객체 제거)
-- -----------------------------------------------------------------
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS theme_type;
DROP TYPE IF EXISTS todo_status;


-- -----------------------------------------------------------------
-- 1. ENUM 타입 정의
-- -----------------------------------------------------------------
CREATE TYPE theme_type AS ENUM ('LIGHT', 'DARK');
CREATE TYPE todo_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');


-- -----------------------------------------------------------------
-- 2. users 테이블
-- -----------------------------------------------------------------
CREATE TABLE users (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    theme       theme_type    NOT NULL DEFAULT 'LIGHT',
    language    VARCHAR(10)   NOT NULL DEFAULT 'ko',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------
-- 3. categories 테이블
-- user_id = NULL : 시스템 전역 기본 카테고리
-- user_id = 값   : 해당 사용자 소유 카테고리
-- -----------------------------------------------------------------
CREATE TABLE categories (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------
-- 4. todos 테이블
-- category_id 가 참조하는 카테고리 삭제 시 RESTRICT:
--   애플리케이션에서 todo를 기본 카테고리로 이동 후 삭제 처리
-- -----------------------------------------------------------------
CREATE TABLE todos (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id  UUID          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title        VARCHAR(255)  NOT NULL,
    description  TEXT,
    start_date   DATE,
    end_date     DATE,
    status       todo_status   NOT NULL DEFAULT 'TODO',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_date_range
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);


-- -----------------------------------------------------------------
-- 5. 인덱스
-- -----------------------------------------------------------------
CREATE INDEX idx_categories_user_id  ON categories(user_id);
CREATE INDEX idx_todos_user_id       ON todos(user_id);
CREATE INDEX idx_todos_category_id   ON todos(category_id);
CREATE INDEX idx_todos_status        ON todos(status);
CREATE INDEX idx_todos_end_date      ON todos(end_date);  -- 기한 초과 필터 성능


-- -----------------------------------------------------------------
-- 6. 초기 데이터: 시스템 전역 기본 카테고리
-- -----------------------------------------------------------------
INSERT INTO categories (id, user_id, name)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, '기본')
ON CONFLICT (id) DO NOTHING;
