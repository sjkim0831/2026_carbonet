# Operations Center Implementation Design

기준일: 2026-03-30

대상 메뉴:

- 메뉴명: 운영센터
- 메뉴코드: `A0070102`
- URL: `/admin/monitoring/center`

## 1. 재정의

운영센터는 `시스템 운영 대시보드`가 아니다.

운영센터는:

- 전체 관리자 업무 운영 허브
- 대메뉴별 운영 상태 요약 허브
- 우선 대응 큐 허브
- 기존 상세 화면 진입 허브

즉, 운영센터는 `보안/로그/스케줄러`만 모아 놓은 화면으로 끝나면 안 된다.

## 2. 왜 재정의가 필요한가

현재 시스템에는:

- 시스템 운영 관련 화면이 상대적으로 먼저 많이 만들어졌고
- 다른 대메뉴의 상세 운영 화면은 아직 일부만 구현되었거나 확장 중이다

이 상태에서 운영센터를 시스템 관제 기준으로만 만들면:

- 실제 운영자가 처리해야 하는 승인/업무/연계/콘텐츠 이슈가 빠지고
- 운영센터가 `시스템관제센터`처럼 좁아진다

그래서 운영센터는 처음부터 아래 원칙으로 설계해야 한다.

1. 시스템 운영 정보는 한 축일 뿐이다.
2. 다른 대메뉴도 운영 상태 기준으로 같이 포함한다.
3. 아직 상세 화면이 없더라도 도메인 위젯 자리와 summary contract는 먼저 잡아둔다.

## 3. 포함해야 하는 운영 도메인

### 회원/회원사 운영

연결 후보:

- `member-approve`
- `company-approve`
- `member-list`
- `company-list`
- `member-activate`
- `member-withdrawn`

대표 운영 신호:

- 승인 대기
- 반려 재검토
- 휴면 계정 처리 필요
- 탈퇴/잠금 이상치

### 배출/업무 운영

연결 후보:

- `emission-result-list`
- `emission-site-management`
- 향후 검증/이력/정산 계열 화면

대표 운영 신호:

- 검증 대기
- 결과 오류
- 데이터 변경 급증
- 배출지 상태 이상

### 외부연계 운영

연결 후보:

- 향후 `usage`, `retry`, `maintenance`, `webhooks`, `sync` 계열 화면

대표 운영 신호:

- 실패 재처리 대기
- 연계 장애
- API 사용량 급증
- 점검 모드 영향

### 콘텐츠 운영

연결 후보:

- 향후 공지/팝업/배포/첨부 운영 화면

대표 운영 신호:

- 긴급 공지 필요
- 예약 실패
- 팝업 노출 이상
- 배포 대기

### 보안/시스템 운영

연결 후보:

- `security-monitoring`
- `security-policy`
- `unified-log`
- `observability`
- `scheduler-management`
- `error-log`
- `security-audit`

대표 운영 신호:

- 보안 이벤트
- 오류 로그
- 배치/스케줄 실패
- 최근 운영 조치

## 4. 화면 원칙

운영센터에서 하지 않을 것:

- 각 대메뉴의 본처리 UI를 다시 구현하지 않음
- 보안 조치, 승인 처리, 배치 재실행, 로그 상세 검색을 인라인으로 다시 넣지 않음
- 상세 분석/등록/승인/수정 UI를 운영센터에 중복 구현하지 않음

운영센터에서 반드시 할 것:

- 전체 운영 상태를 즉시 파악
- 대메뉴별 운영 신호를 요약
- 우선 대응 항목을 한 큐로 정렬
- 정확한 상세 화면 진입 링크 제공
- 최근 운영 조치와 운영 가이드를 같이 제공

## 5. 정보구조

운영센터 메인 화면은 아래 6개 영역으로 구성한다.

### OC-01. 전사 운영 상황판

목적:

- 전체 관리자 운영 상태를 3초 안에 파악

표시 항목:

