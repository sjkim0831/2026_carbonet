# Admin Menu Implementation Order And Screen Sets

기준일: 2026-03-30

기준 소스:

- `docs/operations/db-menu-work-order-wbs-20260317.md`
- `docs/operations/menu-work-order-wbs-20260317.md`
- `docs/operations/admin-menu-screen-decomposition-template.md`
- 현재 저장소의 관리자 React/백엔드 구현 현황

## 목적

이 문서는 관리자 메뉴를 "메뉴 하나당 화면 하나"로 착각해서 빠지기 쉬운:

- 상세 화면
- 승인/반려 화면
- 이력 화면
- 조치 결과 화면
- 예외 처리 화면
- 관련 운영 허브 화면

를 사전에 드러내고, 누락 없이 구현하기 위한 실제 작업 순서를 제공한다.

핵심 원칙:

1. 메뉴 순서보다 업무 폐쇄 루프를 먼저 본다.
2. broad menu는 기본적으로 screen set을 가진다고 가정한다.
3. 목록만 만들어서는 완료가 아니다.
4. 운영자가 `찾기 -> 확인 -> 조치 -> 결과 확인 -> 이력 추적` 까지 할 수 있어야 완료다.

## 구현 순서 원칙

추천 기본 순서:

1. 진입/권한 체계
2. 핵심 운영 업무
3. 보안/운영 관제
4. 플랫폼/거버넌스
5. 확장 관리 콘솔

한 메뉴의 최소 완료 루프:

1. 목록 또는 대시보드
2. 상세
3. 처리 액션
4. 결과 확인
5. 이력 또는 감사

## Broad Menu 우선 분해 대상

아래 메뉴들은 이름이 포괄적이라 screen set 누락 위험이 높다.

| 우선순위 | 메뉴코드 | 메뉴명 | 라우트 | broad 이유 |
| --- | --- | --- | --- | --- |
| 1 | `A0070102` | 운영센터 | `/admin/monitoring/center` | 관제 허브 성격이라 단일 화면으로 닫히지 않음 |
| 2 | `A0060201` | 보안 정책 관리 | `/admin/system/security-policy` | 정책 목록, 정책 상세, 예외, 조치, 감사가 분리됨 |
| 3 | `A0060202` | 실시간 공격 현황 | `/admin/system/security-monitoring` | 이벤트 리스트와 조치 흐름이 분리됨 |
| 4 | `A0060204` | IP 화이트리스트 | `/admin/system/ip_whitelist` | 정책 목록, 요청 등록, 승인 검토, 반영 상태가 필요 |
| 5 | `A0060304` | 통합 로그 | `/admin/system/unified_log` | 검색 허브, 추적 상세, 오류 drilldown이 따로 필요 |
| 6 | `A0060107` | 메뉴 관리 | `/admin/content/menu` | 트리 관리, 상세 수정, 노출 정책, 연결 기능이 나뉨 |
| 7 | `A0060105` | 페이지 관리 | `/admin/system/page-management` | 페이지 등록, 상세, feature 연결, 영향도 확인 필요 |
| 8 | `A0060108` | 풀스택 관리 | `/admin/system/full-stack-management` | 설치 단위, 의존성, 배포 단위, 점검 결과가 분리됨 |
| 9 | `A0060118` | 메뉴 통합 관리 | `/admin/system/environment-management` | 메뉴/페이지/기능/권한 연결 허브 성격 |
| 10 | `A1900102` | SR 워크벤치 | `/admin/system/sr-workbench` | 접수, 계획, 실행, 결과, 이력의 다단계 흐름 |

## 구현 Wave

### Wave A. 권한/계정 선행 안정화

대상 메뉴:

- `auth-group`
- `auth-change`
- `dept-role`
- `admin-permission`
- `admin-create`
- `admin-list`

이유:

- 이후 모든 관리자 화면의 진입/액션 권한이 여기 의존한다.
- broad menu를 먼저 만들어도 권한 체계가 흔들리면 검증이 무의미하다.

완료 기준:

- 메뉴 노출과 액션 권한이 분리 동작
- 권한 저장 후 실제 화면 진입/버튼/저장 가능 범위 일치
- 조직/부서 기준 grantable 범위 제한 확인

### Wave B. 운영자가 실제 많이 쓰는 core loop

대상 메뉴:

- `member-list`
- `member-detail`
- `member-edit`
- `member-approve`
- `company-list`
- `company-detail`
- `company-account`
- `company-approve`
- `password-reset`
- `login-history`

이유:

- 조회-상세-수정-승인-이력 루프가 가장 명확한 기준 세트다.
- 이 묶음이 먼저 닫혀야 나머지 운영 메뉴를 같은 규칙으로 분해하기 쉽다.

완료 기준:

- 목록 -> 상세 -> 수정/승인 -> 반영 확인 -> 이력 조회 루프 성립

### Wave C. 보안/운영 관제 screen set

대상 메뉴:

- `security-policy`
- `security-monitoring`
- `blocklist`
- `ip-whitelist`
- `security-audit`
- `security-history`
- `unified-log`
- `observability`
- `monitoring-center`

이유:

- broad menu가 몰려 있고 화면 간 참조가 강하다.
- 따로 만들면 중복과 누락이 생기므로 한 묶음으로 잡아야 한다.

완료 기준:

- 이벤트 탐지 -> 상세 확인 -> 정책/차단/허용 조치 -> 결과 확인 -> 감사 추적 루프 성립

### Wave D. 플랫폼/거버넌스 운영

대상 메뉴:

- `page-management`
- `function-management`
- `menu-management`
- `environment-management`
- `full-stack-management`
- `platform-studio`
- `screen-elements-management`

이유:

- 실제 화면보다 메타모델과 연결 관계가 중요하다.
- 메뉴/페이지/기능/권한/스크린 요소를 따로 만들면 계약이 어긋난다.

완료 기준:

- 메뉴 -> 페이지 -> 기능 -> 권한 -> 화면 메타 연결을 한 화면군 안에서 추적 가능

### Wave E. 실행형 운영 콘솔

대상 메뉴:

- `codex-request`
- `sr-workbench`
- `event-management-console`
- `function-management-console`
- `api-management-console`
- `controller-management-console`
- `db-table-management`
- `column-management-console`
- `automation-studio`

이유:

- 실행 파이프라인, 계획, 결과, 로그, 재실행까지 긴 루프를 가진다.
- UI보다 상태 전이와 실행 결과 표시가 중요하다.

완료 기준:

- 실행 요청 -> 상태 변화 -> 결과 확인 -> 로그/이력 확인 -> 재실행 루프 성립

## 메뉴별 Screen Set 예시

