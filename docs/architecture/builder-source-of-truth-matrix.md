# Builder Source Of Truth Matrix

## Goal

Provide one quick matrix for the current builder structure-governance wave.

Use this when the immediate question is:

- which path is canonical
- which path is transitional
- whether an old path should be treated as `DELETE` or `EXPLICIT_SHIM`

Use together with:

- `docs/architecture/builder-structure-wave-20260409-closure.md`
- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`

If the current question is no longer "which path is canonical" but "which builder resource family should continue next", switch to:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for the continuation family.

## Current Matrix

| Family slice | Canonical path | Old or competing path | Current treatment | Notes |
| --- | --- | --- | --- | --- |
| builder core | `modules/screenbuilder-core/**` | `src/main/java/egovframework/com/platform/screenbuilder/**` | `DELETE_OR_TRANSITIONAL_ONLY` | root path is non-canonical for this wave |
| framework builder common contract/support | `modules/screenbuilder-core/**` plus approved framework contract lanes | `src/main/java/egovframework/com/framework/builder/**` | `DELETE_OR_TRANSITIONAL_ONLY` | root path is not the source of truth when equivalent module ownership exists |
| runtime-common builder policy | `modules/screenbuilder-runtime-common-adapter/**` | root or project-local policy copies | `DELETE` | do not regrow reusable policy logic under root or project-local copies |
| Carbonet-specific builder binding and bridge | `modules/screenbuilder-carbonet-adapter/**` | `src/main/java/egovframework/com/feature/admin/screenbuilder/**` and `src/main/java/egovframework/com/feature/admin/framework/builder/**` | `EXPLICIT_SHIM_ONLY_OR_DELETE` | only compatibility forwarding may remain; no live feature growth |
| executable app assembly | `apps/carbonet-app/**` | root assembly assumptions | `TRANSITIONAL_APP_WIRING_ALLOWED` | app assembly remains canonical here, but reusable builder logic must not drift back in |
| builder bootstrap/install assets | `templates/screenbuilder-project-bootstrap/**` | runtime source folders used as template storage | `DELETE` | templates stay in `templates/` only |
| structure and wave-close docs | `docs/architecture/**`, `docs/ai/**`, `STRUCTURE.md` | ad hoc root notes or scattered temporary docs | `DELETE_OR_IGNORE` | do not create parallel source-of-truth notes |

## Treatment Meanings

- `DELETE`
  - the old path should be removed rather than preserved
- `EXPLICIT_SHIM_ONLY_OR_DELETE`
  - the old path may remain only if it is a documented compatibility shim with a known removal condition
- `DELETE_OR_TRANSITIONAL_ONLY`
  - if the old path still exists, it is non-canonical and must either be removed or treated as a temporary transition line
- `TRANSITIONAL_APP_WIRING_ALLOWED`
  - this does not reopen ownership; it only acknowledges app assembly wiring may still bridge to the current runtime until a later family closes

## Decision Rule

If a path is not listed here as canonical, do not treat it as the source of truth for the current builder structure-governance wave.

If a caller wants to preserve an old path, they must prove it satisfies the shim rule in:

- `docs/architecture/builder-structure-wave-20260409-closure.md`

Otherwise the correct treatment is deletion or continued transition status, not silent coexistence.

## Next Update Rule

Update this matrix only when at least one of these changes:

- a canonical builder lane changes
- an old path treatment changes from `EXPLICIT_SHIM_ONLY_OR_DELETE` to `DELETE`
- a later family closes and removes the need for a current transitional note

Do not use this matrix to reopen `BUILDER_STRUCTURE_GOVERNANCE` after closure.

Once the canonical path answers are accepted, move to the live continuation set:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`