- 전체 상태 배지 `정상 / 주의 / 위험`
- 미처리 승인 건수
- 실패/재처리 필요 업무 건수
- 보안/시스템 위험 건수
- 최근 조치 후 재발 건수

### OC-02. 우선 대응 큐

목적:

- 지금 당장 처리해야 하는 항목을 우선순위로 제시

표시 항목:

- 심각도
- 도메인
- 발생 시각
- 유형
- 요약 메시지
- 권장 진입 화면

도메인 예시:

- 회원
- 회원사
- 배출/업무
- 외부연계
- 콘텐츠
- 보안
- 시스템

### OC-03. 대메뉴별 운영 위젯

목적:

- 각 대메뉴의 운영 상태를 카드형 위젯으로 요약

필수 위젯:

- 회원/회원사 운영 위젯
- 배출/업무 운영 위젯
- 외부연계 운영 위젯
- 콘텐츠 운영 위젯
- 보안/시스템 운영 위젯

위젯 공통 규칙:

- 핵심 수치 2~4개
- 마지막 갱신 시각
- 상세 보기 링크
- 현재 문제 항목이 있으면 더 강하게 강조

### OC-04. 최근 조치 이력

목적:

- 최근 운영자가 무엇을 했는지 빠르게 파악

표시 항목:

- 시각
- 수행자
- 조치 유형
- 대상
- 결과
- 관련 화면 링크

### OC-05. 운영 체크포인트

목적:

- 즉시조치 전에 확인해야 할 운영 원칙 제공

예시:

- 승인 대기 건은 근거 확인 후 처리
- 대량 재처리는 관련 이력 확인 후 실행
- 외부 허용은 화이트리스트 승인 흐름을 거친 뒤 반영
- 반복 오류는 trace 기준으로 원인 확인

### OC-06. 운영 도메인 네비게이션

목적:

- 운영센터에서 각 대메뉴 운영 화면으로 빠르게 이동

구성:

- 회원/회원사
- 배출/업무
- 외부연계
- 콘텐츠
- 보안/시스템
- 거버넌스/도구

## 6. 위젯별 기본 데이터

### 회원/회원사 운영 위젯

- 회원 승인 대기
- 회원사 승인 대기
- 휴면 계정 처리 필요
- 최근 반려 재신청 건수

연결 화면:

- `member-approve`
- `company-approve`
- `member-list`
- `company-list`
- `member-activate`

### 배출/업무 운영 위젯

- 결과 오류 건수
- 검증 대기 건수
- 최근 데이터 변경 급증
- 배출지 상태 이상

연결 화면:

- `emission-result-list`
- `emission-site-management`

### 외부연계 운영 위젯

- 실패 재처리 대기
- 연계 오류 건수
- API 사용량 경고
- 점검 모드 영향 건수

연결 화면:

- 향후 `retry`, `usage`, `maintenance`, `sync` 계열 화면

### 콘텐츠 운영 위젯

- 긴급 공지 필요
- 예약 실패 건수
- 팝업 노출 이상
- 배포 대기 건수

연결 화면:

- 향후 공지/팝업/배포 운영 화면

### 보안/시스템 운영 위젯

- 활성 보안 이벤트
- 최근 에러 로그
- 스케줄러 경고
- 최근 운영 조치

연결 화면:

- `security-monitoring`
- `error-log`
- `scheduler-management`
- `security-audit`

## 7. 화면 간 연결 규칙

### 회원/회원사 연결

- source: 회원/회원사 위젯, 우선 대응 큐
- target: `member-approve`, `company-approve`, `member-list`, `company-list`, `member-activate`
- query: 상태, 승인대기, 검색어

### 배출/업무 연결

- source: 배출/업무 위젯, 우선 대응 큐
- target: `emission-result-list`, `emission-site-management`
- query: 결과 상태, 검증 상태, 검색어

### 외부연계 연결

- source: 외부연계 위젯
- target: 관련 연계/재처리/사용량 화면
- query: 실패 상태, 연계 ID, 검색어

### 콘텐츠 연결

