# 프론트엔드 스타일 가이드

**버전**: 1.0  
**작성일**: 2026-05-28  
**디자인 레퍼런스**: 네이버 캘린더 UI  
**적용 대상**: TodoList 프론트엔드 (React 19 + TypeScript)

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [컬러 팔레트](#2-컬러-팔레트)
3. [타이포그래피](#3-타이포그래피)
4. [간격 및 레이아웃](#4-간격-및-레이아웃)
5. [컴포넌트 스타일](#5-컴포넌트-스타일)
6. [상태별 색상 규칙](#6-상태별-색상-규칙)
7. [아이콘 및 시각 요소](#7-아이콘-및-시각-요소)
8. [반응형 브레이크포인트](#8-반응형-브레이크포인트)
9. [Tailwind CSS 설정](#9-tailwind-css-설정)

---

## 1. 디자인 원칙

네이버 캘린더 UI에서 도출한 핵심 디자인 원칙.

| 원칙 | 설명 |
|------|------|
| **Clean & Minimal** | 흰색 배경 기반, 불필요한 장식 요소 제거 |
| **명확한 계층** | 색상·크기·굵기로 정보 중요도를 시각적으로 구분 |
| **충분한 여백** | 요소 간 넉넉한 간격으로 가독성 확보 |
| **일관된 둥근 모서리** | 카드, 버튼, 배지 모두 동일한 radius 체계 적용 |
| **한국어 최적화** | 한글 가독성이 좋은 폰트, 적절한 행간 설정 |

---

## 2. 컬러 팔레트

### 2.1 브랜드 컬러

네이버 캘린더의 시그니처 그린을 기준 컬러로 채택.

```
Primary Green  #03C75A   — 주요 액션 버튼, 활성 상태, 브랜드 포인트
Primary Dark   #02A84A   — hover/active 상태
Primary Light  #E8F9EE   — 배경 강조, 선택 영역
```

### 2.2 중립 컬러 (Neutral)

```
Gray 900  #191F28   — 헤딩, 핵심 텍스트
Gray 700  #4E5968   — 본문 텍스트, 탭 헤더 활성
Gray 500  #8B95A1   — 보조 텍스트, placeholder
Gray 300  #C4C9D4   — 비활성 버튼, 구분선
Gray 100  #F2F4F6   — 페이지 배경, 비활성 탭
Gray 50   #F9FAFB   — 카드 내부 배경
White     #FFFFFF   — 카드 배경, 입력 필드 배경
```

### 2.3 시맨틱 컬러

```
Success   #03C75A   — 완료(DONE) 상태
Info      #3182F6   — 진행중(IN_PROGRESS) 상태, 이벤트 텍스트
Warning   #F59E0B   — 주의 메시지
Danger    #F03E3E   — 기한 초과, 오류, 삭제, 공휴일 날짜
```

### 2.4 Today 강조색

```
Today BG  #FFFFF0   — 오늘 날짜 셀 배경 (연한 노란빛)
Today Border #E8E87A — 오늘 날짜 셀 테두리
```

### 2.5 CSS 변수 정의

```css
:root {
  /* Brand */
  --color-primary:       #03C75A;
  --color-primary-dark:  #02A84A;
  --color-primary-light: #E8F9EE;

  /* Neutral */
  --color-text-primary:   #191F28;
  --color-text-secondary: #4E5968;
  --color-text-tertiary:  #8B95A1;
  --color-border:         #C4C9D4;
  --color-bg-page:        #F2F4F6;
  --color-bg-card:        #FFFFFF;
  --color-bg-subtle:      #F9FAFB;

  /* Semantic */
  --color-success: #03C75A;
  --color-info:    #3182F6;
  --color-warning: #F59E0B;
  --color-danger:  #F03E3E;

  /* Today */
  --color-today-bg:     #FFFFF0;
  --color-today-border: #E8E87A;
}
```

---

## 3. 타이포그래피

### 3.1 폰트

```css
font-family: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont,
             'Apple SD Gothic Neo', sans-serif;
```

> Pretendard는 한글·영문 모두 균형 잡힌 현대적 폰트. CDN 또는 `@fontsource/pretendard` 패키지 사용.

### 3.2 타입 스케일

| 용도 | 크기 | 굵기 | 행간 | 클래스 |
|------|------|------|------|--------|
| 페이지 타이틀 | 24px / 1.5rem | 700 | 1.3 | `text-page-title` |
| 섹션 헤딩 | 18px / 1.125rem | 600 | 1.4 | `text-section-heading` |
| 카드 타이틀 | 15px / 0.9375rem | 600 | 1.4 | `text-card-title` |
| 본문 | 14px / 0.875rem | 400 | 1.6 | `text-body` |
| 보조 | 13px / 0.8125rem | 400 | 1.5 | `text-secondary` |
| 캡션 / 날짜 | 12px / 0.75rem | 400 | 1.4 | `text-caption` |
| 탭 레이블 | 14px / 0.875rem | 500 | 1.0 | `text-tab` |

### 3.3 색상 사용 규칙

```
주요 텍스트     → var(--color-text-primary)   #191F28
보조 텍스트     → var(--color-text-secondary) #4E5968
비활성/플레이스 → var(--color-text-tertiary)  #8B95A1
기한 초과 날짜  → var(--color-danger)         #F03E3E
오늘 날짜       → var(--color-primary)         #03C75A (굵게)
이벤트/링크     → var(--color-info)            #3182F6
```

---

## 4. 간격 및 레이아웃

### 4.1 간격 단위 (8px Grid)

| 토큰 | 값 | 용도 |
|------|----|------|
| `space-1` | 4px | 아이콘-텍스트 간격 |
| `space-2` | 8px | 인라인 요소 간격 |
| `space-3` | 12px | 리스트 아이템 내 패딩 |
| `space-4` | 16px | 카드 내부 패딩, 섹션 간격 |
| `space-5` | 20px | 컴포넌트 간 여백 |
| `space-6` | 24px | 섹션 상하 패딩 |
| `space-8` | 32px | 페이지 섹션 간격 |
| `space-10` | 40px | 페이지 상단 여백 |

### 4.2 Border Radius

```
radius-sm   4px   — 체크박스, 배지, 작은 태그
radius-md   8px   — 버튼, 입력 필드, 작은 카드
radius-lg   12px  — 메인 카드, 모달
radius-xl   16px  — 대형 카드, 드롭다운 패널
radius-pill 9999px — 필터 칩, 상태 배지
```

### 4.3 그림자 (Shadow)

네이버 캘린더의 카드처럼 부드럽고 절제된 그림자 사용.

```css
--shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
--shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.05);
```

### 4.4 페이지 레이아웃

```
최대 너비: 1080px (content-max-width)
페이지 좌우 패딩: 24px (데스크톱), 16px (모바일)
사이드바 너비: 240px (데스크톱)
콘텐츠 영역: 나머지 (flex-grow: 1)
```

---

## 5. 컴포넌트 스타일

### 5.1 카드 (Card)

네이버 캘린더의 달력 패널처럼 흰 배경 + 부드러운 그림자 + 둥근 모서리.

```css
.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}
```

**사용 예:**
- 할일 목록 컨테이너
- 카테고리 관리 패널
- 내 정보 수정 폼

### 5.2 탭 (Tab)

네이버 캘린더의 달력/음양력변환/전역일계산 탭 스타일.

```css
.tab-group {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: var(--color-text-tertiary);
  background: #FFFFFF;
  cursor: pointer;
  border: none;
  transition: background 0.15s, color 0.15s;
}

.tab-item:not(:last-child) {
  border-right: 1px solid var(--color-border);
}

.tab-item.active {
  background: #4E5968;   /* 네이버 캘린더 활성 탭 색상 */
  color: #FFFFFF;
  font-weight: 600;
}

.tab-item:hover:not(.active) {
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
}
```

**사용 예:**
- 할일 목록 상태 필터 (전체 / 대기 / 진행중 / 완료)

### 5.3 버튼 (Button)

```css
/* Primary 버튼 — 주요 액션 (저장, 등록) */
.btn-primary {
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover  { background: var(--color-primary-dark); }
.btn-primary:disabled { background: var(--color-border); cursor: not-allowed; }

/* Secondary 버튼 — 보조 액션 (취소) */
.btn-secondary {
  background: #FFFFFF;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-secondary:hover { background: var(--color-bg-subtle); border-color: #8B95A1; }

/* Danger 버튼 — 삭제 */
.btn-danger {
  background: #FFF0F0;
  color: var(--color-danger);
  border: 1px solid #FFC9C9;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-danger:hover { background: #FFE3E3; }

/* Icon 버튼 — 수정/삭제 아이콘 전용 */
.btn-icon {
  padding: 6px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-icon:hover { background: var(--color-bg-page); color: var(--color-text-primary); }
```

### 5.4 입력 필드 (Input)

```css
.input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input::placeholder { color: var(--color-text-tertiary); }
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.input.error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px #FFE3E3;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.input-error-msg {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}
```

### 5.5 상태 배지 (Status Badge)

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-todo        { background: #F2F4F6; color: #4E5968; }
.badge-in-progress { background: #EBF3FF; color: #3182F6; }
.badge-done        { background: #E8F9EE; color: #03C75A; }
.badge-overdue     { background: #FFF0F0; color: #F03E3E; }
```

### 5.6 필터 칩 (Filter Chip)

카테고리·상태 필터에 사용하는 선택형 칩.

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background: #FFFFFF;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.chip.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #FFFFFF;
}

/* 기한 초과 필터 — 위험 색상 */
.chip.overdue.active {
  border-color: var(--color-danger);
  background: var(--color-danger);
}
```

### 5.7 할일 리스트 아이템 (Todo Item)

```css
.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #EAECEF;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.todo-item:hover {
  box-shadow: var(--shadow-sm);
  border-color: #C4C9D4;
}

/* 기한 초과 강조 */
.todo-item.overdue {
  border-left: 3px solid var(--color-danger);
  background: #FFFAFA;
}

/* 완료 상태 — 흐리게 */
.todo-item.done {
  opacity: 0.6;
}

.todo-title { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.todo-title.done { text-decoration: line-through; color: var(--color-text-tertiary); }

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.todo-date.overdue { color: var(--color-danger); font-weight: 500; }
```

### 5.8 모달 (Modal)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 28px 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}
```

### 5.9 네비게이션 헤더

```css
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: #FFFFFF;
  border-bottom: 1px solid #EAECEF;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.nav-menu { display: flex; align-items: center; gap: 4px; }

.nav-item {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover  { background: var(--color-bg-page); color: var(--color-text-primary); }
.nav-item.active { background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
```

---

## 6. 상태별 색상 규칙

### 6.1 할일 상태

| 상태 | 한국어 | 배지 배경 | 배지 텍스트 | 아이콘 색 |
|------|--------|---------|------------|---------|
| `TODO` | 대기 | `#F2F4F6` | `#4E5968` | Gray 500 |
| `IN_PROGRESS` | 진행중 | `#EBF3FF` | `#3182F6` | Info Blue |
| `DONE` | 완료 | `#E8F9EE` | `#03C75A` | Primary Green |
| _(초과)_ | 기한 초과 | `#FFF0F0` | `#F03E3E` | Danger Red |

### 6.2 날짜 표시 규칙

네이버 캘린더의 날짜 색상 체계를 할일 날짜 표시에 적용.

| 상황 | 색상 | 비고 |
|------|------|------|
| 일반 날짜 | `#191F28` | |
| 오늘 날짜 | `#03C75A` + 굵게 | |
| 기한 초과 날짜 | `#F03E3E` | 공휴일 색상 차용 |
| 먼 미래 날짜 | `#8B95A1` | 흐리게 처리 |
| 완료된 할일 날짜 | `#C4C9D4` | strikethrough |

### 6.3 카테고리 색상 (선택적)

카테고리를 색으로 구분할 경우 아래 팔레트 순서로 자동 배정.

```typescript
export const CATEGORY_COLORS = [
  '#3182F6', // 파랑
  '#03C75A', // 초록
  '#F59E0B', // 노랑
  '#8B5CF6', // 보라
  '#EC4899', // 핑크
  '#06B6D4', // 하늘
  '#F97316', // 주황
  '#6B7280', // 회색
];
```

---

## 7. 아이콘 및 시각 요소

### 7.1 아이콘 라이브러리

**Lucide React** 사용 권장 (가볍고 일관된 선형 아이콘).

```bash
npm install lucide-react
```

### 7.2 주요 아이콘 매핑

| 기능 | 아이콘 | Lucide 이름 |
|------|--------|------------|
| 새 할일 추가 | ＋ | `Plus` |
| 수정 | ✏️ | `Pencil` |
| 삭제 | 🗑 | `Trash2` |
| 완료 체크 | ✓ | `Check` |
| 카테고리 | 🏷 | `Tag` |
| 캘린더/날짜 | 📅 | `CalendarDays` |
| 기한 초과 | ⚠️ | `AlertCircle` |
| 필터 | ⧉ | `SlidersHorizontal` |
| 로그아웃 | → | `LogOut` |
| 내 정보 | 👤 | `User` |
| 설정 | ⚙️ | `Settings` |
| 검색 | 🔍 | `Search` |
| 이전/다음 | ‹ › | `ChevronLeft` / `ChevronRight` |

### 7.3 아이콘 크기

```
xs: 14px  — 배지 내부, 캡션 영역
sm: 16px  — 인라인 텍스트 옆
md: 20px  — 버튼 내 아이콘 (기본)
lg: 24px  — 네비게이션, 헤딩
xl: 32px  — 빈 상태(empty state) 일러스트
```

### 7.4 빈 상태 (Empty State)

할일이 없거나 필터 결과가 없을 때.

```tsx
<div style={{ textAlign: 'center', padding: '48px 24px' }}>
  <CalendarDays size={48} color="#C4C9D4" />
  <p style={{ marginTop: 16, fontSize: 15, color: '#8B95A1', fontWeight: 500 }}>
    할일이 없습니다
  </p>
  <p style={{ fontSize: 13, color: '#C4C9D4', marginTop: 4 }}>
    새 할일을 등록해 보세요
  </p>
</div>
```

---

## 8. 반응형 브레이크포인트

| 이름 | 픽셀 | 레이아웃 |
|------|------|---------|
| `mobile` | ~ 639px | 1컬럼, 햄버거 메뉴, 탭 하단 고정 |
| `tablet` | 640px ~ 1023px | 사이드바 숨김, 상단 탭 |
| `desktop` | 1024px ~ | 사이드바 표시, 전체 레이아웃 |

### 모바일 핵심 규칙

- 필터 칩은 가로 스크롤 (overflow-x: auto, no-scrollbar)
- 버튼은 전체 너비 (`width: 100%`)
- 카드 좌우 여백: 16px
- 헤더 높이: 52px

---

## 9. Tailwind CSS 설정

Tailwind를 사용하는 경우 `tailwind.config.ts`에 아래 토큰을 확장.

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#03C75A',
          dark:    '#02A84A',
          light:   '#E8F9EE',
        },
        gray: {
          900: '#191F28',
          700: '#4E5968',
          500: '#8B95A1',
          300: '#C4C9D4',
          100: '#F2F4F6',
          50:  '#F9FAFB',
        },
        info:    '#3182F6',
        warning: '#F59E0B',
        danger:  '#F03E3E',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)',
      },
      screens: {
        mobile: { max: '639px' },
        tablet: { min: '640px', max: '1023px' },
        desktop: '1024px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 자주 쓰는 Tailwind 조합

```tsx
// 카드
<div className="bg-white rounded-lg shadow-md p-6" />

// Primary 버튼
<button className="bg-primary hover:bg-primary-dark text-white font-semibold
                   px-5 py-2.5 rounded-md transition-colors disabled:bg-gray-300" />

// 상태 배지 - 진행중
<span className="bg-blue-50 text-info text-xs font-medium px-2.5 py-1 rounded-pill" />

// 할일 아이템 기한 초과
<div className="border-l-4 border-danger bg-red-50 rounded-md p-4" />

// 필터 칩 활성
<button className="bg-primary text-white border-primary rounded-pill
                   px-4 py-1.5 text-sm font-medium" />
```

---

## 컴포넌트 빠른 참조

```
[흰 카드]           bg-white rounded-lg shadow-md
[탭 활성]           bg-gray-700 text-white
[탭 비활성]         bg-white text-gray-500 border-gray-300
[배지 대기]         bg-gray-100 text-gray-700
[배지 진행중]       bg-blue-50 text-info
[배지 완료]         bg-primary-light text-primary
[배지 기한초과]     bg-red-50 text-danger
[버튼 주요]         bg-primary text-white
[버튼 취소]         bg-white border text-gray-700
[버튼 삭제]         bg-red-50 border-red-200 text-danger
[입력 포커스링]     ring-2 ring-primary-light border-primary
[기한초과 행]       border-l-4 border-danger bg-red-50
[오늘 날짜]         text-primary font-bold
```