아래는 broad menu를 실제 구현 단위로 쪼갠 예시다.

### 1. 운영센터 `A0070102`

목적:

- 전체 운영 상태를 한 번에 보고 상세 조치 화면으로 진입하는 관제 허브

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| OC-01 | 운영센터 메인 대시보드 | dashboard | 전체 상태, 위험, 대기 이슈 요약 |
| OC-02 | 활성 이슈 드릴다운 | detail | 현재 심각 이슈 상세 확인 |
| OC-03 | 조치 이력 패널 | history | 최근 운영자 조치 확인 |
| OC-04 | 배치/알림/리소스 요약 패널 | summary | 관련 상세 메뉴로 이동 |

필수 기능:

- 실시간 요약 카드
- 미처리 이슈 카운트
- 상세 화면 바로가기
- 최근 조치 이력
- 운영자 메모 또는 가이드

연결 대상:

- `security-monitoring`
- `unified-log`
- `scheduler-management`
- `notification`
- `infra`

누락 주의:

- 운영센터 자체에서 모든 처리 기능을 다 넣으려 하지 말 것
- 대신 상세 화면으로 이어지는 허브 역할을 분명히 둘 것

### 2. 보안 정책 관리 `A0060201`

목적:

- 탐지 정책, 예외, 자동조치 기준을 운영 정책으로 관리

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| SP-01 | 정책 목록 | list | 정책 조회, 상태, 카테고리 확인 |
| SP-02 | 정책 상세 | detail | 조건, 범위, 예외, 변경 이력 확인 |
| SP-03 | 정책 등록/수정 | edit | 규칙, 임계치, 대상 저장 |
| SP-04 | 예외/베이스라인 관리 | settings | suppress/baseline 관리 |
| SP-05 | 정책 변경 이력 | history | 변경 추적과 감사 |

필수 기능:

- 정책 상태 전환
- 활성/비활성
- 영향 범위 표시
- 예외 등록
- 변경 감사 로그

누락 주의:

- 목록/저장만 만들고 예외 또는 변경 이력을 빼면 운영용이 아님

### 3. 실시간 공격 현황 `A0060202`

목적:

- 현재 탐지 이벤트를 보고 즉시 차단 또는 후속 조치로 연결

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| SM-01 | 이벤트 현황판 | list | 실시간 이벤트 목록과 심각도 |
| SM-02 | 이벤트 상세 | detail | IP, URL, fingerprint, 상태 확인 |
| SM-03 | 조치 패널 | action | 차단 후보 등록, 상태 갱신, 담당자 지정 |
| SM-04 | 알림/전파 결과 | result | 경보 전송 결과와 재시도 |
| SM-05 | 상태 변경 이력 | history | 누가 어떤 상태로 바꿨는지 추적 |

필수 기능:

- severity/time filter
- 상태 변경
- 담당자 지정
- 메모
- 차단 후보 등록
- 알림 재전송

누락 주의:

- 실시간 목록만 있으면 모니터링 도구이고 운영 화면은 아님
- 조치와 상태 이력까지 있어야 운영 화면이다

### 4. IP 화이트리스트 `A0060204`

목적:

- 허용 정책과 승인 요청을 함께 운영

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| IW-01 | 허용 정책 목록 | list | 현재 반영 정책 조회 |
| IW-02 | 요청 등록 | create | 신규 허용 요청 작성 |
| IW-03 | 요청 검토/승인 | approve | 승인/반려 및 메모 |
| IW-04 | 반영 결과 확인 | result | 게이트웨이/정책 반영 확인 |
| IW-05 | 요청/반영 이력 | history | 누가 언제 요청하고 승인했는지 |

누락 주의:

- 정책 조회와 요청 등록만으로 닫히지 않는다
- 승인/반영/이력까지 있어야 실제 운영 루프가 완성된다

### 5. 통합 로그 `A0060304`

목적:

- API, 화면, 사용자 행위, 오류, trace를 한 곳에서 찾고 drilldown

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| UL-01 | 통합 로그 검색 | list | 조건별 로그 검색 |
| UL-02 | trace/log 상세 | detail | 단건 이벤트 흐름 확인 |
| UL-03 | 오류 집중 보기 | exception | 실패 요청과 오류 패턴 확인 |
| UL-04 | 연관 엔터티 링크 패널 | drilldown | 사용자, 메뉴, API, trace 연결 |

누락 주의:

- 검색창과 테이블만 있으면 운영자에게는 불충분하다
- 단건 상세와 연관 링크가 반드시 필요하다

### 6. 메뉴 관리 `A0060107`

목적:

- 메뉴 트리, 노출 순서, 연결 페이지, 기능 메타를 관리

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| MM-01 | 메뉴 트리 목록 | list | 계층과 사용 여부 확인 |
| MM-02 | 메뉴 상세/수정 | edit | 라벨, URL, 순서, 사용 여부 수정 |
| MM-03 | 연결 페이지/기능 패널 | relation | page/feature 연결 확인 |
| MM-04 | 영향도 확인 | history | 하위 메뉴, 권한, 링크 영향 확인 |

누락 주의:

- 메뉴 추가만 되고 연결 페이지/기능 영향도가 안 보이면 운영 사고가 난다

### 7. 페이지 관리 `A0060105`

목적:

- 페이지 메타와 feature 기본 권한을 관리

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| PM-01 | 페이지 목록 | list | 페이지 등록 현황 조회 |
| PM-02 | 페이지 등록/수정 | edit | pageId, route, 설명, 상태 관리 |
| PM-03 | feature 연결 | relation | 기본 VIEW/action feature 연결 |
| PM-04 | 삭제 영향도 확인 | review | 삭제 차단 사유와 관련 기능 확인 |

### 8. 메뉴 통합 관리 `A0060118`

목적:

- 메뉴/페이지/기능/권한 메타 연결을 한 곳에서 관리

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| EM-01 | 통합 트리 뷰 | dashboard | 메뉴-페이지-기능 연결 한눈에 보기 |
| EM-02 | 선택 항목 상세 | detail | 연결 메타 상세 확인 |
| EM-03 | 연결 수정 패널 | edit | 페이지/기능/권한 연결 수정 |
| EM-04 | 정합성 점검 결과 | result | 누락/충돌/미등록 상태 확인 |

### 9. 풀스택 관리 `A0060108`

목적:

- 메뉴와 실제 구현 자산 간 연결을 운영 관점에서 추적

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| FS-01 | 설치 단위 목록 | list | 메뉴별 구현 자산 현황 조회 |
| FS-02 | 자산 상세 | detail | 화면, API, 함수, DB 자산 연결 확인 |
| FS-03 | 정합성/누락 점검 | review | 누락된 자산과 연결 오류 확인 |
| FS-04 | 배포/반영 상태 보기 | result | runtime 반영 상태와 버전 확인 |