- source: 콘텐츠 위젯
- target: 공지/팝업/배포 운영 화면
- query: 상태, 예약 실패, 검색어

### 보안/시스템 연결

- source: 보안/시스템 위젯, 우선 대응 큐
- target: `security-monitoring`, `unified-log`, `observability`, `scheduler-management`, `error-log`, `security-audit`
- query: `fingerprint`, `traceId`, `jobStatus`, `searchKeyword`

## 8. 데이터 계약

운영센터 payload는 아래처럼 `도메인별 위젯 + 우선 대응 큐` 중심으로 잡는다.

```ts
type OperationsCenterPagePayload = {
  overallStatus: "HEALTHY" | "WARNING" | "CRITICAL";
  refreshedAt: string;
  summaryCards: Array<{
    key: string;
    title: string;
    value: string;
    tone: "neutral" | "warning" | "danger" | "healthy";
    targetRoute?: string;
  }>;
  priorityItems: Array<{
    itemId: string;
    domainType: "MEMBER" | "EMISSION" | "INTEGRATION" | "CONTENT" | "SECURITY" | "SYSTEM";
    sourceType: "APPROVAL" | "RESULT" | "ERROR" | "SCHEDULER" | "AUDIT" | "SECURITY";
    severity: string;
    title: string;
    description: string;
    occurredAt: string;
    targetRoute: string;
  }>;
  widgetGroups: Array<{
    widgetId: string;
    domainType: string;
    title: string;
    description?: string;
    metricRows: Array<{ label: string; value: string; }>;
    targetRoute?: string;
  }>;
  recentActions: Array<{
    actionId: string;
    actedAt: string;
    actorId: string;
    actionType: string;
    targetLabel: string;
    resultStatus: string;
    targetRoute?: string;
  }>;
  playbooks: Array<{
    title: string;
    body: string;
    tone: "info" | "warning" | "success";
  }>;
};
```

원칙:

- 상세 원본 데이터 전체를 들고 오지 않는다
- 대메뉴 운영 상태를 요약한 최소 계약만 사용한다
- 상세 처리는 기존 화면으로 넘긴다

## 9. 백엔드 조합 원칙

운영센터는 새 독립 도메인이 아니라 기존 화면 payload의 summary를 재조합하는 서비스여야 한다.

우선 재사용 대상:

- 회원/회원사 승인/목록 payload
- 배출 결과/배출지 payload
- 보안 모니터링 payload
- 에러 로그 payload
- 스케줄러 payload
- 보안 감사 payload

향후 확장 대상:

- 외부연계 운영 payload
- 콘텐츠 운영 payload

원칙:

- 운영센터가 상세 조회 로직을 중복 구현하지 않는다
- 가능하면 기존 page assembler의 summary 계약을 재사용한다
- 아직 화면이 없더라도 도메인 summary contract는 먼저 준비할 수 있다

## 10. 프론트 원칙

- 카드와 링크 중심
- 인라인 편집/승인/실행 기능 최소화
- 위젯은 대메뉴별로 구분되지만 한 화면에서 시각적으로 통합감 유지
- 이상이 있는 도메인은 위젯 배치와 색상에서 더 먼저 보이게 처리

## 11. 단계별 구현 순서

### Step 1. 운영센터 shell + 기본 route

- `/admin/monitoring/center`
- 운영센터 route id 연결

### Step 2. 전사 운영 상황판

- 승인/업무/보안/시스템 요약 카드

### Step 3. 우선 대응 큐

- 도메인 혼합 큐
- 상세 화면 링크

### Step 4. 대메뉴별 위젯

- 회원/회원사
- 배출/업무
- 보안/시스템

1차 구현에서는 최소 3개 도메인부터 시작

### Step 5. 최근 조치 + 운영 체크포인트

- 최근 조치 이력
- 운영 가이드

### Step 6. 외부연계/콘텐츠 확장

- 관련 화면이 준비되면 위젯 연결 추가

## 12. 완료 기준

