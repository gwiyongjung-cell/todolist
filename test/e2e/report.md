# E2E 테스트 리포트

**작성일**: 2026-05-29  
**테스트 환경**: Playwright MCP  
**프론트엔드**: http://localhost:5173 (Vite dev server)  
**백엔드**: http://localhost:3000 (Express)  
**테스트 계정**: e2etest@example.com / Test1234!

---

## 테스트 결과 요약

| 구분 | 통과 | 실패 |
|------|------|------|
| 인증 플로우 | 7 | 0 |
| 할일 관리 | 8 | 0 |
| 카테고리 관리 | 4 | 0 |
| 내 정보 수정 | 2 | 0 |
| 환경설정 | 3 | 0 |
| 라우팅 가드 | 2 | 0 |
| **합계** | **26** | **0** |

**전체 결과: ✅ 26 / 26 통과**

---

## 1. 인증 플로우

### TC-01 로그인 페이지 초기 접속
- **결과**: ✅ PASS
- **설명**: `/` 접속 시 `/login`으로 리다이렉트, 로그인 폼 정상 렌더링
- ![로그인 페이지](screenshots/01-login-page.png)

---

### TC-02 빈 폼 제출 유효성 검사
- **결과**: ✅ PASS
- **설명**: 이메일·비밀번호 미입력 상태에서 로그인 버튼 클릭 시 오류 메시지 표시
- ![빈 폼 유효성 검사](screenshots/02-login-empty-validation.png)

---

### TC-03 잘못된 자격증명 로그인 차단 (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 존재하지 않는 계정으로 로그인 시도 → 401 에러 메시지 표시, 페이지 이동 없음
- ![잘못된 자격증명](screenshots/03-login-wrong-credentials.png)

---

### TC-04 회원가입 페이지 초기 접속
- **결과**: ✅ PASS
- **설명**: `/register` 접속 시 회원가입 폼 정상 렌더링
- ![회원가입 페이지](screenshots/04-register-page.png)

---

### TC-05 빈 폼 회원가입 유효성 검사 (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 이름·이메일·비밀번호 미입력 시 각 필드별 오류 메시지 표시
- ![빈 폼 유효성 검사](screenshots/05-register-empty-validation.png)

---

### TC-06 정상 회원가입
- **결과**: ✅ PASS
- **설명**: 이름/이메일/비밀번호 입력 후 가입 → `/login`으로 리다이렉트
- ![회원가입 폼 입력](screenshots/06-register-form-filled.png)

---

### TC-07 중복 이메일 회원가입 차단 (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 이미 존재하는 이메일로 가입 시도 → 409 에러 메시지 이메일 필드에 표시
- ![중복 이메일 오류](screenshots/07-register-duplicate-email.png)

---

## 2. 할일 관리

### TC-08 로그인 성공 및 할일 목록 이동
- **결과**: ✅ PASS
- **설명**: 유효한 자격증명 로그인 → `/todos`로 이동, 빈 목록 상태 표시
- ![로그인 성공](screenshots/08-login-success-todolist.png)

---

### TC-09 할일 등록 폼 및 제목 필수 유효성 검사 (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 제목 없이 저장 시도 → "제목을 입력해주세요." 오류 메시지 표시
- ![할일 등록 폼](screenshots/09-todo-new-form.png)
- ![제목 필수 오류](screenshots/10-todo-empty-validation.png)

---

### TC-10 날짜 역전 유효성 검사 (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 종료일 < 시작일 설정 후 저장 시도 → 날짜 오류 메시지 표시, 저장 차단
- ![날짜 역전 오류](screenshots/11-todo-date-validation.png)

---

### TC-11 할일 3개 등록 및 목록 표시
- **결과**: ✅ PASS
- **설명**: 정상 할일 3개(일반/기한 초과/완료 예정) 등록 후 목록에 표시
- ![할일 목록](screenshots/12-todolist-with-items.png)

---

### TC-12 기한 초과 필터
- **결과**: ✅ PASS
- **설명**: "기한 초과" 필터 클릭 시 기한이 지난 할일만 표시
- ![기한 초과 필터](screenshots/13-filter-overdue.png)

---

### TC-13 상태 필터 (대기)
- **결과**: ✅ PASS
- **설명**: "대기" 필터 클릭 시 TODO 상태 할일만 필터링
- ![상태 필터](screenshots/14-filter-status-todo.png)

---

### TC-14 DONE 상태 잠금 UI (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 완료(DONE) 상태 할일 수정 진입 시 상태 select 비활성화, "(완료된 항목은 상태 변경 불가)" 안내 표시
- ![DONE 상태 잠금](screenshots/15-todo-done-status-locked.png)

---

### TC-15 할일 삭제 confirm 및 제거
- **결과**: ✅ PASS
- **설명**: 삭제 버튼 클릭 → confirm 다이얼로그 표시 → 확인 시 목록에서 제거
- ![삭제 후 목록](screenshots/16-todo-delete-success.png)

---

## 3. 카테고리 관리

### TC-16 카테고리 목록 및 기본 카테고리 보호
- **결과**: ✅ PASS
- **설명**: 카테고리 목록 표시, 기본 카테고리 수정·삭제 버튼 `disabled` 처리 확인
- ![카테고리 목록](screenshots/17-category-page.png)

