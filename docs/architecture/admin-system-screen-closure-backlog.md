# Admin System Screen Closure Backlog

Generated on 2026-04-14 from `docs/architecture/admin-system-screen-completion-audit.md`.

## Purpose

This backlog turns the `PARTIAL` and `SCAFFOLD` findings into implementation-ready closure tickets.

Use it when planning the next Carbonet admin-system work slice. The audit says whether a route is complete; this backlog says what must be built next and how to verify closure.

## Priority Model

| Priority | Meaning | Default handling |
| --- | --- | --- |
| `P0` | Safety, backup/restore, credential, or execution control gap. | Close before cosmetic or registry-only work. |
| `P1` | Operations visibility or incident response gap. | Close in the next admin operations hardening wave. |
| `P2` | Governance registry or planning workflow gap. | Close after P0/P1 runtime operation paths are stable. |
| `P3` | Starter route, alias route, or scope-definition gap. | Decide whether to keep as alias/scaffold before building. |

## Closure Tickets

| Ticket | Screen ID | Priority | Owner lane | Required closure work | Acceptance evidence |
| --- | --- | --- | --- | --- | --- |
| `ADMIN-SYS-CLOSE-001` | `backup-execution` | `P0` | `COMMON_ADMIN_OPS` | Keep `/admin/system/backup` execution-first and complete guarded run action, live progress, result evidence, backup artifact registration, and operator audit. | `GET /admin/system/backup` renders route closeout readiness; guarded execute action records audit and result; route passes `:18000` freshness and exact-route check after implementation. |
| `ADMIN-SYS-CLOSE-002` | `restore-execution` | `P0` | `COMMON_ADMIN_OPS` | Keep `/admin/system/restore` restore-first and complete selected backup artifact, preflight, dry-run, approval gate, restore execution, rollback evidence, and post-restore health proof. | `GET /admin/system/restore` renders route closeout readiness; dry-run and execute paths are separated; audit includes artifact, actor, target, and result. |
| `ADMIN-SYS-CLOSE-003` | `external-keys` | `P0` | `COMMON_ADMIN_OPS` | Add key issue, rotate, revoke, expiry policy, masked display, partner scope, and secret-safe audit. | No secret is rendered in full; mutation actions require action feature codes; audit records key id/fingerprint only. |
| `ADMIN-SYS-CLOSE-004` | `batch-management` | `P0` | `COMMON_ADMIN_OPS` | Complete backend job pause/resume/retry, queue drain controls, worker-health links, run history, failure detail, and audit now that the UI closeout gate exposes the blocked action contract. | Action buttons call named backend endpoints; each action shows result state and writes audit evidence. |
| `ADMIN-SYS-CLOSE-005` | `db-sync-deploy` | `P0` | `COMMON_ADMIN_OPS` | Complete real DB sync runner, durable DB/deploy evidence persistence, approval binding, production target controls, `EXECUTION_SOURCE` enforcement, and breakglass validation now that analyze, validate-policy, server-up test, and local history slices exist. | Raw script is no longer the primary operator path; analyze/validate/execute are separate; DB patch, deploy, and freshness evidence are persisted beyond local runtime evidence. |
| `ADMIN-SYS-CLOSE-006` | `infra` | `P1` | `COMMON_ADMIN_OPS` | Replace static node rows with topology/node registry, live health source, capacity thresholds, incident links, and guarded remediation handoff now that the UI closeout gate exposes the blocked runtime action contract. | Page-data no longer depends on hard-coded rows; node status includes source timestamp and degraded/unknown state; refresh/incident/drain/handoff actions are backend-gated and audited. |
| `ADMIN-SYS-CLOSE-007` | `performance` | `P1` | `COMMON_ADMIN_OPS` | Add threshold management, alert rule links, export, retention windows, trend comparison, and incident linkage now that request/JVM diagnostics and the UI action contract expose the blocked governance actions. | Threshold source is persisted or explicitly configured; slow/error route drill-down links to trace/log evidence; export/incident actions are backend-gated and audited. |
| `ADMIN-SYS-CLOSE-008` | `notification` | `P1` | `GENERAL_ADMIN` | Add generic notification rule CRUD, recipient scoping, test dispatch, failed-delivery retry, and generalized audit/permission contracts now that security notification routing save, production dispatch, and delivery/activity history already exist. | Test dispatch is separate from production dispatch; recipient scope and delivery result are visible; failed-delivery retry is idempotent and audited. |
| `ADMIN-SYS-CLOSE-009` | `external-webhooks` | `P1` | `COMMON_ADMIN_OPS` | Add webhook endpoint CRUD, signing-secret rotation, delivery test, replay, failure policy persistence, and audit now that endpoint/delivery policy visibility exists. | Secret rotation masks secret values; delivery test and replay produce visible result history; failure policy save records before/after audit. |
| `ADMIN-SYS-CLOSE-010` | `external-maintenance` | `P1` | `COMMON_ADMIN_OPS` | Add maintenance window CRUD, approval/release, affected connection scope, notification plan, backlog replay policy, and incident linkage. | Maintenance state transitions are explicit and audited; affected connections are previewed before activation. |
| `ADMIN-SYS-CLOSE-011` | `monitoring-center` | `P1` | `COMMON_ADMIN_OPS` | Bind real sensor/metric sources, incident acknowledgement, escalation, assignment, closeout history, and operations drill-down links. | Operator can acknowledge and close an incident; metric rows include source and refreshed-at evidence. |
| `ADMIN-SYS-CLOSE-012` | `sensor-list` | `P1` | `PROJECT_ADMIN` | Add live sensor inventory source, status refresh, bulk enable/disable, export, and detail navigation. | List rows come from the same source as add/edit; bulk mutation is authority-gated and audited. |
| `ADMIN-SYS-CLOSE-013` | `external-schema` | `P1` | `COMMON_ADMIN_OPS` | Add schema version publish, compatibility tests, rollback, endpoint binding, and change audit. | Published/current/rollback schema states are visible; compatibility check result blocks unsafe publish. |
| `ADMIN-SYS-CLOSE-014` | `screen-flow-management` | `P2` | `GENERAL_ADMIN` | Add screen-flow CRUD, ordered transition editing, versioning, validation, and impact checks for linked menus/pages. | Flow edits validate duplicate/invalid transitions and expose affected routes before save. |
| `ADMIN-SYS-CLOSE-015` | `screen-menu-assignment-management` | `P2` | `GENERAL_ADMIN` | Add screen-menu assignment mutation, duplicate/conflict detection, authority impact preview, rollback, and audit. | Assignment save shows affected menu/page/feature codes and creates audit evidence. |
| `ADMIN-SYS-CLOSE-016` | `wbs-management` | `P2` | `GENERAL_ADMIN` | Add persistent planned/actual dates, variance metrics, owner/status updates, SR/Codex request links, bulk update, and audit. | Planned and actual dates are separate; variance metrics derive from stored dates; SR links resolve. |
| `ADMIN-SYS-CLOSE-017` | `security-history` | `P2` | `COMMON_ADMIN_OPS` | Either define a distinct system security investigation console or document this route as a shared-history alias and hide duplicate menu behavior if needed. | Route behavior is documented as distinct or alias; menu labels no longer imply missing unique functionality. |
| `ADMIN-SYS-CLOSE-018` | `new-page` | `P3` | `GENERAL_ADMIN` | Decide the actual target workflow, target table/API, feature codes beyond VIEW, and owner lane before implementing more UI. | Page has an approved target spec or remains explicitly marked as starter/scaffold. |
| `ADMIN-SYS-CLOSE-019` | `external-connection-add` | `P3` | `COMMON_ADMIN_OPS` | Keep as add-mode wrapper or add distinct create-only validation, provisioning checklist, and duplicate checks. | Add route documents alias behavior or exposes create-specific validation separate from edit. |
| `ADMIN-SYS-CLOSE-020` | `login-history` | `P3` | `GENERAL_ADMIN` | Keep as shared history alias or define login-history-specific filters/actions. | Alias is documented, or route has distinct route-specific behavior and tests. |
| `ADMIN-SYS-CLOSE-021` | `member-security-history` | `P3` | `GENERAL_ADMIN` | Keep as shared history alias or define member-security-specific investigation/unblock actions. | Alias is documented, or route has distinct route-specific behavior and tests. |

