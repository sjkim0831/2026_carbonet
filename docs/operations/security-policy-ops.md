# Security Policy Ops

이 문서는 `/admin/system/security-policy`의 현재 운영 범위와 구현 원칙을 정리한다.

## 목적
- Carbonet 내부 관리자용 보안 점검/운영 콘솔 기준선을 유지한다.
- 탐지 수를 줄이는 것과 실제 보안 이슈를 해결하는 것을 구분한다.
- `detection -> review -> approve -> execute -> verify` 흐름을 같은 기준으로 유지한다.

## 현재 범위

### 탐지 엔진
- `governance-engine`
  - 중복 메뉴 URL
  - 중복 VIEW
  - 비활성 권한/override 참조
  - 민감 기능 노출
  - 회사 범위 역할의 민감 기능 노출
- `source-engine`
  - 하드코딩 비밀값
  - 쿠키 보안 속성
  - 자격증명 로그 노출
  - command injection
  - weak hash
  - SSL trust-all
  - CSRF/CORS/security headers
  - path traversal / deserialization / classloader / upload / XXE / YAML / JDBC / query-param 등
- `heuristic-engine`
  - session fixation
  - 관리자 인증 우회/공개 경로
  - missing rate limit
  - audit gap
  - sensitive action confirmation
  - maintenance guard
  - permission drift
  - audit context gap

### 운영 기능
- 엔진 탭
- baseline
- suppress / suppress 만료
- 상태 저장
  - `OPEN`
  - `ACKNOWLEDGED`
  - `APPROVED`
  - `EXECUTED`
  - `VERIFIED`
  - `RESOLVED`
  - `FALSE_POSITIVE`
- auto-fix / rollback
- SQL preview / rollback SQL 복사
- Codex CLI 요청문 복사
- webhook / digest / 발송 이력

## 구현 원칙

### 1. 해결 우선
- 탐지 규칙은 오탐을 줄이기 위해 조정할 수 있다.
- 하지만 실제 보안 이슈는 규칙 조정 대신 코드/권한/설정 수정으로 해결해야 한다.
- `fixed`로 간주하는 기준은 화면 숫자가 아니라 실제 런타임 동작 변경이다.

### 2. 휴리스틱은 실제 보호 계층을 읽어야 한다
- method security 어노테이션만 보고 보호 여부를 판단하지 않는다.
- Carbonet 현재 구조에서는 아래를 함께 본다.
  - `AuthorizeFilter`
  - `AdminMainAuthInterceptor`
  - 실제 controller route
  - runtime rate limit / audit hook

### 3. auto-fix와 manual-governance를 섞지 않는다
- `auto-fixable`
  - 메뉴/권한/비활성 참조처럼 SQL로 안전하게 정리 가능한 범주
- `manual-governance`
  - 실제 역할 정책 판단이 필요한 범주
- `source-*`
  - 대부분 코드 수정 대상

### 4. 화면과 엔진을 같이 바꾼다
- 새 탐지 카테고리를 추가하면:
  - backend detection row schema
  - React 필터/상태/액션
  - SQL preview 또는 Codex CLI 요청문
  - suppress/baseline behavior
  를 한 세트로 본다.

## 실제 수정으로 처리한 대표 항목
- 로그인 성공 후 세션 ID 재발급
- 민감 관리자 작업 rate limit
- 백업/복구/버전 작업의 감사 기록
- 관리자 인증 우회 경로 축소
- JWT 쿠키 `Secure` 처리
- 자격증명 로그 문구 정리

## 운영 체크리스트
- 탐지가 사라졌는가
- 실제 코드/권한/설정이 바뀌었는가
- rollback 경로가 있는가
- audit 이력이 남는가
- auto-fix가 권한상 허용된 사용자에게만 열리는가
- 승인자와 실행자가 분리되는가

## 한계
- 현재 수준은 내부 운영형 보안 콘솔이다.
- 상용 SAST/SIEM 수준의 AST/taint/DAST/외부 intel/멀티리포 분석은 아직 아니다.
- 상용툴에 가까워지려면 정확도 강화, 외부 연계, 워크플로우 고도화가 추가로 필요하다.
