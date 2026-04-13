# Carbonet Backend And DB Split Starter Matrix

Generated on 2026-04-14 for first executable backend split planning.

## Goal

Turn the current Carbonet backend into a practical first-pass split map for:

- `COMMON_RUNTIME`
- `PROJECT_RUNTIME`
- `PROJECT_ADAPTER`
- `CONTROL_PLANE_LATER`

This document is intentionally a starter matrix, not a final package-move completion report.

## Backend Package Classification

### `src/main/java/egovframework/com/common`

Recommended lane:

- `COMMON_RUNTIME`

Reason:

- shared backend infrastructure
- security and interceptor behavior
- common helpers and shared support code

Rule:

- keep project business semantics out of this lane

### `src/main/java/egovframework/com/config`

Recommended lane:

- `COMMON_RUNTIME`

Reason:

- runtime wiring and configuration framework are reusable

Rule:

- move project-specific datasource and integration choices into project config overlays or adapter config

### `src/main/java/egovframework/com/feature/auth`

Recommended split:

- reusable auth/session/token framework -> `COMMON_RUNTIME`
- project-specific auth-provider binding and local policy narrowing -> `PROJECT_ADAPTER`
- project-local account or org policy exceptions -> `PROJECT_RUNTIME`

Current first-pass examples:

- `feature/auth/web/AuthApiController` -> `COMMON_RUNTIME`
- `feature/auth/web/AuthPageController` -> `COMMON_RUNTIME`
- `feature/auth/web/FrontendSessionApiController` -> `COMMON_RUNTIME`
- `feature/auth/service/AuthService` -> `COMMON_RUNTIME`
- `feature/auth/service/FrontendSessionService` -> `COMMON_RUNTIME`
- `feature/auth/external/service/ExternalAuthProvider` -> `PROJECT_ADAPTER`
- `feature/auth/external/service/ExternalAuthAdapter` -> `PROJECT_ADAPTER`
- `feature/auth/external/service/impl/KisaExternalAuthProvider` -> `PROJECT_ADAPTER`
- `feature/auth/external/service/impl/KisaSdkV1Adapter` -> `PROJECT_ADAPTER`

### `src/main/java/egovframework/com/feature/home`

Recommended split:

- reusable public/member shell and bootstrap framework -> `COMMON_RUNTIME`
- project-facing home/mypage business logic and content -> `PROJECT_RUNTIME`
- route/menu/theme/authority selection -> `PROJECT_ADAPTER`

Current first-pass examples:

- `feature/home/web/ReactAppBootstrapService` -> `COMMON_RUNTIME`
- `feature/home/web/ReactAppViewSupport` -> `COMMON_RUNTIME`
- `feature/home/web/ReactRouteSupport` -> `COMMON_RUNTIME`
- `feature/home/service/HomeMenuService` -> `PROJECT_RUNTIME`
- `feature/home/service/HomeMypageService` -> `PROJECT_RUNTIME`

### `src/main/java/egovframework/com/feature/member`

Recommended split:

- reusable member-management framework patterns -> `COMMON_RUNTIME`
- enterprise member, department, company, join, and project-local member workflows -> `PROJECT_RUNTIME`
- project organization mapping and scope narrowing -> `PROJECT_ADAPTER`

Current first-pass examples:

- `feature/member/web/MemberJoinController` -> `PROJECT_RUNTIME`
- `feature/member/service/EnterpriseMemberService` -> `PROJECT_RUNTIME`
- `feature/member/service/impl/EnterpriseMemberServiceImpl` -> `PROJECT_RUNTIME`
- `feature/member/service/impl/GeneralMemberServiceImpl` -> `PROJECT_RUNTIME`
- `feature/member/service/impl/DepartmentServiceImpl` -> `PROJECT_RUNTIME`
- `feature/member/mapper/*` -> `PROJECT_RUNTIME`

### `src/main/java/egovframework/com/feature/admin`

Recommended split by family:

#### `COMMON_RUNTIME`

- menu registry framework
- page registry framework
- feature registry framework
- reusable admin shell payloads
- reusable content-management runtime framework
- reusable builder runtime support
- reusable payment/admin runtime framework

First-pass examples:

