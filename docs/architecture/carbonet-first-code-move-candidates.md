# Carbonet First Code Move Candidates

Generated on 2026-04-14 for first executable module split sequencing.

## Goal

Define the first code-move batches for Carbonet so the team can start real extraction work without reopening the same boundary debate every turn.

This document answers:

- what to move first
- what to leave in place for now
- what to wrap before moving
- which target module each batch should move toward

## Move Ordering Rule

Move in this order:

1. stable common contracts and runtime shells
2. explicit project adapters
3. heavy project business services
4. operator-only control-plane families later

Do not start by moving the most tangled operator console classes first.

## Target Modules

First module targets:

- `modules/common-auth`
- `modules/common-admin-runtime`
- `modules/common-content-runtime`
- `modules/common-payment`
- `projects/carbonet-adapter`
- `projects/carbonet-runtime`

Keep:

- `apps/carbonet-app`
  - as the runtime assembly during the first phase

## Batch 1: Common Auth Runtime

Target:

- `modules/common-auth`

Move first:

- `src/main/java/egovframework/com/feature/auth/web/AuthApiController.java`
- `src/main/java/egovframework/com/feature/auth/web/AuthPageController.java`
- `src/main/java/egovframework/com/feature/auth/web/FrontendSessionApiController.java`
- `src/main/java/egovframework/com/feature/auth/service/AuthService.java`
- `src/main/java/egovframework/com/feature/auth/service/FrontendSessionService.java`
- `src/main/java/egovframework/com/feature/auth/service/CurrentUserContextService.java`
- `src/main/java/egovframework/com/feature/auth/service/impl/AuthServiceImpl.java`
- `src/main/java/egovframework/com/common/filter/AuthorizeFilter.java`
- `src/main/java/egovframework/com/common/filter/AdminApiAuthenticationFilter.java`
- `src/main/java/egovframework/com/common/interceptor/AdminMainAuthInterceptor.java`

Leave behind for now:

- project-specific external-auth provider implementations

Wrap first if needed:

- request-scoped project policy lookups
- project-specific authority narrowing

## Batch 2: Common Admin Registry Runtime

Target:

- `modules/common-admin-runtime`

Move first:

- `src/main/java/egovframework/com/feature/admin/service/MenuInfoService.java`
- `src/main/java/egovframework/com/feature/admin/service/MenuFeatureManageService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminMenuTreeService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminCodeManageService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMenuController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMenuShellService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminPageManagementCommandService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminPageManagementPageService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMenuManagementCommandService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMenuManagementPageService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminFeatureManagementCommandService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminFeatureManagementPageService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminCodeManagementCommandService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminCodeManagementPageService.java`
- `src/main/java/egovframework/com/feature/admin/mapper/MenuInfoMapper.java`
- `src/main/java/egovframework/com/feature/admin/mapper/MenuFeatureManageMapper.java`
- `src/main/java/egovframework/com/feature/admin/mapper/AuthGroupManageMapper.java`
- `src/main/java/egovframework/com/feature/admin/mapper/AdminCodeManageMapper.java`

Reason:

- these are the best early common-jar candidates
- they define shared menu, page, feature, and authority registry behavior

## Batch 3: Common Content Runtime

Target:

- `modules/common-content-runtime`

Move first:

- `src/main/java/egovframework/com/feature/admin/service/AdminFaqManagementService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminBannerManagementService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminPopupManagementService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminFileManagementService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminTagManagementService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminFaqManagementController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminBannerController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminPopupController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminFileManagementController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminTagManagementController.java`

Leave behind for now:

- project-specific publication workflow decisions
- project-local content moderation and exposure rules

## Batch 4: Common Payment Runtime Skeleton

Target:

- `modules/common-payment`

Move first:

- payment gateway contracts
- reusable payment bootstrap/read services
- payment DTO contracts
- provider-neutral settlement helpers

Current first candidates:

- `src/main/java/egovframework/com/platform/trade/service/TradeRefundListReadPort.java`
- `src/main/java/egovframework/com/platform/trade/service/impl/PlatformPaymentBootstrapReadService.java`
- `src/main/java/egovframework/com/platform/trade/service/impl/PlatformTradeRefundListReadService.java`

Leave behind for now:

- project order state rules
- refund status transitions
- certificate/trade business coupling

## Batch 5: Carbonet Adapter Extraction

Target:

- `projects/carbonet-adapter`

Move first:

- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetScreenBuilderCommandPageSourceBridge.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetScreenBuilderMenuSourceBridge.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetScreenBuilderAuthoritySourceBridge.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetAdminMenuTreeReadAdapter.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetMenuInfoReadAdapter.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetMenuInfoCommandAdapter.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetAdminSummaryReadAdapter.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/CarbonetFullStackGovernanceRegistryReadAdapter.java`
- `src/main/java/egovframework/com/feature/auth/external/service/ExternalAuthAdapter.java`
- `src/main/java/egovframework/com/feature/auth/external/service/ExternalAuthProvider.java`
- `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaExternalAuthProvider.java`
- `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaSdkV1Adapter.java`

Reason:

- these are already adapter-shaped or bridge-shaped
- making them explicit reduces hidden project coupling quickly

## Batch 6: Carbonet Runtime Business Extraction

Target:

- `projects/carbonet-runtime`

Move first:

- `src/main/java/egovframework/com/feature/member/web/MemberJoinController.java`
- `src/main/java/egovframework/com/feature/member/service/EnterpriseMemberService.java`
- `src/main/java/egovframework/com/feature/member/service/GeneralMemberService.java`
- `src/main/java/egovframework/com/feature/member/service/DepartmentService.java`
- `src/main/java/egovframework/com/feature/member/service/impl/EnterpriseMemberServiceImpl.java`
- `src/main/java/egovframework/com/feature/member/service/impl/GeneralMemberServiceImpl.java`
- `src/main/java/egovframework/com/feature/member/service/impl/DepartmentServiceImpl.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMemberController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminTradeController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminPaymentController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminEmissionManagementApiController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminEmissionResultController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminEmissionDefinitionStudioApiController.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminEmissionManagementService.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/AdminEmissionManagementServiceImpl.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationExecution.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionInputSaveExecution.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionInputSessionExecution.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationApplicationService.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionManagementQueryService.java`
- `src/main/java/egovframework/com/feature/admin/mapper/AdminEmissionManagementMapper.java`
- `src/main/java/egovframework/com/feature/admin/mapper/AdminEmissionSurveyDraftMapper.java`
- `src/main/java/egovframework/com/feature/member/mapper/*`

Reason:

- these classes represent project-owned business behavior and project DB semantics

## Batch 7: Leave For Later

Keep in place temporarily:

- `src/main/java/egovframework/com/platform/codex/**`
- `src/main/java/egovframework/com/platform/runtimecontrol/**`
- operator-heavy `src/main/java/egovframework/com/platform/observability/**`
- self-healing and backup operations families

Later target:

- `CONTROL_PLANE`

Reason:

- they are central-operations-heavy
- they do not need to block the first reusable runtime split

## Rules During Moves

### Rule 1

Do not move mapper XML and Java independently without recording the paired move candidate in the same batch.

### Rule 2

If a controller depends on project tables through service chains, move or wrap the service chain first.

### Rule 3

If a common candidate still imports Carbonet-specific bridge code, stop and insert a port or adapter boundary first.

### Rule 4

Do not start with package renaming everywhere.

First create explicit module targets and ownership notes.

## Recommended Next Execution Steps

1. create empty module directories and poms for the first four targets
2. move Batch 1 and Batch 2 first
3. make Carbonet adapter explicit as its own target
4. move Batch 6 only after adapter boundaries are usable

## Practical Conclusion

The safest first executable split is:

- `common-auth`
- `common-admin-runtime`
- `common-content-runtime`
- `carbonet-adapter`

before:

- emission/trade/payment/member business extraction
- control-plane separation

