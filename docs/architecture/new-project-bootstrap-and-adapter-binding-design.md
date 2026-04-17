# New Project Bootstrap and Adapter Binding Design

Generated on 2026-04-16 for Carbonet thin project packaging and rapid onboarding.

## Goal

Define the architecture for adding new projects without modifying the `common-core` source. This requires a clear boundary between the platform and the project-specific adapter.

## 1. Project Runtime Skeleton

A new project should not require a full repository. It only needs a **Release Unit** consisting of:

- `project-runtime.jar`: The pre-compiled execution engine.
- `adapter.jar`: The project-specific implementation of common ports.
- `manifest.json`: Configuration for DB, Menu, and Theme.

Repository starter assets now live under:

- `templates/skeletons/project-runtime-1.0.0/`
- `templates/screenbuilder-project-bootstrap/sample-project-adapter/`

### Skeleton Structure (Deployment View)
```text
var/run/project-runtime/<project-id>/
├── project-runtime.jar        (from apps/project-runtime)
├── lib/
│   └── project-adapter.jar    (project-specific adapter)
├── config/
│   ├── application-prod.yml
│   └── manifest.json          (Source of truth for this instance)
└── logs/
```

### Skeleton Structure (Repository Template View)
```text
templates/skeletons/project-runtime-1.0.0/
├── config/
│   ├── application-prod.yml
│   └── manifest.json
├── db/
│   ├── common-db-binding/
│   └── project-db/
├── lib/
└── scripts/
```

## 2. Adapter Binding Point

The `stable-execution-gate` and `screenbuilder-carbonet-adapter` provide the binding points.

### Required Binding Interfaces
A project must provide implementations for:
- `egovframework.com.common.adapter.ProjectExecutorPort`: Execution logic.
- `egovframework.com.common.adapter.ProjectMenuPort`: Custom menu mapping.
- `egovframework.com.common.adapter.ProjectAuthorityPort`: Custom permission logic.

### Binding Mechanism
- The `project-runtime` uses Spring's `@ConditionalOnProperty(name="app.project-id", ...)` or dynamic bean loading to bind the correct adapter at boot time.

## 3. Config Manifest (`manifest.json`)

Each project instance is governed by a manifest that binds common capabilities to project resources.

```json
{
  "projectId": "P001",
  "versions": {
    "commonCore": "1.1.0",
    "stableGate": "v1",
    "adapter": "1.0.0"
  },
  "bindings": {
    "database": {
      "bindingMode": "COMMON_DB + PROJECT_DB",
      "commonDb": {
        "url": "jdbc:postgresql://.../carbonet_common",
        "schema": "public"
      },
      "projectDb": {
        "url": "jdbc:postgresql://.../carbonet_p001",
        "schema": "p001_biz"
      }
    },
    "theme": {
      "id": "carbonet-dark",
      "designTokens": "v1"
    },
    "menu": {
      "profile": "standard-v1",
      "customItems": ["p001.special-report"]
    }
  }
}
```

## 4. Upgrade Boundary Rule

To ensure `common-core` upgrades don't require project code changes:

1. **Gate Stability**: Never change a `stable-execution-gate` method signature in a patch/minor update.
2. **DTO Compatibility**: Only add optional fields to common DTOs.
3. **Adapter Isolation**: The project adapter must only depend on `stable-execution-gate` and `carbonet-common-core` public APIs. It must never call `internals`.
4. **Version Manifest**: Every project must record its "last known good" version set to allow instant rollback.

## 5. Bootstrap Workflow

1. **Generate**: Copy `templates/skeletons/project-runtime-1.0.0/` as the starter runtime package.
2. **Bind**: Configure `config/manifest.json` with the project's `COMMON_DB`, `PROJECT_DB`, menu, theme, and runtime metadata.
3. **Attach**: Build the project adapter from `templates/screenbuilder-project-bootstrap/sample-project-adapter/` and place the jar into `lib/`.
4. **Migrate**: Apply `db/common-db-binding/*.sql` to `COMMON_DB` and `db/project-db/*.sql` to `PROJECT_DB`.
5. **Boot**: Run `scripts/start-project-runtime.sh <project-id>`.

## 6. Separation Rule For Reuse

To keep the same structure reusable across many projects:

- keep common metadata, version locks, menu/page registry, and rollout records in `COMMON_DB`
- keep project business tables, workflow state, and project-local integrations in `PROJECT_DB`
- keep project binding in `manifest.json` and the adapter jar
- do not fork `common-core` just to add a new project

If a new project still needs direct edits under common-core to boot, the split is
not yet strong enough.

## 7. External Handoff Rule

For external delivery or source handoff, do not treat `project-runtime.jar` as a
project-only artifact.

Current rule:

- `apps/project-runtime/target/project-runtime.jar` is the common runtime package
- `projects/<project>-adapter` is the project-owned binding artifact
- project-owned source should converge under `projects/<project>-*`
- server addresses, credentials, ports, and real filesystem paths must be removed
  from delivered config

Recommended handoff unit:

- `runtime/`
  - common runtime jar
- `adapter/`
  - project adapter jar
- `config-template/`
  - sanitized `manifest.json`
  - sanitized `application-prod.yml`
- `db/`
  - project schema and migration scripts
  - only the approved business data export
- `docs/`
  - install, boot, and compatibility guide

If source handoff is required, keep these ownership rules:

- common runtime source remains in `modules/*` and should be delivered as binary
  by default
- project-owned source should be isolated under `projects/<project>-adapter` and
  `projects/<project>-runtime`
- environment-specific values must not be committed into the project-owned source
  handoff set
