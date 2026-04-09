# Current Worktree Snapshot

Reconciled on `2026-04-09` from `git status --short`.

## Current State

- the worktree is already heavily in flight across frontend, backend, docs, ops scripts, and generated runtime assets
- this request should not assume a clean branch
- new work should stay inside the owner paths defined in `session-plan.md`

## Shared Frontend Contract Families Already In Play

- `frontend/src/app/routes/**`
- `frontend/src/lib/api/**`
- `frontend/src/lib/navigation/**`
- `frontend/src/platform/**`
- `frontend/src/features/screen-builder/**`
- `frontend/src/features/environment-management/**`
- `frontend/src/features/project-version-management/**`

## Shared Backend Contract Families Already In Play

- `src/main/java/egovframework/com/feature/admin/**`
- `src/main/java/egovframework/com/platform/**`
- `src/main/java/egovframework/com/framework/**`
- `src/main/resources/egovframework/mapper/com/platform/**`
- `src/main/resources/egovframework/mapper/com/feature/admin/**`
- `modules/**`

## Runtime And Generated Output Families Already In Play

- `ops/scripts/**`
- `src/main/resources/static/react-app/**`
- `templates/**`

## Docs Already In Play

- `docs/architecture/**`
- `docs/operations/**`
- `docs/sql/**`
- `docs/ai/**`

## Existing Durable Context To Reopen

- `docs/architecture/carbonet-resonance-separation-status.md`
- `docs/architecture/carbonet-resonance-boundary-classification.md`
- `docs/architecture/installable-builder-upgrade-roadmap.md`
- `docs/architecture/platform-common-module-versioning.md`
- `docs/architecture/common-db-and-project-db-splitting.md`
- `docs/ai/session-notes/builder-master-summary.md`

## Immediate Non-Overlap Decision

- do not open a second lane that edits `frontend/src/app/routes/**`
- do not open a second lane that edits `src/main/java/egovframework/com/feature/admin/**` and `src/main/java/egovframework/com/platform/**` together without one owner
- do not treat `src/main/resources/static/react-app/**` as the source of truth for builder or route logic
- do not mix deploy-governance edits with unrelated feature-page edits in the same lane
