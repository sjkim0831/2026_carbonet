# AI Agent DB Patch Governance

Generated on 2026-04-14 for Carbonet AI-assisted development and remote DB reflection.

## Goal

Make every AI-created DB change:

- traceable at save time
- reviewable before remote reflection
- reproducible through a patch file or queue item
- evidenced after actual apply on the target DB

This rule applies to both:

- admin-save style metadata changes
- AI-authored SQL, seed, diff, or schema/data migration work

## Non-Negotiable Rule

If an AI agent changes DB state, that change must leave DB patch evidence.

Do not allow any of these as the final state:

- source code changed but DB patch path was not updated
- SQL was run manually on a server without `DB_PATCH_HISTORY` or queue evidence
- remote DB was modified directly without a patch file, queue item, or execution result
- remote app was restarted after DB changes with no DB patch trace

## Required Evidence By Stage

### 1. Save-Time Capture

When an AI-assisted feature causes admin metadata or business-significant DB writes, the code path must write:

- `BUSINESS_CHANGE_LOG`

Minimum metadata:

- table
- target key
- before summary
- after summary
- actor
- source environment
- logical object ID
- rename aliases when applicable

### 2. Promotion Governance

When the change can be reflected to another environment, it must be representable in:

- `DEPLOYABLE_DB_PATCH_QUEUE`

Queue evidence must include:

- source change IDs
- target environment
- deterministic patch payload or rendered SQL preview
- risk/policy decision
- approval or override reason when required

### 3. Apply-Time Evidence

When the patch is actually applied to a DB, the run must leave:

- `DEPLOYABLE_DB_PATCH_RESULT`
- `DB_PATCH_HISTORY`

If execution happened through deploy automation, the SQL file path, checksum, source env, target env, risk level, and status must be recorded.

## AI Agent Rules

### Rule 1. No Untracked DB Change

If the AI agent writes or changes:

- mapper SQL that mutates data
- bootstrap/seed SQL
- migration SQL
- admin save logic that updates metadata tables
- deploy scripts that apply DB changes

then the same turn must also update the DB patch trace path.

### Rule 2. Remote Reflection Must Use The Patch Path

Remote DB changes must be applied through one of these:

- queue execution path from `/admin/system/version`
- `ops/scripts/windows-db-sync-push-and-fresh-deploy-221.sh`

Do not use ad hoc remote `csql` execution as the steady-state solution unless the execution still records `DB_PATCH_HISTORY`.

### Rule 3. Restart Comes After Patch Evidence

If the task includes remote app restart, the order is:

1. patch file or queue batch resolved
2. target DB backup taken
3. patch recorded/applied
4. `DB_PATCH_HISTORY` or equivalent result evidence written
5. remote app stop/start/restart verification

Do not restart first and “record later”.

### Rule 4. Rename/Delete Are High-Risk

For `DELETE`, `RENAME`, PK-changing update, relation replacement, or destructive diff:

- preserve old-key and new-key aliases in patch metadata
- mark risk clearly
- require rollback or backup posture
- keep the execution plan serial for the same logical object

### Rule 5. Bidirectional Sync Is Patch-Replay, Not Blind Diff

For local-to-remote and remote-to-local sync:

- prefer logical object patch chains over last-state overwrite
- replay ordered patch history when possible
- detect mixed-environment chains and require explicit override

## Recommended Operational Flow

### AI-created admin save or metadata feature

1. code writes `BUSINESS_CHANGE_LOG`
2. eligible change becomes a queue item or manual-queue candidate
3. operator reviews in `/admin/system/version`
4. AI or operator executes queue
5. remote DB apply records result and `DB_PATCH_HISTORY`
6. remote app restart is verified

### AI-created SQL or schema/data patch

1. SQL file is created under repository control
2. apply path goes through deploy automation or queue execution
3. pre-apply backup is taken
4. `DB_PATCH_HISTORY` is written
5. remote runtime verification follows

## Verification Checklist

Before closing AI work that touches DB, verify all relevant items:

- `BUSINESS_CHANGE_LOG` exists for save-time changes
- queue item exists when the change is promotable
- execution result row exists after apply
- `DB_PATCH_HISTORY` row exists after actual DB apply
- remote stop/start/restart verification completed when remote runtime was touched
- target route or login page responds after restart

## Skills Impact

The following skills must enforce this policy:

- `carbonet-feature-builder`
- `carbonet-fast-bootstrap-ops`

Any future Carbonet skill that can change DB state should reference this document before implementation.