### 10. SR 워크벤치 `A1900102`

목적:

- 요청 접수부터 계획, 빌드, 실행, 결과 확인까지 한 루프에서 운영

필수 screen set:

| Screen ID | 스크린명 | 유형 | 핵심 목적 |
| --- | --- | --- | --- |
| SR-01 | 요청 목록 | list | 작업 요청 검색과 상태 확인 |
| SR-02 | 요청 상세 | detail | 요구사항, 영향 범위, 첨부 확인 |
| SR-03 | 계획/준비 화면 | edit | 작업 계획, 체크리스트, 범위 정의 |
| SR-04 | 실행/빌드 콘솔 | execution | 실행 상태와 로그 확인 |
| SR-05 | 결과/이력 | history | 결과, 실패 원인, 재실행 판단 |

## 누락 방지 체크 규칙

아래 중 하나라도 없으면 broad menu는 미완성으로 본다.

- 진입 화면
- 상세 확인 화면
- 실제 액션 화면
- 결과 확인 화면
- 이력 또는 감사 화면

운영계 메뉴 추가 체크:

- 상태값 정의
- 담당자 또는 승인자
- 메모/사유
- 실패 복구 경로
- 권한 제한
- 감사 로그
- 연관 메뉴 바로가기

거버넌스 메뉴 추가 체크:

- 관계도 또는 영향도
- 정합성 검사
- 미등록/충돌 상태 표시
- 삭제 차단 사유

## 요청할 때 이렇게 주면 가장 안전함

Codex에 구현 요청할 때는 메뉴 이름만 주지 말고 아래 형식으로 주는 것을 권장한다.

```md
- 대상 메뉴:
- 메뉴 코드:
- 메뉴 목적:
- 이 메뉴에서 닫혀야 하는 업무 루프:
- 이미 있는 관련 화면:
- 추가로 필요할 것 같은 화면:
- 필수 액션:
- 필수 이력/감사:
- API/DB 준비 상태:
- 우선순위:
- 완료 기준:
```

## 현재 저장소 기준 추천 실행 순서

가장 안전한 실제 구현 묶음:

1. 권한/계정 6종
2. 회원/회원사 core loop
3. 보안운영 5종
4. 운영센터와 통합 로그/observability 연결
5. 메뉴/페이지/환경 통합관리 4종
6. 풀스택 관리와 SR 워크벤치

이 순서를 따르면:

- 먼저 접근과 권한을 안정화하고
- 그다음 가장 자주 쓰는 운영 루프를 닫고
- 이후 broad menu를 관련 상세 화면과 함께 묶어 만들 수 있어서
- "메뉴는 있는데 실제 운영은 안 되는" 상태를 줄일 수 있다.

## 관리자 메뉴 전체 분해표

아래 표는 현재 관리자 라우트 기준으로 각 메뉴가 최소 어느 정도의 screen set을 가져야 하는지 정리한 것이다.

screen set shorthand:

- `S1`: 단일 독립 화면 중심
- `L+D`: 목록 + 상세
- `L+D+E`: 목록 + 상세 + 등록/수정
- `L+D+A+H`: 목록 + 상세 + 승인/액션 + 이력
- `D+Drill`: 대시보드 + drilldown
- `Meta`: 메타/연결/정합성 관리 세트
- `Exec`: 실행/결과/이력 콘솔 세트

### 관리자 진입/공통

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `admin-home` | 관리자 홈 | `/admin/` | dashboard | `D+Drill` | 공지, 요약 카드, 주요 메뉴 진입 |
| `admin-login` | 관리자 로그인 | `/admin/login/loginView` | auth | `S1` | 실패, 잠금, 비밀번호 정책 |
| `admin-sitemap` | 관리자 사이트맵 | `/admin/content/sitemap` | navigation | `S1` | 권한별 노출 차이 |
| `admin-menu-placeholder` | 관리자 메뉴 플레이스홀더 | `/admin/placeholder` | placeholder | `S1` | 대체 경로와 안내 링크 |

### 권한/계정

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `auth-group` | 권한 그룹 | `/admin/auth/group` | policy | `L+D+E` | 그룹 상세, 기능 연결, 사용 범위 |
| `auth-change` | 권한 변경 | `/admin/member/auth-change` | approval | `L+D+A+H` | 변경 사유, 승인/반려, 반영 이력 |
| `dept-role` | 부서 권한 맵핑 | `/admin/member/dept-role-mapping` | mapping | `L+D+E` | 조직별 범위, 저장 전 검토 |
| `admin-permission` | 관리자 권한 | `/admin/member/admin_account/permissions` | policy | `L+D+E` | grantable 범위, 메뉴 노출 영향 |
| `admin-create` | 관리자 생성 | `/admin/member/admin_account` | create | `S1` + 관련 `H` | 생성 후 권한 연결, 감사 |
| `admin-list` | 관리자 목록 | `/admin/member/admin_list` | list | `L+D+E` | 상세, 상태 변경, 잠금 처리 |

### 회원/회원사 운영

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `member-list` | 회원 목록 | `/admin/member/list` | list | `L+D+E` | 상세 이동, 상태별 필터 |
| `member-detail` | 회원 상세 | `/admin/member/detail` | detail | `S1` + 관련 `H` | 수정/승인/이력 링크 |
| `member-edit` | 회원 수정 | `/admin/member/edit` | edit | `S1` + 관련 `H` | 저장 후 반영 확인 |
| `member-approve` | 회원 승인 | `/admin/member/approve` | approval | `L+D+A+H` | 반려 사유, 재승인, 이력 |
| `member-register` | 회원 등록 | `/admin/member/register` | create | `S1` + 관련 `H` | 생성 후 목록/상세 연결 |
| `member-stats` | 회원 통계 | `/admin/member/stats` | dashboard | `D+Drill` | 기간 필터, drilldown |
| `member-withdrawn` | 탈퇴 회원 | `/admin/member/withdrawn` | history | `L+D` | 탈퇴 사유, 복구 가능 여부 |
| `member-activate` | 휴면 계정 | `/admin/member/activate` | execution | `L+D+A+H` | 휴면 해제, 알림, 이력 |
| `company-list` | 회원사 목록 | `/admin/member/company_list` | list | `L+D+E` | 승인/상세/수정 연결 |
| `company-detail` | 회원사 상세 | `/admin/member/company_detail` | detail | `S1` + 관련 `H` | 계정, 승인, 변경 이력 연결 |
| `company-account` | 회원사 계정 | `/admin/member/company_account` | create/edit | `L+D+E` | 신규/수정 분기, 담당자 매핑 |
| `company-approve` | 회원사 승인 | `/admin/member/company-approve` | approval | `L+D+A+H` | 반려, 재신청, 상태 반영 |
| `password-reset` | 비밀번호 초기화 | `/admin/member/reset_password` | action/history | `L+D+A+H` | 사유, 알림, 만료 처리 |
| `login-history` | 로그인 이력 | `/admin/member/login_history` | history | `L+D` | 실패 이력, 보안 연계 |
| `member-security-history` | 회원 접근 차단 이력 | `/admin/member/security` | history | `L+D` | 차단 원인과 복구 링크 |

