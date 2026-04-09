# System Folder Refactor Checklist

## Goal

Provide an execution checklist for cleaning up the current repository structure without reopening the architecture decision every time.

Use this document together with:

- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/builder-folder-refactor-priority-map.md`
- `docs/architecture/large-move-completion-contract.md`
- `docs/architecture/screenbuilder-module-source-inventory.md`
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`

## Refactor Order

Do the folder cleanup in this order:

1. freeze ownership and target paths
2. confirm source-of-truth folders
3. move or create files only inside one chosen family
4. fix imports and module dependencies
5. verify build and runtime packaging
6. remove transitional duplicates only after verification

Do not start with broad rename or directory beautification.

## Co-Execution Rule

This checklist may be executed in two modes:

- dedicated refactor wave
- builder-implementation-coupled cleanup

When builder work is in progress, prefer builder-coupled cleanup if:

- the moved files are in the same ownership family
- the cleanup reduces current builder drift or duplicate ownership
- the build and ownership boundary remain understandable

Use a dedicated refactor wave only when:

- many shared paths must move together
- the cleanup crosses multiple owner families
- the main work is structural rather than feature-progressive

Large-move-by-slices rule:

- large structural cleanup may be completed through multiple small verified slices
- each slice should move one family to its target path and close that slice before the next one
- prefer accumulated cutover over one-shot bulk motion when token cost, merge risk, or verification risk is high

## 1. Ownership Freeze

Before moving files, confirm:

- which folder currently owns the family
- which folder should own it after cleanup
- whether the family is `COMMON_ONLY`, `PROJECT_ONLY`, or `COMMON_DEF_PROJECT_BIND`
- whether the root `src/` copy is still a live source or only a transitional duplicate

## 2. Target Placement Check

For every moved or newly created file, choose only one of these target lanes:

- `apps/`
  - executable runtime assembly
- `modules/`
  - reusable backend module
- `frontend/src/`
  - frontend authoring source
- `templates/`
  - starter/bootstrap/install manifest asset
- root `src/`
  - transitional runtime path only when no cleaner live module path exists yet

If a file does not fit one lane clearly, stop and reclassify ownership first.

## 3. Builder Family Check

When the family is builder-related, use this split:

- `modules/screenbuilder-core`
  - common builder contracts, services, ports, and runtime-neutral logic
- `modules/screenbuilder-runtime-common-adapter`
  - reusable default policy adapters
- `modules/screenbuilder-carbonet-adapter`
  - Carbonet-specific menu, authority, route, runtime, and bridge wiring
- `frontend/src/features/screen-builder`
  - builder UI
- `frontend/src/framework`
  - frontend shared builder and authority contract boundary
- `frontend/src/platform`
  - manifests, telemetry, registry, observability metadata
- `templates/screenbuilder-project-bootstrap`
  - bootstrap and install manifests

Do not move builder core logic back into root `feature/admin` or arbitrary project-local copies.

## 4. Platform Family Check

When the family is platform-control-plane related, prefer:

- reusable backend line -> `modules/platform-*`
- executable assembly wiring -> `apps/carbonet-app`
- frontend platform metadata -> `frontend/src/platform`
- frontend app-shell integration -> `frontend/src/app`

Use root `src/main/java/egovframework/com/platform/**` only as a transitional lane when the module line is not fully cut over yet.

## 5. Page Systemization Check

If the refactor touches page identity or builder-managed screens, verify:

- `pageId`
- `menuCode`
- route binding
- page manifest
- authority scope
- data and action contracts
- install scope
- project binding inputs

Do not separate folder cleanup from page identity and authority cleanup if the page is meant to be installable or builder-managed.

## 6. Duplicate Removal Check

Before deleting a legacy root copy, verify:

- module or app path already builds from the new source
- no remaining import points depend on the old path
- no resource XML or metadata file is still only available in the old path
- audit scripts or boundary checks cover reintroduction risk

## 7. Verification Check

At minimum verify:

- module build still resolves
- app assembly still resolves
- no generated output is being treated as source of truth
- no new common/platform logic was accidentally placed into the root legacy tree
- no new frontend source was added outside `frontend/src/`

## Done Criteria

The cleanup slice is complete only when:

- one family has one clear source-of-truth folder
- duplicates are either removed or explicitly marked transitional
- the chosen placement follows `system-folder-structure-alignment.md`
- builder-related pages still satisfy `page-systemization-minimum-contract.md` where applicable
