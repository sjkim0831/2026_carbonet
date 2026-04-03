# Active Session Index

Last updated: `2026-03-30`

## Resume Order

1. run `bash ops/scripts/codex-resume-status.sh`
2. run `bash ops/scripts/codex-admin-status.sh`
3. open the request folder listed below
4. stay inside that request's `allowedPaths`
5. update `handoff-latest.md` before stopping

## Active Requests

### `admin-migration-20260330`

- path: `docs/ai/60-operations/session-orchestration/active/admin-migration-20260330`
- purpose: keep current admin migration, observability backend, and runtime packaging work resumable after re-login
- status table: `docs/operations/admin-screen-implementation-status.md`
- current route scope: `배출/인증`, `거래`, `콘텐츠`
- current shared-file owner groups:
  - Session A: route contracts and shared frontend navigation files
  - Session B: feature pages under `frontend/src/features/**`
  - Session C: backend observability/admin controller-service-mapper chain
  - Session D: generated runtime assets and freshness verification
- first files to open:
  - `session-plan.md`
  - `current-worktree.md`
  - `handoff-latest.md`
- do not duplicate:
  - `frontend/src/app/routes/**`
  - `frontend/src/lib/navigation/**`
  - `frontend/src/lib/api/**`
  - `src/main/resources/egovframework/mapper/com/common/ObservabilityMapper.xml`
  - `src/main/resources/static/react-app/**`

## Index Rule

- add one section per active coordinated request
- remove or archive the section when the request is finished
- keep this file short enough to act as the first resume screen