### 배출/업무

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `emission-result-list` | 배출 결과 목록 | `/admin/emission/result_list` | list | `L+D` | 결과 상세, 검증/이력 연결 |
| `emission-site-management` | 배출지 관리 | `/admin/emission/site-management` | management | `L+D+E` | 상태, 담당자, 노출 영향 |

### 시스템 코드/로그/운영

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `system-code` | 시스템 코드 | `/admin/system/code` | management | `L+D+E` | 코드 상세, 사용 영향도 |
| `ip-whitelist` | IP 화이트리스트 | `/admin/system/ip_whitelist` | approval/ops | `L+D+A+H` | 요청 등록, 승인, 반영 확인 |
| `access-history` | 접속 로그 | `/admin/system/access_history` | history | `L+D` | 상세 trace 연결 |
| `error-log` | 에러 로그 | `/admin/system/error-log` | exception | `L+D+Drill` | 오류 상세와 연관 API |
| `security-history` | 보안 이력 | `/admin/system/security` | history | `L+D` | 정책/차단/감사 링크 |
| `security-policy` | 보안 정책 | `/admin/system/security-policy` | policy | `L+D+E+H` | 예외, 상태 전환, 변경 이력 |
| `security-monitoring` | 보안 모니터링 | `/admin/system/security-monitoring` | monitoring | `D+Drill` + `A+H` | 실시간 이벤트, 조치, 상태 이력 |
| `blocklist` | 차단 목록 | `/admin/system/blocklist` | policy | `L+D+E+H` | 해제 요청, 반영 이력 |
| `security-audit` | 보안 감사 | `/admin/system/security-audit` | audit | `L+D+Drill` | actor, trace, 결과 추적 |
| `scheduler-management` | 스케줄러 관리 | `/admin/system/scheduler` | execution | `L+D+A+H` | 수동 실행, 결과, 실패 재시도 |
| `backup-config` | 백업 설정 | `/admin/system/backup_config` | settings | `L+D+E` | 정책 저장, 보존주기 영향 |
| `backup-execution` | 백업 실행 | `/admin/system/backup` | execution | `L+D+A+H` | 실행 결과, 실패 로그 |
| `restore-execution` | 복구 실행 | `/admin/system/restore` | execution | `L+D+A+H` | 승인, 위험 경고, 결과 확인 |
| `version-management` | 버전 관리 | `/admin/system/version` | management | `L+D+H` | 배포 단위, 변경 이력 |
| `unified-log` | 통합 로그 | `/admin/system/unified_log` | observability | `L+D+Drill` | trace 상세, 연관 링크 |
| `observability` | 추적 조회 | `/admin/system/observability` | observability | `L+D+Drill` | API/화면/이벤트 체인 |

### 모니터링/운영 허브

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `monitoring-center` | 운영센터 | `/admin/monitoring/center` | command center | `D+Drill` | 허브 역할과 상세 화면 연결 |

주의:

- `monitoring-center`는 현재 라우트 정의 파일에는 별도 ID가 없지만 메뉴/WBS에는 존재한다.
- 구현 시 route registry와 menu metadata를 함께 맞춰야 한다.

### 플랫폼/거버넌스

| Route ID | 메뉴명 | 라우트 | 유형 | 최소 screen set | 누락 주의 |
| --- | --- | --- | --- | --- | --- |
| `page-management` | 화면 관리 | `/admin/system/page-management` | metadata | `Meta` | feature 연결, 삭제 영향도 |
| `function-management` | 기능 관리 | `/admin/system/feature-management` | metadata | `Meta` | 기능 분류, 권한 연결 |
| `menu-management` | 메뉴 관리 | `/admin/content/menu` | metadata | `Meta` | 메뉴 트리, 연결 페이지, 영향도 |
| `full-stack-management` | 풀스택 관리 | `/admin/system/full-stack-management` | governance | `Meta` | 화면-API-DB 연결 누락 |
| `platform-studio` | 플랫폼 스튜디오 | `/admin/system/platform-studio` | governance | `Meta` | 여러 자산 편집 관계 |
| `screen-elements-management` | 화면 요소 관리 | `/admin/system/screen-elements-management` | governance | `Meta` | 요소 카탈로그와 사용처 |
| `event-management-console` | 이벤트 관리 | `/admin/system/event-management-console` | governance | `Meta` + `Exec` | 이벤트 정의와 이력 |
| `function-management-console` | 함수 콘솔 | `/admin/system/function-management-console` | governance | `Meta` + `Exec` | 함수 정의와 테스트 실행 |
| `api-management-console` | API 관리 | `/admin/system/api-management-console` | governance | `Meta` + `Exec` | 스펙, 테스트, 이력 |
| `controller-management-console` | 컨트롤러 관리 | `/admin/system/controller-management-console` | governance | `Meta` | 엔드포인트 연결 관계 |
| `db-table-management` | DB 테이블 관리 | `/admin/system/db-table-management` | governance | `Meta` | 테이블 상세와 참조 관계 |
| `column-management-console` | 컬럼 관리 | `/admin/system/column-management-console` | governance | `Meta` | 컬럼 정의와 사용처 |
| `automation-studio` | 자동화 스튜디오 | `/admin/system/automation-studio` | execution/governance | `Meta` + `Exec` | 플로우 정의, 실행 결과 |
| `environment-management` | 메뉴 통합 관리 | `/admin/system/environment-management` | governance hub | `Meta` | 메뉴/페이지/기능/권한 정합성 |
| `screen-builder` | 화면 빌더 | `/admin/system/screen-builder` | builder | `Meta` + `Exec` | draft, publish, runtime 분리 |
| `screen-runtime` | 발행 화면 런타임 | `/admin/system/screen-runtime` | runtime | `D+Drill` | publish 상태와 runtime 비교 |
| `current-runtime-compare` | 현재 런타임 비교 | `/admin/system/current-runtime-compare` | compare | `L+D+Drill` | draft/published/runtime diff |
| `repair-workbench` | 복구 워크벤치 | `/admin/system/repair-workbench` | execution | `Exec` | 진단, 계획, 복구 결과 |
| `screen-flow-management` | 화면 흐름 관리 | `/admin/system/screen-flow-management` | governance | `Meta` | 화면 간 연결과 진입 흐름 |
| `screen-menu-assignment-management` | 화면-메뉴 귀속 관리 | `/admin/system/screen-menu-assignment-management` | governance | `Meta` | 귀속 누락, orphan 화면 |
| `wbs-management` | WBS 관리 | `/admin/system/wbs-management` | planning | `L+D+E+H` | 계획, 진행, 이력 |
| `help-management` | 도움말 운영 | `/admin/system/help-management` | governance | `Meta` + `H` | 단계 편집, 저장 이력 |
| `sr-workbench` | SR 워크벤치 | `/admin/system/sr-workbench` | execution | `Exec` | 요청, 승인, 실행, 결과 |
| `codex-request` | Codex Execution Console | `/admin/system/codex-request` | execution | `Exec` | 실행, inspect, remediate, history |