---

### TC-17 카테고리 추가
- **결과**: ✅ PASS
- **설명**: 새 카테고리 이름 입력 후 추가 버튼 클릭 → 목록에 즉시 반영
- ![카테고리 추가](screenshots/18-category-added.png)

---

### TC-18 카테고리 이름 수정
- **결과**: ✅ PASS
- **설명**: 수정 버튼 클릭 → 인라인 입력 활성화 → 이름 변경 저장
- ![카테고리 수정](screenshots/19-category-edited.png)

---

### TC-19 카테고리 삭제
- **결과**: ✅ PASS
- **설명**: 삭제 버튼 클릭 → 즉시 목록에서 제거
- ![카테고리 삭제](screenshots/20-category-deleted.png)

---

## 4. 내 정보 수정

### TC-20 프로필 빈 이름 유효성 검사 (엣지케이스)
- **결과**: ✅ PASS
- **설명**: 이름 필드 비워서 저장 시도 → "이름을 입력해주세요." 오류 메시지 표시
- ![프로필 페이지](screenshots/21-profile-page.png)
- ![빈 이름 오류](screenshots/22-profile-name-empty-validation.png)

---

### TC-21 프로필 이름 수정 성공
- **결과**: ✅ PASS
- **설명**: 새 이름 입력 후 저장 → "저장되었습니다." 성공 메시지 표시
- ![이름 수정 성공](screenshots/23-profile-save-success.png)

---

## 5. 환경설정

### TC-22 다크 모드 전환
- **결과**: ✅ PASS
- **설명**: "다크 모드" 버튼 클릭 → UI 즉시 다크 테마 적용, `data-theme="dark"` 반영
- ![다크 모드](screenshots/25-settings-dark-mode.png)

---

### TC-23 언어 영어 전환
- **결과**: ✅ PASS
- **설명**: 언어 선택 드롭다운에서 English 선택 → UI 전체 텍스트 영어로 즉시 전환
- ![영어 전환](screenshots/26-settings-language-en.png)

---

### TC-24 환경설정 저장 성공
- **결과**: ✅ PASS
- **설명**: Save 버튼 클릭 → API 호출 성공, 성공 메시지 표시
- ![설정 저장](screenshots/27-settings-save-success.png)

---

## 6. 라우팅 가드

### TC-25 로그아웃 및 리다이렉트
- **결과**: ✅ PASS
- **설명**: 로그아웃 버튼 클릭 → authStore 초기화, `/login`으로 이동
- ![로그아웃](screenshots/28-logout-redirect-login.png)

---

### TC-26 비인증 상태 보호 라우트 접근 차단
- **결과**: ✅ PASS
- **설명**: 로그아웃 상태에서 `/todos` 직접 접근 → `/login`으로 강제 리다이렉트
- ![비인증 리다이렉트](screenshots/29-unauthenticated-redirect.png)

---

## 발견된 이슈

없음 — 26개 테스트 케이스 전원 통과.

---

## 스크린샷 목록

| 파일명 | 설명 |
|--------|------|
| 01-login-page.png | 로그인 페이지 초기 화면 |
| 02-login-empty-validation.png | 빈 폼 제출 오류 |
| 03-login-wrong-credentials.png | 잘못된 자격증명 오류 |
| 04-register-page.png | 회원가입 페이지 |
| 05-register-empty-validation.png | 회원가입 빈 폼 오류 |
| 06-register-form-filled.png | 회원가입 폼 입력 완료 |
| 07-register-duplicate-email.png | 중복 이메일 오류 |
| 08-login-success-todolist.png | 로그인 성공 후 할일 목록 |
| 09-todo-new-form.png | 새 할일 등록 폼 |
| 10-todo-empty-validation.png | 할일 제목 필수 오류 |
| 11-todo-date-validation.png | 날짜 역전 오류 |
| 12-todolist-with-items.png | 할일 3개 등록 후 목록 |
| 13-filter-overdue.png | 기한 초과 필터 |
| 14-filter-status-todo.png | 상태 필터(대기) |
| 15-todo-done-status-locked.png | DONE 상태 잠금 UI |
| 16-todo-delete-success.png | 할일 삭제 후 목록 |
| 17-category-page.png | 카테고리 목록 |
| 18-category-added.png | 카테고리 추가 |
| 19-category-edited.png | 카테고리 이름 수정 |
| 20-category-deleted.png | 카테고리 삭제 |
| 21-profile-page.png | 내 정보 페이지 |
| 22-profile-name-empty-validation.png | 빈 이름 오류 |
| 23-profile-save-success.png | 이름 수정 성공 |
| 24-settings-page.png | 환경설정 페이지 |
| 25-settings-dark-mode.png | 다크 모드 적용 |
| 26-settings-language-en.png | 영어 전환 |
| 27-settings-save-success.png | 설정 저장 성공 |
| 28-logout-redirect-login.png | 로그아웃 후 리다이렉트 |
| 29-unauthenticated-redirect.png | 비인증 보호 라우트 차단 |