- `feature/admin/service/MenuInfoService`
- `feature/admin/service/MenuFeatureManageService`
- `feature/admin/service/AdminMenuTreeService`
- `feature/admin/service/AdminCodeManageService`
- `feature/admin/web/AdminMenuController`
- `feature/admin/web/AdminMenuShellService`
- `feature/admin/web/AdminPageManagementCommandService`
- `feature/admin/web/AdminMenuManagementCommandService`
- `feature/admin/web/AdminFeatureManagementPageService`
- `feature/admin/web/AdminCodeManagementPageService`
- `feature/admin/service/AdminFaqManagementService`
- `feature/admin/service/AdminBannerManagementService`
- `feature/admin/service/AdminPopupManagementService`
- `feature/admin/service/AdminFileManagementService`
- `feature/admin/service/AdminTagManagementService`

#### `PROJECT_RUNTIME`

- emission business logic
- trade/payment/certificate business logic
- project member/company approval behavior
- project content publication behavior
- project-local dashboards and operational business screens

First-pass examples:

- `feature/admin/service/AdminEmissionManagementService`
- `feature/admin/service/impl/AdminEmissionManagementServiceImpl`
- `feature/admin/service/impl/EmissionCalculationExecution`
- `feature/admin/service/impl/EmissionInputSaveExecution`
- `feature/admin/service/impl/EmissionInputSessionExecution`
- `feature/admin/service/impl/EmissionScopeStatusService`
- `feature/admin/web/AdminEmissionManagementApiController`
- `feature/admin/web/AdminEmissionResultController`
- `feature/admin/web/AdminTradeController`
- `feature/admin/web/AdminPaymentController`
- `feature/admin/web/AdminApprovalController`
- `feature/admin/web/AdminMemberController`
- `feature/admin/web/AdminCompanyAccountCommandService`
- `feature/admin/web/AdminCertificateApprovalService`

#### `PROJECT_ADAPTER`

- Carbonet-specific bridges that connect platform-level builder or common contracts to current project semantics

First-pass examples:

- `feature/admin/service/impl/CarbonetScreenBuilderCommandPageSourceBridge`
- `feature/admin/service/impl/CarbonetScreenBuilderMenuSourceBridge`
- `feature/admin/service/impl/CarbonetAdminMenuTreeReadAdapter`
- `feature/admin/service/impl/CarbonetMenuInfoReadAdapter`

#### `CONTROL_PLANE_LATER`

- self-healing
- codex-runner-backed operator flows
- central operator governance and observability consoles
- platform-wide backup/scheduler/infra governance

First-pass examples:

- `feature/admin/service/SrSelfHealingService`
- `feature/admin/service/SrTicketCodexRunnerService`
- `feature/admin/service/BackupConfigManagementService`
- `feature/admin/web/SelfHealingController`
- `feature/admin/web/AdminSystemBuilderController`
- `feature/admin/web/AdminSystemBuilderAccessService`

### `src/main/java/egovframework/com/platform`

Recommended split:

- reusable platform contracts and stable ports -> `COMMON_RUNTIME`
- project-facing bridge implementations -> `PROJECT_ADAPTER`
- operator-only codex/observability/runtime-control consoles -> `CONTROL_PLANE_LATER`

Current first-pass examples:

#### `COMMON_RUNTIME`

- `platform/trade/service/TradeRefundListReadPort`
- stable contract and read-port families that are reusable across projects

#### `PROJECT_ADAPTER`

- `platform/observability/service/*PortBridge`
- `platform/trade/service/impl/PlatformTradeBootstrapReadService`
- `platform/trade/service/impl/PlatformPaymentBootstrapReadService`

#### `CONTROL_PLANE_LATER`

- `platform/runtimecontrol/*`
- `platform/codex/*`
- operator-facing `platform/observability/*` services that mainly govern central operations

## Mapper Classification

### `COMMON_RUNTIME_FIRST`

- `feature/admin/mapper/MenuInfoMapper`
- `feature/admin/mapper/MenuFeatureManageMapper`
- `feature/admin/mapper/AuthGroupManageMapper`
- common code and registry mappers
- artifact/version governance mappers

### `PROJECT_RUNTIME_FIRST`

- `feature/admin/mapper/AdminEmissionManagementMapper`
- `feature/admin/mapper/AdminEmissionSurveyDraftMapper`
- payment/trade/emission/content business mappers
- `feature/member/mapper/*`

### `PROJECT_ADAPTER_FIRST`

- adapter-specific mapping layers that translate common DTOs into project queries
- bridge-oriented projection mappers where the contract is common but the actual source is project-local

## DB Table Family Starter Matrix

This is a family-level starter classification, not an exhaustive final table inventory.

### `COMMON_DB`

Keep these table families here first:

- `COMTNMENUINFO`
- `COMTNMENUORDER`
- `COMTNMENUFUNCTIONINFO`
- `COMTCCMMNDETAILCODE`
- `COMTNAUTHORINFO`
- `COMTNAUTHORFUNCTIONRELATE`
- authority, role, permission, menu, page, and feature registry tables
- artifact and release governance tables from `project_version_governance_schema.sql`
  - `ARTIFACT_VERSION_REGISTRY`
  - `PROJECT_ARTIFACT_INSTALL`
  - `ARTIFACT_LOCK`
- observability/control-plane metadata such as `TRACE_SESSION`

Reason:

- these define shared governance truth or cross-project install/version truth

### `PROJECT_DB`

Keep these table families here first:

- emission input, result, calculation, and approval tables
- trade/order/settlement/refund tables
- certificate business and issuance tables
- project member/company runtime data
- board/post/banner/popup/file content records
- project-local reports, dashboards, and business snapshots
- project-local scheduler state when it exists for runtime behavior instead of control-plane governance

Reason:

- these rows express project runtime business state

### `BINDING_LAYER`

Keep these table families here first:

- project-to-common-artifact selection rows
- project-to-menu exposure rows
- project route activation rows
- project theme attachment rows
- project adapter activation rows
- project-local authority override rows
- project external endpoint or provider selection rows

Reason:

- these rows translate shared platform definition into project-local activation

## What To Move First In Code

These are the first backend move candidates before aggressive common-jar expansion:

1. `feature/admin/service/impl/*Emission*`
2. `feature/admin/web/AdminTradeController`
3. `feature/admin/web/AdminPaymentController`
4. `feature/member/service/impl/*`
5. project-local content mutation services
6. Carbonet-specific builder/menu bridges into explicit project-adapter modules

## What To Freeze As Stable Common Contracts

Freeze these first:

1. auth/session DTOs and API contracts
2. menu/page/feature descriptor contracts
3. route family and manifest contracts
4. common payment and notification service contracts
5. project adapter port signatures

## First Module Target

Recommended first module extraction targets:

```text
/modules/common-auth
/modules/common-admin-runtime
/modules/common-content-runtime
/modules/common-payment
/projects/carbonet-runtime
/projects/carbonet-adapter
```

## Practical Conclusion

For Carbonet right now:

- auth, menu, page, feature, shared admin shell, and registry behavior are the best early `COMMON_RUNTIME` candidates
- emission, trade, payment, certificate, member, and project content business behavior are the best early `PROJECT_RUNTIME` candidates
- Carbonet bridge classes and project-specific provider bindings should become explicit `PROJECT_ADAPTER` code
- codex, runtime control, self-healing, and central observability governance are the best `CONTROL_PLANE_LATER` candidates

Use `docs/architecture/carbonet-first-code-move-candidates.md` when the next question is no longer "how should we classify this" but "which files should move first and in what batch order".

*** Update File: /opt/projects/carbonet/docs/architecture/carbonet-runtime-split-classification-matrix.md
@@
 ## Practical Conclusion
 
 For Carbonet right now:
@@
 - split `ADMIN_MEMBER`, `EMISSION_MONITORING`, `TRADE_PAYMENT`, and most business-facing content into project runtime plus adapter lanes
 - keep reusable route families, manifests, auth, runtime shells, and builder runtime support in common runtime
 - lock DB ownership before adding many more common modules
+
+Use `docs/architecture/carbonet-backend-and-db-split-starter-matrix.md` as the next-level starter map when code movement must go below route-family classification into package, service, mapper, and table-family decisions.
*** Update File: /opt/projects/carbonet/.codex/skills/carbonet-common-project-boundary-switcher/SKILL.md
@@
 - Read [`/opt/projects/carbonet/docs/architecture/carbonet-runtime-split-classification-matrix.md`](/opt/projects/carbonet/docs/architecture/carbonet-runtime-split-classification-matrix.md) when the user wants the current Carbonet menus, route families, or DB lanes classified into `COMMON_RUNTIME`, `PROJECT_RUNTIME`, `PROJECT_ADAPTER`, and `CONTROL_PLANE_LATER`.
+- Read [`/opt/projects/carbonet/docs/architecture/carbonet-backend-and-db-split-starter-matrix.md`](/opt/projects/carbonet/docs/architecture/carbonet-backend-and-db-split-starter-matrix.md) when the task needs a first-pass backend package, service, mapper, or DB table-family split plan before actual code moves.
 - Read [`/opt/projects/carbonet/docs/architecture/screenbuilder-core-jar-adapter-plan.md`](/opt/projects/carbonet/docs/architecture/screenbuilder-core-jar-adapter-plan.md) when the task affects builder-core extraction, shared jar packaging, or project adapter lines.