## 구현 묶음 제안

메뉴별로 따로 요청하지 말고 아래 묶음 단위로 요청하는 것이 누락 방지에 유리하다.

### 묶음 1. 권한/계정 기반

- `auth-group`
- `auth-change`
- `dept-role`
- `admin-permission`
- `admin-create`
- `admin-list`

이 묶음의 완료 기준:

- 권한 저장 후 실제 메뉴/API 사용 가능 범위까지 일치

### 묶음 2. 회원/회원사 core loop

- `member-list`
- `member-detail`
- `member-edit`
- `member-approve`
- `company-list`
- `company-detail`
- `company-account`
- `company-approve`
- `password-reset`
- `login-history`

이 묶음의 완료 기준:

- 목록 -> 상세 -> 수정/승인 -> 결과 -> 이력 루프 완성

### 묶음 3. 보안 운영 loop

- `security-policy`
- `security-monitoring`
- `blocklist`
- `ip-whitelist`
- `security-audit`
- `security-history`

이 묶음의 완료 기준:

- 탐지 -> 정책/차단/허용 조치 -> 감사 추적 루프 완성

### 묶음 4. 로그/추적/운영센터 허브

- `unified-log`
- `observability`
- `access-history`
- `error-log`
- `monitoring-center`

이 묶음의 완료 기준:

- 운영센터에서 이상 발견 후 상세 로그/trace로 바로 내려가고 다시 결과 확인 가능

### 묶음 5. 메타/거버넌스 허브

- `menu-management`
- `page-management`
- `function-management`
- `environment-management`
- `full-stack-management`

이 묶음의 완료 기준:

- 메뉴 -> 페이지 -> 기능 -> 권한 -> 구현 자산 연결 추적 가능

### 묶음 6. 실행형 관리 콘솔

- `sr-workbench`
- `codex-request`
- `scheduler-management`
- `backup-execution`
- `restore-execution`
- `automation-studio`

이 묶음의 완료 기준:

- 요청/실행 -> 결과 -> 재시도/이력 루프 완성

## 묶음 3 상세 백로그: 보안 운영 loop

범위:

- `security-policy`
- `security-monitoring`
- `blocklist`
- `ip-whitelist`
- `security-audit`
- `security-history`

목표 폐쇄 루프:

1. 이상 탐지
2. 이벤트 상세 확인
3. 정책 또는 차단/허용 조치 판단
4. 조치 실행 또는 승인
5. 반영 결과 확인
6. 감사/이력 추적

선행 조건:

- 권한 체계 완료
- 관리자 공통 shell, breadcrumb, bilingual contract 안정화
- 감사 이벤트 저장 경로와 공통 actor context 사용 가능

### 보안 운영 loop 구현 순서

1. `security-monitoring` 조회/상세 기반
2. `blocklist` 조치 대상 관리
3. `security-policy` 정책 판단/예외 처리
4. `ip-whitelist` 허용 요청/승인 흐름
5. `security-history` 반영 이력 확인
6. `security-audit` 감사 추적 마감

이 순서의 이유:

- 먼저 이벤트를 봐야 하고
- 그 다음 조치 대상과 정책 판단이 있어야 하며
- 이후 허용 예외를 운영하고
- 마지막에 이력과 감사로 루프를 닫는다

### 티켓 B3-01. Security Monitoring 목록/필터/상세

대상 메뉴:

- `security-monitoring`

구현 범위:

- 이벤트 목록
- 심각도/시간/상태 필터
- 선택 이벤트 상세 패널
- 이벤트와 IP/URL/fingerprint drilldown
- 상태 변경 기본 골격

필수 화면:

- `SM-01` 이벤트 현황판
- `SM-02` 이벤트 상세

필수 기능:

- severity filter
- time range filter
- 상태 필터
- 키워드 검색
- 페이지네이션
- 선택 이벤트 상세 동기화

완료 기준:

- 운영자가 현재 이벤트를 찾고
- 심각한 이벤트를 좁혀 보고
- 상세 정보로 다음 조치를 결정할 수 있음

선행:

- 없음

후속 연결:

- `B3-02`
- `B3-03`

### 티켓 B3-02. Security Monitoring 조치 패널 및 상태 이력

대상 메뉴:

- `security-monitoring`

구현 범위:

- 상태 변경
- 담당자 지정
- 메모 입력
- 차단 후보 등록
- 알림 재전송
- 상태 변경 이력 조회

필수 화면:

- `SM-03` 조치 패널
- `SM-04` 알림/전파 결과
- `SM-05` 상태 변경 이력

필수 기능:

- NEW/IN_PROGRESS/RESOLVED 등 상태 전이
- owner 지정
- note 기록
- block candidate 등록
- notification retry
- state history 조회

완료 기준:

- 운영자가 이벤트를 보고 직접 조치하고
- 누가 무엇을 바꿨는지 추적 가능

선행:

- `B3-01`

후속 연결:

- `B3-03`
- `B3-05`

### 티켓 B3-03. Blocklist 목록/상세/상태관리

대상 메뉴:

- `blocklist`

구현 범위:

- 차단 대상 목록
- 차단 상세
- 상태 변경
- 해제 또는 만료 처리
- 차단 반영 이력

필수 화면:

- `BL-01` 차단 목록
- `BL-02` 차단 상세
- `BL-03` 상태 변경/해제
- `BL-04` 차단 이력

필수 기능:

- source event 연결
- 차단 사유
- 만료 시각
- 해제 사유
- 현재 상태
- 반영 결과 표시

완료 기준:

- 보안 모니터링에서 등록한 후보가 실제 차단 관리 루프로 이어짐

선행:

- `B3-01`
- `B3-02`