운영센터를 완료로 보려면 아래가 모두 필요하다.

- `/admin/monitoring/center` 진입 가능
- 전체 운영 상태를 즉시 파악 가능
- 회원/업무/보안 중 최소 3개 도메인 위젯 제공
- 우선 대응 큐에서 상세 화면으로 정확히 이동 가능
- 최근 조치 이력 확인 가능
- 기존 상세 운영 화면을 중복 구현하지 않음

## 13. 현재 구현물에 대한 평가

현재 1차 구현은:

- 보안/오류/스케줄/감사 허브로는 유효
- 하지만 운영센터의 최종 형태로는 범위가 좁다

따라서 현재 구현은:

- `운영센터 v1`
- 실제 지향점은 `운영센터 v2 = 전체 관리자 업무 운영 허브`

## 14. 다음 확장 우선순위

1. 회원/회원사 운영 위젯 연결
2. 배출/업무 운영 위젯 연결
3. 외부연계 운영 위젯 연결
4. 콘텐츠 운영 위젯 연결
5. 개인화/자동 새로고침/브리핑 모드

## 15. 운영센터 v2 확장 작업 목록

아래 작업 목록은 `운영센터 v1`을 `전체 관리자 업무 운영 허브`로 확장하기 위한 실제 구현 단위다.

작업 원칙:

- 새 위젯을 만들더라도 본처리 UI는 기존 상세 화면으로 넘긴다
- 아직 미구현 화면이 있으면 위젯은 summary + placeholder link 수준으로 먼저 넣을 수 있다
- 도메인 위젯은 `숫자 -> 이상 항목 -> 상세 화면 이동` 루프를 가져야 한다

### OCV2-01. 회원/회원사 운영 위젯

목표:

- 회원/회원사 운영 상태를 운영센터에서 직접 요약

연결 대상:

- `member-approve`
- `company-approve`
- `member-list`
- `company-list`
- `member-activate`
- `member-withdrawn`

표시 항목:

- 회원 승인 대기
- 회원사 승인 대기
- 휴면 계정 처리 필요
- 탈퇴/잠금 이상치

필요한 payload:

- 승인 대기 건수
- 상태별 건수
- 최근 이상 항목 3~5건
- 상세 화면 targetRoute

완료 기준:

- 운영센터에서 승인/계정 상태 이상을 보고 관련 화면으로 바로 이동 가능

선행:

- 기존 회원/회원사 화면 유지

후속:

- `OCV2-06`

### OCV2-02. 배출/업무 운영 위젯

목표:

- 배출 결과와 업무 상태를 운영센터에 포함

연결 대상:

- `emission-result-list`
- `emission-site-management`
- 향후 `validate`, `data_history`, `result_detail` 계열

표시 항목:

- 결과 오류 건수
- 검증 대기 건수
- 최근 데이터 변경 급증
- 배출지 상태 이상

필요한 payload:

- 결과 상태별 건수
- 검증 대기 건수
- 최근 이상 항목 3~5건
- 상세 화면 targetRoute

완료 기준:

- 운영센터에서 업무 상태 이상을 보고 배출/검증 관련 상세 화면으로 이동 가능

선행:

- `emission-result-list`

후속:

- `OCV2-06`

### OCV2-03. 외부연계 운영 위젯

목표:

- 외부연계 장애/재처리 상태를 운영센터에 포함

연결 대상:

- 향후 `usage`, `retry`, `maintenance`, `sync`, `webhooks` 계열 화면

표시 항목:

- 실패 재처리 대기
- 연계 오류 건수
- API 사용량 경고
- 점검 모드 영향 건수

필요한 payload:

- 연계 실패 건수
- 재처리 대기 건수
- 사용량 경고 건수
- targetRoute 또는 placeholder target

완료 기준:

- 외부연계 운영 화면이 완성되기 전에도 운영센터에서 상태 이상과 연결 방향을 보여줄 수 있음

선행:

- 관련 메뉴 구현 계획 정리

