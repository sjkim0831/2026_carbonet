# Large Move Completion Contract

## Goal

Define when a large structural move is truly complete.

Use this document when the team allows broad folder or package movement and wants the work to end in a fully closed state rather than an endless transitional state.

Use together with:

- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/system-folder-refactor-checklist.md`
- `docs/architecture/builder-folder-refactor-priority-map.md`
- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/builder-structure-wave-20260409-closure.md` when the current wave closes only the builder structure-governance family

## Core Rule

A large move is complete only when the repository no longer depends on the old ownership path as a live source of truth for the selected family.

Moving files is not completion.
Completion requires ownership closure.

## Required Completion Conditions

For each selected family, all of the following must be true.

### 1. One Source Of Truth

- one canonical path is chosen
- new code for that family lands only in the canonical path
- the old path is either deleted or clearly reduced to a temporary compatibility shim

### 2. Build Closure

- module compile passes for the moved family
- app compile or package still resolves after the move
- no moved family still depends on the old path through hidden imports or resources

### 3. Resource Closure

- Java source ownership and resource ownership match
- mapper XML, metadata JSON, contracts, and route resources resolve from the intended path
- the build does not silently succeed only because a duplicate root resource is still present

### 4. Dependency Closure

- dependency direction matches the target architecture
- app assembly depends on reusable modules, not the reverse
- common core does not regain project-specific imports

### 5. Runtime Closure

- if runtime behavior changed, the repository freshness sequence is run
- the runtime uses the moved source line, not a stale or duplicate path
- no route, controller, or page assembly still points at the removed path by assumption

### 6. Doc Closure

- structure and ownership docs reflect the new source of truth
- any known remaining transitional shims are listed explicitly
- the next removal candidate is clear

## Allowed Transitional State

A temporary shim is allowed only when all of these are true:

- the shim is visibly transitional
- the canonical path is already the source of truth
- the shim exists only to protect one remaining caller or runtime entry
- the shim has an explicit next-removal note

If the old path is still being extended, it is not a shim. The move is incomplete.

## Large Move Done Criteria

A large move wave is done only when:

1. every selected family has one canonical path
2. old live source lines are removed or narrowed to explicit shims
3. compile and package closure are proven
4. runtime closure is proven when applicable
5. docs name the new ownership clearly

## Wave Planning Rule

A repository-wide large move may be completed through multiple waves.

But each wave must end in a closed state for the chosen families.

Do not leave every family half-moved.
Prefer:

- fewer families
- fully closed

over:

- many families
- all partially transitional

## Family-Scoped Completion Rule

When a wave explicitly closes only one family, completion must be judged only against that named family.

For example:

- a builder-structure-governance wave may be marked complete even if builder resource ownership or broader control-plane composition is still open

But only when:

- the selected family is named explicitly
- the canonical source-of-truth path is explicit
- old-path treatment is explicit
- the remaining open families are named explicitly

Do not inflate a family-scoped closed wave into a repository-wide completion claim.

## Existing Session Completion Rule

It is acceptable to finish the remaining work using only the currently active sessions.

This is safe only when all of the following remain true:

- each active session stays inside its owner paths
- one active session owns each shared file family
- one active session owns each large-move family at a time
- selected families are closed wave by wave instead of left half-moved
- build, runtime, and doc closure are assigned before the wave ends

Do not open additional implementation sessions just to increase parallelism if that would split ownership of the same family.
