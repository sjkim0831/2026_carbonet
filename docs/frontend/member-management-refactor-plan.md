# Member Management Refactor Plan

## Goal

회원관리 메뉴 프론트엔드와 관련 백엔드 payload 조립 코드를 배포 친화적으로 분해한다.

핵심 원칙:

- `import`만 따로 빼는 구조는 만들지 않는다.
- 공통 `export` 진입점과 공통 UI 블록을 만든다.
- 각 화면은 `page`, `sections`, `config`, `helpers`, `types`로 분해한다.
- 컨트롤러는 라우팅에 집중하고, 화면별 payload 조립은 별도 서비스로 이동한다.

## Why

현재 문제:

- 회원관리 화면 파일이 크고 JSX, 문구, 액션, API 의존성이 한 파일에 섞여 있다.
- 공통 버튼/페이지네이션은 일부 정리됐지만, 검색바/섹션/상태 배지/행 액션은 여전히 화면마다 반복된다.
- `AdminMainController`가 너무 많은 회원관리 page payload를 직접 조립한다.
- 배포 시 충돌 범위가 넓고, 작은 수정도 큰 파일 diff로 번진다.

목표 상태:

- 화면별 수정 범위가 작아진다.
- 공통 블록 수정이 여러 화면에 안정적으로 반영된다.
- 번들 크기와 import 가시성을 해치지 않는다.
- 백엔드 page payload도 화면 단위로 책임이 분리된다.

## Recommended Frontend Structure

회원관리 공통 경로:

- `frontend/src/features/member/common.tsx`
- `frontend/src/features/member/shared.ts`
- `frontend/src/features/member/labels.ts`
- `frontend/src/features/member/table.tsx`
- `frontend/src/features/member/toolbar.tsx`
- `frontend/src/features/member/sections.tsx`
- `frontend/src/features/member/status.tsx`
- `frontend/src/features/member/types.ts`
- `frontend/src/features/member/index.ts`

역할:

- `common.tsx`: 버튼, 액션바, 페이지네이션, 공통 액션 컨테이너
- `shared.ts`: 옵션 목록, 공통 포맷터, 공통 상수
- `labels.ts`: 회원관리 공통 라벨 사전
- `table.tsx`: 테이블 툴바, empty state, row action cell
- `toolbar.tsx`: 검색 영역, count header, top actions
- `sections.tsx`: 상세/수정 화면 섹션 프레임
- `status.tsx`: 상태 배지, 상태 라벨 매핑
- `types.ts`: 화면 간 재사용 타입
- `index.ts`: barrel export

## Recommended Page Decomposition

### 1. List Pages

대상:

- `frontend/src/features/member-list/MemberListMigrationPage.tsx`
- `frontend/src/features/company-list/CompanyListMigrationPage.tsx`
- `frontend/src/features/password-reset/PasswordResetMigrationPage.tsx`
- `frontend/src/features/member-approve/MemberApproveMigrationPage.tsx`
- `frontend/src/features/company-approve/CompanyApproveMigrationPage.tsx`
- `frontend/src/features/auth-change/AuthChangeMigrationPage.tsx`
- `frontend/src/features/dept-role-mapping/DeptRoleMappingMigrationPage.tsx`

권장 분해:

- `Page.tsx`: 최상위 데이터 연결과 라우트 진입점
- `searchForm.tsx`: 검색 폼
- `tableColumns.tsx`: 컬럼 정의
- `rowActions.tsx`: 행 버튼 정의
- `filters.ts`: 기본 필터와 query 변환
- `utils.ts`: badge, rowNumber, exportQuery 계산
- `types.ts`: row 타입

예시:

- `frontend/src/features/member-list/MemberListMigrationPage.tsx`
- `frontend/src/features/member-list/memberList.searchForm.tsx`
- `frontend/src/features/member-list/memberList.tableColumns.tsx`
- `frontend/src/features/member-list/memberList.rowActions.tsx`
- `frontend/src/features/member-list/memberList.filters.ts`
- `frontend/src/features/member-list/memberList.utils.ts`
- `frontend/src/features/member-list/memberList.types.ts`

### 2. Detail/Edit Pages

대상:

- `frontend/src/features/member-detail/MemberDetailMigrationPage.tsx`
- `frontend/src/features/member-edit/MemberEditMigrationPage.tsx`
- `frontend/src/features/company-detail/CompanyDetailMigrationPage.tsx`
- `frontend/src/features/company-account/CompanyAccountMigrationPage.tsx`
- `frontend/src/features/member-register/MemberRegisterMigrationPage.tsx`

권장 분해:

- `Page.tsx`: 데이터 로딩, 저장 처리, 권한 체크
- `summaryCard.tsx`: 상단 요약 카드
- `basicSection.tsx`: 기본 정보 영역
- `permissionSection.tsx`: 권한/역할 영역
- `companySection.tsx`: 회사 참조 영역
- `fileSection.tsx`: 첨부파일 영역
- `form.ts`: 폼 상태 변환
- `validators.ts`: 저장 검증
- `types.ts`: payload, form 타입