후속:

- `OCV2-06`

### OCV2-04. 콘텐츠 운영 위젯

목표:

- 공지/팝업/배포 운영 상태를 운영센터에 포함

연결 대상:

- 향후 공지/팝업/배포 운영 화면

표시 항목:

- 긴급 공지 필요
- 예약 실패
- 팝업 노출 이상
- 배포 대기

필요한 payload:

- 상태별 건수
- 최근 이상 항목
- targetRoute 또는 placeholder target

완료 기준:

- 콘텐츠 운영 화면이 완성되기 전에도 운영센터에서 상태 이상과 연결 방향을 보여줄 수 있음

선행:

- 관련 메뉴 구현 계획 정리

후속:

- `OCV2-06`

### OCV2-05. 우선 대응 큐 v2

목표:

- 보안/시스템 중심 큐를 전체 도메인 혼합 큐로 확장

포함 도메인:

- 회원/회원사
- 배출/업무
- 외부연계
- 콘텐츠
- 보안/시스템

표시 항목:

- 심각도
- 도메인
- 발생 시각
- 요약
- 권장 진입 화면

완료 기준:

- 운영자가 운영센터에서 먼저 봐야 할 항목을 도메인 구분 없이 우선순위로 확인 가능

선행:

- `OCV2-01`
- `OCV2-02`
- `OCV2-03`
- `OCV2-04`

후속:

- `OCV2-06`

### OCV2-06. 운영센터 도메인 네비게이션/레이아웃 재구성

목표:

- 운영센터를 시스템 허브가 아니라 전체 운영 허브처럼 보이도록 레이아웃 재구성

구현 항목:

- 도메인별 위젯 배치
- 이상 도메인 강조
- 도메인 네비게이션 추가
- 위젯과 우선 대응 큐의 시각적 우선순위 재조정

완료 기준:

- 첫 화면에서 `회원/업무/연계/콘텐츠/보안`이 모두 운영 도메인으로 인식됨
- 시스템 운영 화면처럼 보이지 않음

선행:

- `OCV2-01`
- `OCV2-02`
- `OCV2-05`

### OCV2-07. 운영센터 공통 summary contract 정리

목표:

- 도메인별 상세 화면이 늘어나도 운영센터가 같은 방식으로 붙을 수 있도록 공통 계약 정의

공통 계약 항목:

- summaryCards
- priorityItems
- widget metricRows
- recent abnormal items
- targetRoute

완료 기준:

- 새 대메뉴 운영 화면을 만들 때 운영센터 연결 규칙이 반복 가능

선행:

- 없음

병행 가능:

- `OCV2-01`
- `OCV2-02`
- `OCV2-03`
- `OCV2-04`

## 16. 추천 실행 순서

실제 구현은 아래 순서가 가장 안전하다.

1. `OCV2-07` 공통 summary contract 정리
2. `OCV2-01` 회원/회원사 운영 위젯
3. `OCV2-02` 배출/업무 운영 위젯
4. `OCV2-05` 우선 대응 큐 v2
5. `OCV2-06` 레이아웃 재구성
6. `OCV2-03` 외부연계 운영 위젯
7. `OCV2-04` 콘텐츠 운영 위젯

이 순서의 이유:

- 먼저 이미 있는 화면과 붙이기 쉬운 도메인부터 운영센터에 연결하고
- 그 다음 전체 큐와 레이아웃을 재구성하고
- 아직 상세 화면이 덜 갖춰진 외부연계/콘텐츠는 뒤에서 확장하는 편이 안정적이다

## 17. 바로 구현 가능한 1차 범위

당장 코드 작업으로 들어가기에 가장 적절한 범위:

- `OCV2-07`
- `OCV2-01`
- `OCV2-02`
- `OCV2-05`

이 4개를 먼저 하면:

- 운영센터가 시스템 허브에서 벗어나고
- 실제 업무 운영 화면과 붙기 시작하며
- 이후 외부연계/콘텐츠 확장이 쉬워진다
