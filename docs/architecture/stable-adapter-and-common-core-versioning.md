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
- execution gate contract
- core DTO contract
- manifest contract
- capability-key contract

These should change much more slowly than the internal common implementation.

Use this split:

1. `STABLE_ADAPTER_SURFACE`
2. `STABLE_EXECUTION_GATE`
3. `VERSIONED_COMMON_CORE`
4. `PROJECT_EXECUTOR`

## Gate-Only Execution Rule

Projects and operations consoles should execute common behavior only through a stable common-owned gate.

Do not treat internal common services as a public execution surface.

Required rule:

- `project-runtime -> stable execution gate -> common-core internals`
- `operations-console -> stable execution gate -> common-core internals`
- common-core internals may change behind that gate
- project code must not bypass the gate to call version-sensitive internals directly

If a project or operations page can still call internal common services directly, the boundary is not stable enough for low-touch framework upgrades.

The same rule also applies to independent runtime packaging:

- separate project-runtime and operations-console boot later only if both already execute common behavior through the same stable gate family
- do not try to split boot paths while direct common-internal calls still exist in controllers or runtime services

## Stable Adapter Rule

Project adapters should be treated as the low-churn boundary that survives frequent common-core updates.

Project adapters may:

- import common ports
- import common DTO contracts
- import stable execution gates
- bind project menu, route, authority, DB, and API sources
- translate project payloads into common-owned descriptors
- expose project executor capability implementations

Project adapters should not:

- absorb growing business logic
- duplicate common validation or compare logic
- become alternate execution paths around the stable gate
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
- stable execution gates
- stable DTO meaning
- stable manifest semantics
- stable capability keys

## Versioning Rule

Every common line that may affect projects should be versioned explicitly.

Track at minimum:

- `commonCoreVersion`
- `executionGateVersion`
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

- execution gates for bootstrap, command execution, runtime lookup, and operations actions
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
- required execution gate version
- required adapter contract version
- required manifest contract version
- required capability set
- compatibility result
- rollback profile

Projects should be able to install a newer package version without rewriting stable adapters in the normal case.

If adapter rewrites are required, the package upgrade should be treated as a contract-aware upgrade and blocked until explicitly approved.

## Separate Runtime Package Rule

If the roadmap includes:

- thin new-project creation
- separate project runtime boot
- separate operations-console boot

then package outputs must be separated as well.

Required direction:

- `project-runtime` builds its own runnable artifact
- `operations-console` builds its own runnable artifact
- shared common artifacts remain reusable jars, not copied runtime sources
- startup scripts and runtime paths must target those different artifacts explicitly

Do not leave one forever-mixed runnable jar and still claim the repository is ready for independent runtime operation.

## AI Agent Safety Rule

AI agents may change common-core code frequently.

They must not treat project adapters as disposable implementation detail.

Before changing common code that crosses project boundaries, require review of:

- execution-gate impact
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
- `docs/architecture/fleet-common-upgrade-operating-model.md`

## Practical Conclusion

The repository should move toward:

- common core that can change often
- execution gates that change rarely
- adapter surfaces that change rarely
- project executors that remain project-owned
- versioned contracts whenever the stable boundary must move

The normal project-upgrade expectation should be:

- update common jars
- keep execution gate usage unchanged
- keep adapter code unchanged
- keep project business code unchanged unless business behavior itself changed

not:

- let projects call changed common internals directly
- rewrite project adapter code after every common-core improvement

For many-project maintenance, use the fleet operating model:

- common-core patch/minor updates should create compatibility candidates for every project
- passing projects can move through ring rollout
- failing projects should create adapter-fix tickets instead of blocking all projects
- no common update should be considered fleet-safe until artifact locks, compatibility results, and rollback anchors are recorded