후속 연결:

- `B3-05`
- `B3-06`

### 티켓 B3-04. Security Policy 목록/상세/수정

대상 메뉴:

- `security-policy`

구현 범위:

- 정책 목록
- 정책 상세
- 정책 등록/수정
- 활성/비활성
- 범위와 임계치 표시

필수 화면:

- `SP-01` 정책 목록
- `SP-02` 정책 상세
- `SP-03` 정책 등록/수정

필수 기능:

- 카테고리/상태 필터
- 정책 조건 편집
- 임계치 편집
- 활성 상태 토글
- 영향 범위 표시

완료 기준:

- 운영자가 탐지 정책을 조회하고 수정하고 다시 사용할 수 있음

선행:

- `B3-01`

후속 연결:

- `B3-05`
- `B3-06`

### 티켓 B3-05. Security Policy 예외/허용 연계

대상 메뉴:

- `security-policy`
- `ip-whitelist`

구현 범위:

- 정책 예외 또는 baseline 관리
- 화이트리스트 요청 등록
- 승인/반려
- 반영 결과
- 요청/승인 이력

필수 화면:

- `SP-04` 예외/베이스라인 관리
- `IW-01` 허용 정책 목록
- `IW-02` 요청 등록
- `IW-03` 요청 검토/승인
- `IW-04` 반영 결과 확인
- `IW-05` 요청/반영 이력

필수 기능:

- 정책 예외 생성
- whitelist request 생성
- approve/reject
- review note
- reflected status 표시
- source request와 승인자 추적

완료 기준:

- 차단 또는 탐지 정책에 대해 운영상 필요한 허용 예외를 통제된 승인 흐름으로 처리 가능

선행:

- `B3-03`
- `B3-04`

후속 연결:

- `B3-06`

### 티켓 B3-06. Security History / Audit 추적 마감

대상 메뉴:

- `security-history`
- `security-audit`

구현 범위:

- 정책/차단/허용/상태 변경의 통합 이력 조회
- actor, action, result, trace 기반 감사 추적
- 관련 메뉴 역링크
- 상세 drilldown

필수 화면:

- `SH-01` 보안 이력 목록
- `SH-02` 이력 상세
- `SA-01` 보안 감사 로그 검색
- `SA-02` 감사 이벤트 상세

필수 기능:

- 기간/행위자/대상/결과 필터
- 정책/차단/허용 유형별 분류
- traceId 기반 연결
- related route 링크
- 실패 액션 추적

완료 기준:

- 운영자가 "왜 차단됐는지", "누가 승인했는지", "언제 정책이 바뀌었는지"를 한 흐름에서 추적 가능

선행:

- `B3-02`
- `B3-03`
- `B3-04`
- `B3-05`

후속 연결:

- 없음

## 묶음 3 API/데이터 계약 체크리스트

이 묶음을 구현할 때 메뉴별 화면보다 아래 계약을 먼저 확인해야 한다.

- 이벤트 row에 `severity`, `detectedAt`, `stateStatus`, `stateOwner`, `stateNote`, `fingerprint`, `sourceIp`, `targetUrl` 존재 여부
- 차단 대상 row에 `status`, `reason`, `expiresAt`, `sourceEventId`, `updatedAt` 존재 여부
- 정책 row에 `policyId`, `category`, `enabled`, `threshold`, `scope`, `updatedBy`, `updatedAt` 존재 여부
- whitelist request row에 `requestId`, `approvalStatus`, `requester`, `reviewer`, `reviewNote`, `reflectedAt` 존재 여부
- history/audit row에 `actorId`, `actionType`, `targetType`, `targetId`, `resultStatus`, `traceId`, `createdAt` 존재 여부

## 묶음 3 화면 누락 점검표

아래 질문에 하나라도 `아니오`면 보안 운영 loop는 미완성이다.

- 운영자가 현재 이벤트를 볼 수 있는가
- 이벤트 상세에서 조치 판단이 가능한가
- 차단 대상으로 넘길 수 있는가
- 허용 예외를 승인 흐름으로 처리할 수 있는가
- 정책 변경이 이력에 남는가
- 최종 조치 결과를 감사 로그에서 다시 찾을 수 있는가
- 관련 화면끼리 상호 이동이 가능한가

## 묶음 3 요청 예시

Codex에 실제 구현 요청 시 아래처럼 주는 것을 권장한다.

```md
보안 운영 loop 묶음 3을 구현해줘.

- 1차 범위: B3-01, B3-02
- 대상 메뉴: security-monitoring
- 완료 기준:
  - 이벤트 목록/필터/상세 가능
  - 상태 변경, 담당자 지정, 메모 저장 가능
  - 차단 후보 등록 가능
  - 상태 변경 이력 조회 가능
- 연계 메뉴: blocklist, security-audit
```

## 구현 현황 분류 기준

현재 저장소에서는 아래 기준으로 분류한다.

- `이미 구현`
  - route가 존재하고
  - pageRegistry에 연결되어 있으며
  - 전용 또는 목적에 맞는 실제 화면 컴포넌트가 있다
- `부분 구현`
  - route는 존재하지만
  - 다른 메뉴와 동일 컴포넌트를 공유하거나
  - 범용 허브/공용 콘솔/백업 공용 화면으로 우회된다
- `미구현`
  - 메뉴나 WBS에는 있으나
  - route registry 또는 실제 페이지 연결이 없다

주의:

- `부분 구현`은 재구현 제외 대상이 아니다.
- 신규 화면을 만들 때 링크 대상, 상태 연동 대상, 분리 구현 후보로 계속 관리해야 한다.

## 현재 관리자 화면 분류표

근거 파일:

- [pageRegistry.tsx](/opt/projects/carbonet/frontend/src/app/routes/pageRegistry.tsx)
- [definitions.ts](/opt/projects/carbonet/frontend/src/app/routes/definitions.ts)
- `frontend/src/features/*`

### 1. 이미 구현된 화면

아래 화면들은 현재 저장소에 route와 연결 컴포넌트가 있다. 신규 구현 대상에서는 기본적으로 제외하되, 연동 대상 여부는 별도 확인한다.