## Implementation Routing

| Work type | Primary skill | Secondary skill |
| --- | --- | --- |
| Converting static/read-only screen to governed admin page | `admin-screen-unifier` | `carbonet-feature-builder` |
| Adding backend controller/service/mapper/API action | `carbonet-feature-builder` | `carbonet-audit-trace-architecture` when trace/audit schema changes |
| Backup/restore/runtime execution closure | `carbonet-fast-bootstrap-ops` | `carbonet-runtime-topology-ops` if server topology or deployment ownership changes |
| Codex/SR/WBS linkage | `carbonet-codex-execution-console` | `carbonet-feature-builder` |
| Screen flow, assignment, builder registry linkage | `carbonet-screen-builder` | `carbonet-feature-builder` |
| External integration secrets, webhooks, sync, retry | `carbonet-feature-builder` | `carbonet-audit-trace-architecture` for correlation and audit evidence |

## Shared Acceptance Checklist

Every ticket must close these before moving its screen from `PARTIAL` or `SCAFFOLD` to `COMPLETE`:

- Korean and English route entries remain aligned.
- Menu row, page code, default VIEW feature, and action feature codes are explicit.
- Backend page-data and mutation endpoints have named controller/service owners.
- Storage is DB-backed or explicitly marked as a temporary bridge with a removal trigger.
- Every mutation or execution action writes audit evidence.
- Empty, loading, error, denied, and success states use shared admin UI patterns.
- If runtime behavior changes on `:18000`, run the repository build/package/restart/freshness flow and exact route check.

## Recommended First Wave

Start with these five tickets:

- `ADMIN-SYS-CLOSE-001` backup execution
- `ADMIN-SYS-CLOSE-002` restore execution
- `ADMIN-SYS-CLOSE-003` external keys
- `ADMIN-SYS-CLOSE-004` batch management
- `ADMIN-SYS-CLOSE-005` DB sync deploy

Reason: these close the highest operational risk before improving planning, registry, or alias polish.
