# Stable Adapter And Common Core Versioning

Generated on 2026-04-08 for AI-driven common-core evolution safety.

## Goal

Define how Carbonet should let AI agents keep improving the common system while preventing repeated breakage across project runtimes.

This document establishes one strong rule:

- `stable adapter`
- `changeable common core`

with explicit versioning and compatibility governance.

## Core Position

When projects consume common jars and installable packages, the most important protected boundary is not the internal common service code.

It is:

- adapter contract
- core DTO contract
- manifest contract
- capability-key contract

These should change much more slowly than the internal common implementation.

Use this split:

1. `STABLE_ADAPTER_SURFACE`
2. `VERSIONED_COMMON_CORE`
3. `PROJECT_EXECUTOR`

## Stable Adapter Rule

Project adapters should be treated as the low-churn boundary that survives frequent common-core updates.

Project adapters may:

- import common ports
- import common DTO contracts
- bind project menu, route, authority, DB, and API sources
- translate project payloads into common-owned descriptors
- expose project executor capability implementations

Project adapters should not:

- absorb growing business logic
- duplicate common validation or compare logic
- become the place where common compatibility bugs are fixed project by project

The adapter should stay thin enough that a project can survive many common-core updates without adapter rewrites.

## Changeable Common Core Rule

The common system and common jars should remain free to evolve in:

- builder internals
- scaffold generation logic
- validator logic
- compare and repair logic
- package install flow
- read-model implementation
- observability and audit internals

These changes are acceptable if and only if they preserve:

- stable adapter contracts
- stable DTO meaning
- stable manifest semantics
- stable capability keys

## Versioning Rule

Every common line that may affect projects should be versioned explicitly.

Track at minimum:

- `commonCoreVersion`
- `adapterContractVersion`
- `apiContractVersion`
- `manifestContractVersion`
- `capabilityCatalogVersion`
- `frontendCommonVersion`
- `themePackageVersion`
- `businessProcessPackageVersion`

Projects must record which versions are installed and active.

Do not allow silent common-core drift against deployed project runtimes.

Adapter change records are mandatory as well.

At minimum record:

- adapter contract version
- adapter artifact version
- changed port set
- changed DTO set
- compatibility class
- migration-required flag

## Compatibility Rule

Treat compatibility in two lanes:

### `IMPLEMENTATION_SAFE`

Allowed when:

- adapter contract is unchanged
- DTO fields and semantics are unchanged
- manifest fields remain backward-compatible
- capability keys are unchanged

Typical examples:

- internal query optimization
- validator refinement
- compare-result improvement
- builder UI improvement
- read-model implementation cleanup

### `CONTRACT_AWARE`

Required when:

- adapter method signature changes
- DTO meaning changes
- manifest required fields change
- capability keys are renamed or removed
- API request/response semantics change

Typical result:

- create a new versioned contract line
- keep the previous line available during migration

Do not ship these as silent patch-level changes.

## Adapter Contract Rule

For project-facing contracts, prefer versioned stability over aggressive cleanup.

Use this rule:

- keep `v1` adapter contract alive while the common core continues to improve
- if a truly breaking change is needed, publish `v2`
- migrate projects deliberately instead of forcing all projects to rewrite adapters at once

Good candidates for stable contracts:

- menu catalog ports
- command page ports
- authority contract ports
- runtime compare ports
- read-model ports
- core DTOs used by those ports

## Capability Key Rule

Capability keys are part of the stable boundary.

Examples:

- `member.save`
- `member.approve`
- `member.reject`
- `member.password-reset`
- `member.id-duplicate-check`

Do not rename these casually.

If replacement is needed:

1. add the new key
2. mark the old key deprecated
3. support both during the migration window
4. remove the old key only after compatibility review

## Installable Package Rule

Installable API, theme, screen, and business-process packages must also follow stable-boundary governance.

Required package metadata:

- package version
- required adapter contract version
- required manifest contract version
- required capability set
- compatibility result
- rollback profile

Projects should be able to install a newer package version without rewriting stable adapters in the normal case.

If adapter rewrites are required, the package upgrade should be treated as a contract-aware upgrade and blocked until explicitly approved.

## AI Agent Safety Rule

AI agents may change common-core code frequently.

They must not treat project adapters as disposable implementation detail.

Before changing common code that crosses project boundaries, require review of:

- adapter contract impact
- DTO contract impact
- manifest impact
- capability-key impact
- project migration burden

Preferred order:

1. improve internals first
2. preserve stable contract if possible
3. add new versioned contract only when truly necessary
4. keep migration overlap for old contract lines

## Recommended Repository Use

Use this document together with:

- `docs/architecture/platform-common-module-versioning.md`
- `docs/architecture/common-project-reversible-transition-rules.md`
- `docs/architecture/system-builder-project-domain-install-target.md`
- `docs/architecture/member-domain-install-package-model.md`

This rule should guide:

- common jar extraction
- installable API versioning
- project adapter skeleton generation
- package compatibility checks
- AI-agent-driven common-core updates
- adapter change recording in project/version governance

See also:

- `docs/architecture/artifact-registry-and-project-version-governance.md`

## Practical Conclusion

The repository should move toward:

- common core that can change often
- adapter surfaces that change rarely
- project executors that remain project-owned
- versioned contracts whenever the stable boundary must move

The normal project-upgrade expectation should be:

- update common jars
- keep adapter code unchanged
- keep project business code unchanged unless business behavior itself changed

not:

- rewrite project adapter code after every common-core improvement
