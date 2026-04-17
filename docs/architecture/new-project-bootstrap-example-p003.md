# New Project Bootstrap Example `P003`

This is the first concrete example of the thin-project split in the repository.

## Module Pair

- [projects/p003-adapter](/opt/projects/carbonet/projects/p003-adapter/pom.xml)
- [projects/p003-runtime](/opt/projects/carbonet/projects/p003-runtime/pom.xml)

## Runtime Manifest

- [projects/p003-runtime/config/manifest.json](/opt/projects/carbonet/projects/p003-runtime/config/manifest.json:1)

## Ownership

`COMMON_RUNTIME`

- reusable Carbonet jars under `modules/`
- `stable-execution-gate`
- `apps/project-runtime`

`PROJECT_ADAPTER`

- `projects/p003-adapter`

`PROJECT_RUNTIME`

- `projects/p003-runtime`
- `var/run/project-runtime/P003/*`

## DB Split

`COMMON_DB`

- central metadata and release governance

`PROJECT_DB`

- P003 runtime business data

`BINDING_LAYER`

- which common menus, themes, and adapter versions are active for P003

## Why This Matters

This example proves the intended reuse shape:

- common version upgrades stay in common jars
- project-specific delta stays in the adapter/runtime pair
- adding a new project does not require copying the entire Carbonet source tree

## Central Routing Example

`P003` can be shown from one central management screen because its manifest now
includes routing metadata:

- selector path: `/projects/P003`
- route prefix: `/r/P003`
- external base URL: `https://p003.example.com`

This allows:

- central project selection from one operations screen
- path-based reverse proxy routing
- domain-based outside access later without changing the common runtime shape