| Route ID | 메뉴명 | 상태 | 주 구현 파일 | 연동 대상 여부 |
| --- | --- | --- | --- | --- |
| `auth-group` | 권한 그룹 | 이미 구현 | `frontend/src/features/auth-groups/AuthGroupMigrationPage.tsx` | 높음 |
| `auth-change` | 권한 변경 | 이미 구현 | `frontend/src/features/auth-change/AuthChangeMigrationPage.tsx` | 높음 |
| `dept-role` | 부서 권한 맵핑 | 이미 구현 | `frontend/src/features/dept-role-mapping/DeptRoleMappingMigrationPage.tsx` | 높음 |
| `admin-permission` | 관리자 권한 | 이미 구현 | `frontend/src/features/admin-permissions/AdminPermissionMigrationPage.tsx` | 높음 |
| `admin-create` | 관리자 생성 | 이미 구현 | `frontend/src/features/admin-account-create/AdminAccountCreateMigrationPage.tsx` | 중간 |
| `admin-list` | 관리자 목록 | 이미 구현 | `frontend/src/features/admin-list/AdminListMigrationPage.tsx` | 높음 |
| `member-list` | 회원 목록 | 이미 구현 | `frontend/src/features/member-list/MemberListMigrationPage.tsx` | 높음 |
| `member-detail` | 회원 상세 | 이미 구현 | `frontend/src/features/member-detail/MemberDetailMigrationPage.tsx` | 높음 |
| `member-edit` | 회원 수정 | 이미 구현 | `frontend/src/features/member-edit/MemberEditMigrationPage.tsx` | 높음 |
| `member-approve` | 회원 승인 | 이미 구현 | `frontend/src/features/member-approve/MemberApproveMigrationPage.tsx` | 높음 |
| `member-register` | 회원 등록 | 이미 구현 | `frontend/src/features/member-register/MemberRegisterMigrationPage.tsx` | 중간 |
| `member-stats` | 회원 통계 | 이미 구현 | `frontend/src/features/member-stats/MemberStatsMigrationPage.tsx` | 중간 |
| `company-list` | 회원사 목록 | 이미 구현 | `frontend/src/features/company-list/CompanyListMigrationPage.tsx` | 높음 |
| `company-detail` | 회원사 상세 | 이미 구현 | `frontend/src/features/company-detail/CompanyDetailMigrationPage.tsx` | 높음 |
| `company-account` | 회원사 계정 | 이미 구현 | `frontend/src/features/company-account/CompanyAccountMigrationPage.tsx` | 높음 |
| `company-approve` | 회원사 승인 | 이미 구현 | `frontend/src/features/company-approve/CompanyApproveMigrationPage.tsx` | 높음 |
| `password-reset` | 비밀번호 초기화 | 이미 구현 | `frontend/src/features/password-reset/PasswordResetMigrationPage.tsx` | 중간 |
| `login-history` | 로그인 이력 | 이미 구현 | `frontend/src/features/login-history/LoginHistoryMigrationPage.tsx` | 중간 |
| `emission-result-list` | 배출 결과 목록 | 이미 구현 | `frontend/src/features/emission-result-list/EmissionResultListMigrationPage.tsx` | 중간 |
| `emission-site-management` | 배출지 관리 | 이미 구현 | `frontend/src/features/emission-site-management/EmissionSiteManagementMigrationPage.tsx` | 중간 |
| `system-code` | 시스템 코드 | 이미 구현 | `frontend/src/features/system-code/SystemCodeMigrationPage.tsx` | 중간 |
| `page-management` | 화면 관리 | 이미 구현 | `frontend/src/features/page-management/PageManagementMigrationPage.tsx` | 높음 |
| `function-management` | 기능 관리 | 이미 구현 | `frontend/src/features/function-management/FunctionManagementMigrationPage.tsx` | 높음 |
| `menu-management` | 메뉴 관리 | 이미 구현 | `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx` | 높음 |
| `full-stack-management` | 풀스택 관리 | 이미 구현 | `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx` | 높음 |
| `environment-management` | 메뉴 통합 관리 | 이미 구현 | `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx` | 높음 |
| `screen-builder` | 화면 빌더 | 이미 구현 | `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx` | 중간 |
| `screen-runtime` | 발행 화면 런타임 | 이미 구현 | `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx` | 중간 |
| `current-runtime-compare` | 현재 런타임 비교 | 이미 구현 | `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx` | 중간 |
| `repair-workbench` | 복구 워크벤치 | 이미 구현 | `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx` | 중간 |
| `screen-flow-management` | 화면 흐름 관리 | 이미 구현 | `frontend/src/features/screen-management/ScreenFlowManagementMigrationPage.tsx` | 높음 |
| `screen-menu-assignment-management` | 화면-메뉴 귀속 관리 | 이미 구현 | `frontend/src/features/screen-management/ScreenMenuAssignmentManagementMigrationPage.tsx` | 높음 |
| `wbs-management` | WBS 관리 | 이미 구현 | `frontend/src/features/wbs-management/WbsManagementMigrationPage.tsx` | 중간 |
| `ip-whitelist` | IP 화이트리스트 | 이미 구현 | `frontend/src/features/ip-whitelist/IpWhitelistMigrationPage.tsx` | 높음 |
| `access-history` | 접속 로그 | 이미 구현 | `frontend/src/features/access-history/AccessHistoryMigrationPage.tsx` | 높음 |
| `error-log` | 에러 로그 | 이미 구현 | `frontend/src/features/error-log/ErrorLogMigrationPage.tsx` | 높음 |
| `member-security-history` | 회원 접근 차단 이력 | 이미 구현 | `frontend/src/features/security-history/MemberSecurityHistoryMigrationPage.tsx` | 높음 |
| `security-history` | 보안 이력 | 이미 구현 | `frontend/src/features/security-history/SecurityHistoryMigrationPage.tsx` | 높음 |
| `security-policy` | 보안 정책 | 이미 구현 | `frontend/src/features/security-policy/SecurityPolicyMigrationPage.tsx` | 높음 |
| `security-monitoring` | 보안 모니터링 | 이미 구현 | `frontend/src/features/security-monitoring/SecurityMonitoringMigrationPage.tsx` | 높음 |
| `blocklist` | 차단 목록 | 이미 구현 | `frontend/src/features/blocklist/BlocklistMigrationPage.tsx` | 높음 |
| `security-audit` | 보안 감사 | 이미 구현 | `frontend/src/features/security-audit/SecurityAuditMigrationPage.tsx` | 높음 |
| `scheduler-management` | 스케줄러 관리 | 이미 구현 | `frontend/src/features/scheduler-management/SchedulerManagementMigrationPage.tsx` | 중간 |
| `codex-request` | Codex Execution Console | 이미 구현 | `frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx` | 높음 |
| `unified-log` | 통합 로그 | 이미 구현 | `frontend/src/features/observability/ObservabilityMigrationPage.tsx` | 높음 |
| `observability` | 추적 조회 | 이미 구현 | `frontend/src/features/observability/ObservabilityMigrationPage.tsx` | 높음 |
| `help-management` | 도움말 운영 | 이미 구현 | `frontend/src/features/help-management/HelpManagementMigrationPage.tsx` | 중간 |
| `sr-workbench` | SR 워크벤치 | 이미 구현 | `frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx` | 높음 |
| `admin-sitemap` | 관리자 사이트맵 | 이미 구현 | `frontend/src/features/admin-sitemap/AdminSitemapMigrationPage.tsx` | 낮음 |
| `admin-menu-placeholder` | 관리자 메뉴 플레이스홀더 | 이미 구현 | `frontend/src/features/admin-placeholder/AdminMenuPlaceholderPage.tsx` | 낮음 |

