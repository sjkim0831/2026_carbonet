# Admin System Screen Completion Audit

Generated on 2026-04-14 from the current React admin system route family and nearby backend/menu bootstrap anchors.

## Scope

This audit covers the administrator system/operations surfaces registered in:

- `frontend/src/app/routes/families/adminSystemFamily.ts`
- related menu bootstrap support under `src/main/java/egovframework/com/platform/codex/service/*MenuBootstrapSupport.java`
- related page-contract metadata in `ScreenCommandCenterServiceImpl`

It intentionally focuses on system administrator and operations screens, including `/admin/system`, `/admin/external`, and `/admin/monitoring` entries that are grouped in the same route family.

Follow-up closure planning lives in:

- `docs/architecture/admin-system-screen-closure-backlog.md`
- `docs/ai/20-ui/admin-system-screen-completion-map.csv`

## Completion Status Model

| Status | Meaning | Follow-up rule |
| --- | --- | --- |
| `COMPLETE` | The route has a real React page plus page-data, form, action, or operational backend contract sufficient for current production use. | Keep normal regression and runtime freshness checks. |
| `PARTIAL` | The route renders and may have page-data, but one or more core operator functions are still read-only, static, sample-backed, or missing action/audit/storage closure. | Treat as unfinished before claiming the screen is operationally complete. |
| `SCAFFOLD` | The route is an intentional starter, alias, or thin wrapper and does not yet represent a distinct business/operations screen. | Define the real target workflow before adding more UI. |

## Summary

| Count | Screens |
| --- | ---: |
| Total reviewed | 46 |
| Complete enough for current use | 25 |
| Partial and still needs closure | 17 |
| Scaffold or thin alias | 4 |

## Unfinished Screens

The following screens should be treated as not fully complete:

- `infra`: closeout gate now marks the page as static sample-backed and blocks runtime actions; still needs runtime topology/node registry, live health source, capacity thresholds, incident linkage, and action ports.
- `screen-flow-management`: needs real flow CRUD/versioning/impact checks.
- `screen-menu-assignment-management`: needs assignment mutation, conflict detection, and authority impact preview.
- `wbs-management`: needs plan save/update, schedule variance, SR/Codex linkage persistence, and audit.
- `new-page`: starter workspace only; needs a real target screen definition.
- `notification`: security notification routing save, production dispatch, and delivery/activity history exist; still needs generic notification rule CRUD, recipient scoping, test dispatch, failed-delivery retry, and generalized audit/permission contracts.
- `performance`: request/JVM diagnostics and closeout gate exist; still needs threshold persistence, alert rules, export, retention, trend comparison, incident linkage, and audit.
- `external-schema`: needs schema version publish/rollback and compatibility checks.
- `external-keys`: needs key issue/rotate/revoke workflow and secret-safe audit evidence.
- `external-webhooks`: endpoint/delivery policy visibility exists; still needs webhook endpoint CRUD, signing-secret rotation with masked grace period, test delivery, replay control, failure policy persistence, and audit.
- `external-maintenance`: needs maintenance window create/update/approve and incident linkage.
- `monitoring-center`: needs real metric source binding, acknowledgement/escalation, and incident lifecycle actions.
- `sensor-list`: needs real sensor inventory source, status refresh, export, and bulk actions.
- `db-sync-deploy`: analyze/execute and validate-policy slices now exist with local evidence history; still needs real DB sync runner, durable DB patch/deploy evidence persistence, approval binding, and production target controls.
- `external-connection-add`: thin wrapper over edit form; keep as an alias until add-specific validation is explicit.
- `batch-management`: closeout gate now exposes read-only job/queue/worker/run coverage; still needs backend pause/resume/retry/drain actions and queue/action audit.
- `backup-execution`: route mode exists, but needs stronger execution-first readiness, guarded run evidence, and route-specific closeout proof.
- `restore-execution`: route mode exists, but needs stronger restore-first readiness, preflight/approval evidence, and rollback proof.
- `security-history`: thin wrapper around the shared login/security history page; acceptable as an alias but not a distinct system security investigation console.
- `login-history` and `member-security-history`: thin wrappers around the shared history page; complete as route aliases, incomplete only if distinct route-specific behavior is expected.

## Screen Inventory