예시:

- `frontend/src/features/member-edit/MemberEditMigrationPage.tsx`
- `frontend/src/features/member-edit/memberEdit.summaryCard.tsx`
- `frontend/src/features/member-edit/memberEdit.basicSection.tsx`
- `frontend/src/features/member-edit/memberEdit.permissionSection.tsx`
- `frontend/src/features/member-edit/memberEdit.fileSection.tsx`
- `frontend/src/features/member-edit/memberEdit.companySection.tsx`
- `frontend/src/features/member-edit/memberEdit.form.ts`
- `frontend/src/features/member-edit/memberEdit.validators.ts`
- `frontend/src/features/member-edit/memberEdit.types.ts`

### 3. Approval Pages

대상:

- `frontend/src/features/member-approve/MemberApproveMigrationPage.tsx`
- `frontend/src/features/company-approve/CompanyApproveMigrationPage.tsx`

추가 분해:

- `reviewModal.tsx`
- `reviewSections.tsx`
- `batchActions.tsx`
- `approvalStatus.ts`

## Shared Label Strategy

공통 라벨은 `frontend/src/features/member/labels.ts`로 이동한다.

1차 공통화 대상:

- `목록`
- `상세`
- `수정`
- `검색`
- `초기화`
- `저장`
- `신규 등록`
- `엑셀 다운로드`
- `중복 확인`
- `주소 검색`
- `파일 추가`
- `미리보기`
- `다운로드`
- `상세 검토`
- `승인`
- `반려`
- `승인 완료`

화면별 고유 문구는 각 페이지에 남긴다.

예:

- `회원 가입 승인 관리`
- `회원사 신청 상세`
- `변경 일괄 저장`

## Shared UI Blocks To Extract Next

버튼 다음 우선순위:

1. `MemberSearchToolbar`
2. `MemberCountHeader`
3. `MemberListSection`
4. `MemberEmptyState`
5. `MemberStatusBadge`
6. `MemberReviewModalFrame`
7. `MemberFileChips`
8. `MemberSummaryCard`

## Backend Refactor Direction

현재 문제:

- `AdminMainController`가 회원관리 payload 조립까지 직접 담당
- `AdminHotPathPagePayloadService`가 controller helper에 강하게 의존

권장 구조:

- `AdminMainController`
  - route, request parsing, response wrapping만 담당
- `MemberPagePayloadService`
  - 회원 목록, 회원 상세, 회원 수정 payload
- `CompanyPagePayloadService`
  - 회원사 목록, 회원사 상세, 회원사 계정 payload
- `ApprovalPagePayloadService`
  - 회원 승인, 회원사 승인 payload
- `AuthorityPagePayloadService`
  - 권한 변경, 부서 권한 맵핑 payload

추가로 helper는 controller에서 분리:

- `MemberAdminAccessPolicy`
- `MemberDisplayMapper`
- `AuthorRoleProfileMapper`
- `MemberFileViewService`

## Recommended Work Order

### Phase 1. Frontend Safe Split

목표:

- import 정리
- 공통 라벨/상태/툴바 추출
- 화면 체감 변화 유지

작업:

1. `frontend/src/features/member/labels.ts` 생성
2. `frontend/src/features/member/status.tsx` 생성
3. `frontend/src/features/member/toolbar.tsx` 생성
4. list page 2개부터 적용
   - `member-list`
   - `company-list`
5. build 확인

### Phase 2. Detail/Edit Split

목표:

- 큰 파일을 섹션 단위로 분해

작업:

1. `member-detail`
2. `member-edit`
3. `company-detail`
4. `company-account`

### Phase 3. Approval Split

목표:

- review modal과 batch action 반복 제거

작업:

1. `member-approve`
2. `company-approve`

### Phase 4. Payload Service Split

목표:

- `AdminMainController` 비대화 완화
- controller/service 순환 의존 제거

작업:

1. `MemberPagePayloadService`
2. `CompanyPagePayloadService`
3. `ApprovalPagePayloadService`
4. `AuthorityPagePayloadService`
5. `AdminHotPathPagePayloadService` 최소화 또는 제거

## Deployment Impact

배포 관점에서 기대 효과:

- 파일 충돌 범위 축소
- 변경 diff 가독성 향상
- 특정 화면 수정 시 영향 범위 예측 가능
- 공통 UI 수정 반영 일관성 증가

주의점:

- barrel export 남용 금지
- 공통화 범위는 "의미가 같은 것"까지만
- helper 분리 시 순환 참조 검사 필요
- backend payload split 시 controller helper private 접근 정리 필요

## Immediate Practical Start

바로 시작하기 좋은 최소 범위:

1. `frontend/src/features/member/labels.ts`
2. `frontend/src/features/member/status.tsx`
3. `frontend/src/features/member/toolbar.tsx`
4. `member-list`, `company-list` 분해
5. 그 다음 `member-edit`, `company-account` 분해

이 순서면 사용자 화면 영향이 명확하고, 배포 리스크도 낮다.