### 2. 부분 구현된 화면

아래 화면들은 route는 있지만 전용 구현이 아니라 공용 화면을 공유한다. 신규 구현 우선순위에서는 "부분 구현 보완" 후보로 본다.

| Route ID | 메뉴명 | 현재 연결 상태 | 현재 연결 파일 | 왜 부분 구현인지 | 연결해야 할 기존 화면 |
| --- | --- | --- | --- | --- | --- |
| `member-withdrawn` | 탈퇴 회원 | 회원 목록 공용 사용 | `frontend/src/features/member-list/MemberListMigrationPage.tsx` | 전용 폐쇄 루프가 분리되지 않음 | `member-list`, `member-detail` |
| `member-activate` | 휴면 계정 | 회원 목록 공용 사용 | `frontend/src/features/member-list/MemberListMigrationPage.tsx` | 휴면 해제 결과/이력 전용 흐름 부족 | `member-list`, `login-history` |
| `platform-studio` | 플랫폼 스튜디오 | 자체 구현 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 아래 여러 메뉴와 겸용으로 쓰임 | `environment-management`, `full-stack-management` |
| `screen-elements-management` | 화면 요소 관리 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 전용 정보구조 미분리 | `platform-studio`, `screen-builder` |
| `event-management-console` | 이벤트 관리 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 이벤트 콘솔 전용 실행/이력 부족 | `platform-studio`, `observability` |
| `function-management-console` | 함수 콘솔 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 함수 테스트/실행 분리 부족 | `function-management`, `platform-studio` |
| `api-management-console` | API 관리 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | API 스펙/테스트/이력 분리 부족 | `observability`, `platform-studio` |
| `controller-management-console` | 컨트롤러 관리 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 엔드포인트 연결 관계 전용 화면 부족 | `api-management-console`, `platform-studio` |
| `db-table-management` | DB 테이블 관리 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 테이블 상세/참조관계 전용 화면 부족 | `full-stack-management`, `platform-studio` |
| `column-management-console` | 컬럼 관리 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 컬럼별 사용처/영향도 전용 화면 부족 | `db-table-management`, `platform-studio` |
| `automation-studio` | 자동화 스튜디오 | 플랫폼 스튜디오 공용 사용 | `frontend/src/features/platform-studio/PlatformStudioMigrationPage.tsx` | 자동화 실행/이력/재실행 루프 부족 | `platform-studio`, `sr-workbench` |
| `backup-config` | 백업 설정 | 백업 공용 사용 | `frontend/src/features/backup-config/BackupConfigMigrationPage.tsx` | 전용 설정 탭/흐름 확인 필요 | `backup-execution`, `restore-execution` |
| `backup-execution` | 백업 실행 | 백업 공용 사용 | `frontend/src/features/backup-config/BackupConfigMigrationPage.tsx` | 실행 결과/이력 분리 확인 필요 | `backup-config`, `restore-execution` |
| `restore-execution` | 복구 실행 | 백업 공용 사용 | `frontend/src/features/backup-config/BackupConfigMigrationPage.tsx` | 위험 경고/승인/결과 분리 확인 필요 | `backup-config`, `backup-execution` |
| `version-management` | 버전 관리 | 백업 공용 사용 | `frontend/src/features/backup-config/BackupConfigMigrationPage.tsx` | 버전 전용 정보구조 불명확 | `backup-config`, `full-stack-management` |

### 3. 미구현 또는 라우트 미정합 화면

아래 화면들은 메뉴/WBS에는 있지만 현재 route registry 또는 page registry 기준으로 직접 구현 연결이 없다.

| 메뉴명 | 메뉴코드 | 상태 | 확인 내용 | 우선 처리 방향 | 연결해야 할 기존 화면 |
| --- | --- | --- | --- | --- | --- |
| 운영센터 | `A0070102` | 미구현/라우트 미정합 | 메뉴/WBS 존재, `definitions.ts`에 별도 route id 없음 | 신규 구현 1순위 후보 | `security-monitoring`, `unified-log`, `scheduler-management`, `error-log` |

## 실제 구현 대상 선정 규칙

이제부터는 아래 순서로 고른다.

1. `미구현` 화면부터 본다.
2. 그 다음 `부분 구현` 중 공용 화면을 벗겨야 하는 메뉴를 본다.
3. `이미 구현` 화면은 재구현하지 않는다.
4. 다만 새 화면이 기존 화면으로 들어가거나 기존 화면이 새 화면으로 들어와야 하면 연동 범위에 포함한다.

## 현재 기준 추천 신규 구현 순서

현재 저장소 상태만 놓고 보면 신규/보완 구현 우선순위는 다음이 가장 합리적이다.

1. `운영센터`
2. `screen-elements-management`
3. `event-management-console`
4. `function-management-console`
5. `api-management-console`
6. `controller-management-console`
7. `db-table-management`
8. `column-management-console`
9. `automation-studio`
10. `member-withdrawn`
11. `member-activate`
12. `version-management`

이 순서의 이유:

- `운영센터`는 아예 빠져 있어서 신규 구현 가치가 가장 높다.
- 플랫폼 스튜디오에 흡수된 메뉴들은 route는 있으나 전용 화면이 없어 운영 단위가 불명확하다.
- 회원 파생 메뉴와 버전 관리류는 기존 공용 화면을 쓰고 있어 재구현보다 보완 구현 우선으로 본다.

## 기존 화면 연동 규칙

새 화면을 만들 때 아래 유형의 기존 화면은 반드시 연결 대상으로 본다.

- 허브 진입 대상 화면
- 상태 반영 결과를 확인할 화면
- 이력을 조회할 화면
- 권한이나 메타 연결을 검증할 화면

예시:

- `운영센터`를 만들 때
  - 재구현 제외: `security-monitoring`, `unified-log`, `scheduler-management`, `error-log`
  - 연동 포함: 카드 클릭, 위험건 링크, 최근 이력 링크, 결과 복귀 동선

- `event-management-console`를 만들 때
  - 재구현 제외: `platform-studio`, `observability`
  - 연동 포함: 이벤트 정의 상세 진입, 실행 결과/trace 링크