| Screen ID | Label | Route | Current status | Actual functions needed before final closeout |
| --- | --- | --- | --- | --- |
| `system-code` | 시스템 코드 | `/admin/system/code` | `COMPLETE` | Maintain class/group/detail code CRUD, bulk use toggles, bilingual labels, delete confirmation, and audit. |
| `page-management` | 화면 관리 | `/admin/system/page-management` | `COMPLETE` | Keep page registration, default `PAGE_CODE_VIEW` creation, delete impact checks, bilingual messages, and authority cleanup together. |
| `function-management` | 기능 관리 | `/admin/system/feature-management` | `COMPLETE` | Keep feature CRUD, role exposure, user override impact, and page linkage validation. |
| `menu-management` | 메뉴 관리 | `/admin/system/menu` | `COMPLETE` | Keep menu tree read/write, create-page intake, ordering, visibility, page/function seeding, and builder manifest draft creation. |
| `faq-menu-management` | FAQ 메뉴 관리 | `/admin/content/menu` | `COMPLETE` | Keep content menu list/save behavior, FAQ grouping, menu visibility, and bilingual route handling. |
| `full-stack-management` | 풀스택 관리 | `/admin/system/full-stack-management` | `COMPLETE` | Keep menu-page-function-API-schema exploration, visibility changes, create-page links, and screen-command metadata in sync. |
| `infra` | 인프라 | `/admin/system/infra` | `PARTIAL` | Closeout gate and disabled action contract exist; still replace static node rows with topology/node registry, live health, capacity thresholds, incident links, and guarded remediation actions. |
| `screen-flow-management` | 화면 흐름 관리 | `/admin/system/screen-flow-management` | `PARTIAL` | Add flow create/update/delete, ordered transition editing, versioning, validation, and impact checks for linked menus/pages. |
| `screen-menu-assignment-management` | 화면-메뉴 귀속 관리 | `/admin/system/screen-menu-assignment-management` | `PARTIAL` | Add assignment mutation, duplicate/conflict detection, authority impact preview, and rollback/audit evidence. |
| `wbs-management` | WBS 관리 | `/admin/system/wbs-management` | `PARTIAL` | Add persistent plan fields, actual dates, variance metrics, SR/Codex request links, bulk updates, and audit. |
| `new-page` | 새 페이지 | `/admin/system/new-page` | `SCAFFOLD` | Define the actual target workflow, target table/API, feature codes beyond VIEW, and owner lane before implementation. |
| `ip-whitelist` | IP 화이트리스트 | `/admin/system/ip_whitelist` | `COMPLETE` | Keep allow/deny entries, expiry, reason, bulk import/export, and security audit linkage. |
| `access-history` | 접속 로그 | `/admin/system/access_history` | `COMPLETE` | Keep search, actor/IP filtering, export, linked blocklist/security-policy navigation, and retention policy. |
| `error-log` | 에러 로그 | `/admin/system/error-log` | `COMPLETE` | Keep error search, stack/context inspection, blocklist handoff, trace correlation, and remediation links. |
| `login-history` | 로그인 이력 | `/admin/member/login_history` | `SCAFFOLD` | Alias is acceptable; define distinct login-history-only filters/actions if it must stop being a wrapper. |
| `member-security-history` | 회원 접근 차단 이력 | `/admin/member/security` | `SCAFFOLD` | Alias is acceptable; define member-security-specific investigation and unblock actions if needed. |
| `security-history` | 보안 이력 | `/admin/system/security` | `PARTIAL` | Add a distinct system security investigation model or explicitly document it as a shared-history alias. |
| `security-policy` | 보안 정책 | `/admin/system/security-policy` | `COMPLETE` | Keep detection, suppress/baseline, auto-fix, rollback, notification, and runtime remediation evidence aligned. |
| `notification` | 알림센터 | `/admin/system/notification` | `PARTIAL` | Security notification routing save, production dispatch, and delivery/activity history exist; still add generic rule CRUD, recipient scoping, dispatch test, failed-delivery retry, and generalized audit/permission contracts. |
| `performance` | 성능 | `/admin/system/performance` | `PARTIAL` | Request/JVM diagnostics and disabled action contract exist; still add threshold management, alert rules, export, retention windows, trend comparison, and incident linkage. |
| `external-connection-list` | 외부 연계 목록 | `/admin/external/connection_list` | `COMPLETE` | Keep connection search, health/status display, detail/add/edit navigation, and integration ownership fields. |
| `external-schema` | 외부 스키마 | `/admin/external/schema` | `PARTIAL` | Add schema version publish, compatibility tests, rollback, endpoint binding, and change audit. |
| `external-keys` | 외부 인증키 관리 | `/admin/external/keys` | `PARTIAL` | Add issue/rotate/revoke, masked display, expiry policy, partner scope, and secret-safe audit logging. |
| `external-usage` | API 사용량 | `/admin/external/usage` | `COMPLETE` | Keep traffic summary, auth-method breakdown, trend rows, quota links, and observability drill-down. |
| `external-logs` | 외부 연계 로그 | `/admin/external/logs` | `COMPLETE` | Keep access/error/trace aggregation, filtering, watchlist linkage, and trace drill-down. |
| `external-webhooks` | 웹훅 설정 | `/admin/external/webhooks` | `PARTIAL` | Endpoint state and delivery policy visibility exist; still add endpoint CRUD, signing-secret rotation, delivery test, replay, failure policy persistence, and audit. |
| `external-sync` | 동기화 실행 | `/admin/external/sync` | `COMPLETE` | Keep sync run request, batch/scheduler linkage, status feedback, retry handoff, and audit. |
| `external-monitoring` | 연계 모니터링 | `/admin/external/monitoring` | `COMPLETE` | Keep integration health, webhook/sync/API usage signals, bootstrap-first verification target, and incident links. |
| `external-maintenance` | 점검 관리 | `/admin/external/maintenance` | `PARTIAL` | Add maintenance window CRUD, approval/release, affected connection scope, notification, and backlog replay policy. |
| `external-retry` | 재시도 관리 | `/admin/external/retry` | `COMPLETE` | Keep retry queue read, force replay, schedule handoff, result state, and downstream safety checks. |
| `db-sync-deploy` | DB 동기화 배포 | `/admin/system/db-sync-deploy` | `PARTIAL` | Keep analyze/validate-policy/server-up/history slices; add real DB sync runner, durable DB/deploy evidence capture, approval binding, production target controls, and `EXECUTION_SOURCE` enforcement for non-test execution. |
| `security-monitoring` | 보안 모니터링 | `/admin/system/security-monitoring` | `COMPLETE` | Keep threat summary, block candidates, notification, state save, policy links, and audit. |
| `blocklist` | 차단 목록 | `/admin/system/blocklist` | `COMPLETE` | Keep block/unblock, expiry, reason, source event, bulk actions, and security-policy correlation. |
| `security-audit` | 보안 감사 | `/admin/system/security-audit` | `COMPLETE` | Keep audit queries, policy coverage, export, evidence trail, and remediation handoff. |
| `monitoring-center` | 운영센터 | `/admin/monitoring/center` | `PARTIAL` | Add real sensor/metric source binding, incident acknowledgement, escalation, assignment, and closeout history. |
| `sensor-add` | 센서 등록 | `/admin/monitoring/sensor_add` | `COMPLETE` | Keep form validation, duplicate checks, connection binding, save audit, and list/detail return path. |
| `sensor-edit` | 센서 설정 | `/admin/monitoring/sensor_edit` | `COMPLETE` | Keep load/save, calibration/status fields, connection binding, and audit. |
| `sensor-list` | 센서 목록 | `/admin/monitoring/sensor_list` | `PARTIAL` | Add live inventory source, status refresh, bulk enable/disable, export, and detail navigation. |
| `external-connection-add` | 외부연계 등록 | `/admin/external/connection_add` | `SCAFFOLD` | Thin add-mode wrapper is acceptable; add-specific validation and provisioning checks should be explicit before final closeout. |
| `external-connection-edit` | 외부연계 수정 | `/admin/external/connection_edit` | `COMPLETE` | Keep load/save, validation, secret masking, schema/key/webhook links, and audit. |
| `batch-management` | 배치 관리 | `/admin/system/batch` | `PARTIAL` | Keep the UI closeout gate; add backend job pause/resume/retry, queue drain controls, worker health action links, result evidence, and audit. |
| `scheduler-management` | 스케줄러 관리 | `/admin/system/scheduler` | `COMPLETE` | Keep cron/job editing, next-run preview, enable/disable, test-run, and audit. |
| `db-promotion-policy` | DB 반영 정책 카탈로그 | `/admin/system/db-promotion-policy` | `COMPLETE` | Keep policy catalog read/save, SQL render class, rollback requirements, masking, and patch-governance linkage. |
| `backup-config` | 백업 설정 | `/admin/system/backup_config` | `COMPLETE` | Keep profile/storage/retention config, preflight, save, and audit. |
| `backup-execution` | 백업 실행 | `/admin/system/backup` | `PARTIAL` | Keep route-specific execution mode visible and finish guarded run evidence, live progress, result history, and artifact registration proof. |
| `restore-execution` | 복구 실행 | `/admin/system/restore` | `PARTIAL` | Keep route-specific restore mode visible and finish preflight, approval, dry-run, restore execution, and post-restore evidence. |

## Closeout Checklist For Each Partial Screen

Before marking a partial screen complete, verify:

- route exists in Korean and English paths
- menu row, page code, and default VIEW feature are registered
- action feature codes exist for every mutation or execution button
- page-data endpoint and mutation endpoints have named controller/service owners
- storage is DB-backed or explicitly documented as a temporary bridge
- audit, trace, and operator feedback are attached to every state-changing action
- empty/error/loading states use the shared admin screen pattern
- exact route responds after local build/package/restart if runtime behavior changed

## Skill Routing

- Use `admin-screen-unifier` when the screen already exists but should be normalized or converted from starter/static presentation into a governed admin page shape.
- Use `carbonet-feature-builder` when adding the missing backend service, mapper, API, menu metadata, or authority chain.
- Use `carbonet-fast-bootstrap-ops` when the fix must be proven on local `:18000`.
- Use `carbonet-react-refresh-consistency` only when the issue is shell/static cache visibility after a frontend build.

Use `docs/architecture/admin-system-screen-closure-backlog.md` for implementation order and per-screen acceptance evidence.
