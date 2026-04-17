# Project Runtime Independent Boot And Package Rule

Generated on 2026-04-16 for Carbonet common/project split continuation.

## Goal

Define the rule for reaching this end state safely:

- common-core upgrades remain low-touch for projects
- new projects can be added from thin project packages
- project runtime and operations-console can be built and booted separately
- package/runtime governance can later be managed from a screen without making the screen itself the core dependency

## Short Answer

Yes, this is feasible.

But only if the split is done in this order:

1. stable execution gate
2. thin adapter boundary
3. separate package outputs
4. separate runtime boot paths
5. package and compatibility registry
6. management screen later

Do not start with the screen.
Start with the boundary and package model first.

## Required Architecture Rule

The stable execution line must be:

- `project-runtime -> stable-execution-gate -> common-core`
- `operations-console -> stable-execution-gate -> common-core`

Do not allow:

- `project-runtime -> common-core internals`
- `operations-console -> common-core internals`
- `project package -> copied common source`

## Independent Packaging Rule

If later independent boot is required, each runtime lane must own its own package output.

Minimum target lanes:

1. `modules/common-core`
2. `modules/stable-execution-gate`
3. `projects/project-adapter-impl`
4. `apps/project-runtime`
5. `apps/operations-console`

Minimum package rule:

- `common-core` publishes reusable versioned jars
- `stable-execution-gate` publishes reusable versioned contracts
- `project-adapter-impl` publishes project binding artifacts
- `project-runtime` builds its own runnable package
- `operations-console` builds its own runnable package

Do not keep one forever-mixed runnable jar if the goal is separate boot later.

## Separate Boot Rule

Later separate startup is realistic only when:

1. project runtime has its own datasource and config
2. operations-console has its own datasource and config, or clearly separated access to shared DB lanes
3. menus, routes, and bootstrap ownership are separated
4. startup scripts point to different packaged outputs
5. no runtime depends on shared root source slices at boot time

That means the future startup shape should look like:

- `var/run/project-runtime/<project-id>/project-runtime.jar`
- `var/run/operations-console/operations-console.jar`

and not:

- one shared `carbonet-18000.jar` for every lane forever

## New Project Add Rule

A future new project should be addable by:

1. choosing approved `common-core` and `stable-gate` versions
2. attaching a thin project adapter package
3. binding project DB/config/theme/menu values
4. generating or selecting a project runtime package
5. booting the project runtime independently

If a new project still requires source copy and large manual edits in common internals, the split is not complete enough.

## Management Screen Rule

Should there be a screen for this later?

Yes, probably.

But not first.

Build the management screen only after these exist:

1. package registry
2. version manifest
3. gate compatibility matrix
4. runtime package metadata
5. boot target metadata

Before that, a screen becomes decoration on top of unstable rules.

Recommended order:

1. docs and command workflow
2. package manifest and registry schema
3. build and boot path separation
4. validation and compatibility checks
5. management screen for operators

## Management Screen Scope Later

When the screen is eventually built, it should manage:

- installed `common-core` version by project
- installed `stable-gate` version by project
- adapter package version by project
- compatibility class by project
- project runtime package path
- operations-console package path
- boot command or startup profile
- upgrade candidate and rollback target

It should not be the only source of truth.
The registry and manifest must still exist underneath it.

## Build And Package Path Rule

Use different output paths once independent runtime packaging starts.

Target example:

- `apps/project-runtime/target/project-runtime.jar`
- `apps/operations-console/target/operations-console.jar`
- `var/run/project-runtime/<project-id>/project-runtime.jar`
- `var/run/operations-console/operations-console.jar`

Do not overwrite one runtime jar with another runtime lane's package.

## External Delivery Rule

Independent boot does not automatically mean project-only executable jars.

Current Carbonet rule:

- `apps/project-runtime/target/project-runtime.jar` is a common runtime assembly
- project identity is selected by `--app.project-id`
- project-specific logic should live in adapter/runtime source under
  `projects/<project>-*`

Therefore, external handoff should normally deliver:

1. common runtime binary
2. project adapter binary
3. sanitized config templates
4. project DB migration and approved data export
5. compatibility and boot guide

If the goal is project-only source handoff later, the repository must keep moving
business logic out of `modules/*` and into `projects/<project>-*` first.

## Prompt Templates

Use prompts like these when continuing the split.

### 1. Independent package path

```text
Carbonet에서 common-core / stable-execution-gate / project-adapter / project-runtime / operations-console 구조를 유지하면서
project-runtime 과 operations-console 이 각각 다른 target jar 와 다른 var/run 경로로 빌드/기동되도록
module, pom, startup script, packaging path 를 정리해줘.
공통 내부 direct call 은 금지하고 gate-only rule 로 유지해줘.
```

### 2. New project bootstrap

```text
Carbonet에서 신규 프로젝트를 thin project package 로 추가할 수 있도록
project-runtime skeleton, adapter binding point, config manifest, menu/theme/db binding 항목을 설계하고
공통 업그레이드가 project 코드 수정 없이 가능한 경계를 우선으로 정리해줘.
```

### 3. Package governance screen later

```text
Carbonet에서 project별 common-core 버전, gate 버전, adapter 버전, compatibility class,
runtime package path, boot target 을 관리하는 운영성 화면 초안을 만들어줘.
단, 먼저 registry/manifest/compatibility source of truth 를 정의하고
그 뒤에 화면은 그 위를 보는 구조로 설계해줘.
```

## Decision Rule

If the user asks:

- "can project and common be separated later?"
- "can each boot separately?"
- "can new projects be added quickly from packages?"

the correct answer is:

- yes, but only after package outputs, boot paths, registry, and DB ownership follow the gate split

Gate split is the entry condition.
It is not the final completion condition by itself.
