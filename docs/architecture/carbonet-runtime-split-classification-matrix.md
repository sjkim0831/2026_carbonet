# Carbonet Runtime Split Classification Matrix

Generated on 2026-04-14 for first-phase Carbonet runtime separation.

## Goal

Define the first practical split target for the current Carbonet codebase so the team can:

- split project runtime first
- keep common runtime reusable as jars and bundles
- continue adding project screens during the transition
- keep future project creation possible
- avoid deepening DB coupling before common runtime expansion

This document is the first working matrix for:

- `COMMON_RUNTIME`
- `PROJECT_RUNTIME`
- `PROJECT_ADAPTER`
- `CONTROL_PLANE_LATER`

and:

- `COMMON_DB`
- `PROJECT_DB`
- `BINDING_LAYER`

## Classification Rule

Use this decision order:

1. if the asset is needed by many projects with the same runtime meaning, classify it as `COMMON_RUNTIME`
2. if the asset contains project business rules or project-owned data semantics, classify it as `PROJECT_RUNTIME`
3. if the asset translates common contracts into project-local rules, classify it as `PROJECT_ADAPTER`
4. if the asset is mainly for central operations or builder governance and can move later, classify it as `CONTROL_PLANE_LATER`

## Current Route Family Classification

### `APP_ENTRY`

Source:

- `frontend/src/app/routes/families/appOwnedFamily.ts`

Recommended split:

- admin login shell and entry guard framework -> `COMMON_RUNTIME`
- public/login entry pages with reusable auth/session meaning -> `COMMON_RUNTIME`
- project-specific home landing binding and localized entry choices -> `PROJECT_ADAPTER`
- project-specific landing content and home runtime composition -> `PROJECT_RUNTIME`

Reason:

- auth and entry framework is reusable
- actual landing behavior and project exposure differ by project

### `ADMIN_SYSTEM`

Source:

- `frontend/src/app/routes/families/adminSystemFamily.ts`

Recommended split:

- system code, menu, page, feature, full-stack, screen-flow, screen-menu-assignment, new-page runtime framework -> `COMMON_RUNTIME`
- infra, backup, restore, scheduler, batch, external monitoring governance, security governance, performance governance -> `CONTROL_PLANE_LATER`
- route and menu exposure per project -> `PROJECT_ADAPTER`

Reason:

- framework-style registry and systemization behavior belongs in reusable runtime
- heavy operator governance is central-console material and can move later

### `ADMIN_MEMBER`

Source:

- `frontend/src/app/routes/families/adminMemberFamily.ts`

Recommended split:

- authority framework, admin-account shell behavior, common member-management runtime patterns -> `COMMON_RUNTIME`
- project-specific company/member approval rules, project-local user scope rules, project-local account behavior -> `PROJECT_RUNTIME`
- institution scope mapping, project authority narrowing, route/menu binding, project approval bridge -> `PROJECT_ADAPTER`

Reason:

- member admin UI patterns are reusable
- actual member approval and organization semantics vary per project

### `CONTENT_SUPPORT`

Source:

- `frontend/src/app/routes/families/contentSupportFamily.ts`

Recommended split:

- reusable board/banner/popup/file/tag/FAQ runtime framework -> `COMMON_RUNTIME`
- project-specific content publication rules, project-local moderation, project content records -> `PROJECT_RUNTIME`
- project menu exposure, theme binding, content authority narrowing -> `PROJECT_ADAPTER`
- global sitemap, content governance console, placeholder governance -> `CONTROL_PLANE_LATER` when it is purely central-console oriented

Reason:

- the screen family is reusable
- content data and publication behavior are usually project-owned

### `EMISSION_MONITORING`

Source:

- `frontend/src/app/routes/families/emissionMonitoringFamily.ts`

Recommended split:

- emission screen runtime framework, page-family shell, common monitoring rendering helpers, manifest/runtime structure -> `COMMON_RUNTIME`
- emission save/calculate/approval logic, project monitoring data, project emission workflows, certificate business actions -> `PROJECT_RUNTIME`
- calculation executor bridge, authority narrowing, external endpoint selection, project DB mapping -> `PROJECT_ADAPTER`
- fleet-wide observability or central emission-ops governance surfaces -> `CONTROL_PLANE_LATER`

Reason:

- UI/runtime pattern is reusable
- the actual business engine and data are project-owned

### `TRADE_PAYMENT`

Source:

- `frontend/src/app/routes/families/tradePaymentFamily.ts`

Recommended split:

- payment gateway framework, payment UI/runtime contracts, trade/certificate shell behavior, common settlement framework pieces -> `COMMON_RUNTIME`
- order, settlement, refund, trade-state, certificate business rules and persistence -> `PROJECT_RUNTIME`
- PG configuration binding, order-state translation, project-local approval bridge, project DB mapping -> `PROJECT_ADAPTER`

Reason:

- payment framework can be common
- trade and settlement meaning stay project-owned

### `HOME_EXPERIENCE`

Source:

- `frontend/src/app/routes/families/homeExperienceFamily.ts`

Recommended split:

- reusable public/member shell, education/join/mypage runtime framework, shared layout and manifest structure -> `COMMON_RUNTIME`
- project-specific content, learning workflows, member business pages, localized runtime data -> `PROJECT_RUNTIME`
- project route binding, project authority narrowing, theme and home exposure binding -> `PROJECT_ADAPTER`

Reason:

- page-family runtime can be shared
- actual project-facing business flows are project-owned

## Current Admin Menu Grouping Recommendation

Use this near-term grouping for current admin menus:

### `COMMON_RUNTIME_FIRST`

- page management
- feature management
- menu management
- full-stack management
- screen-flow management
- screen-menu assignment
- new-page
- reusable auth/session/authority runtime surfaces
- reusable content runtime surfaces
- reusable payment/auth/runtime framework surfaces

### `PROJECT_RUNTIME_FIRST`

- emission save/calculate/approval business screens
- trade/payment/certificate business screens
- project member/company/business account screens
- project content publication screens
- project monitoring/business dashboards

### `PROJECT_ADAPTER_REQUIRED`

- project-specific authority narrowing
- project menu exposure
- project route activation
- project DB mapping
- project external endpoint selection
- project payment/provider binding
- project calculation executor binding

### `CONTROL_PLANE_LATER`

- infra
- scheduler
- batch
- backup and restore
- system security governance
- global observability and performance governance
- fleet deployment and upgrade governance
- builder/operator-only consoles

## First DB Ownership Matrix

### `COMMON_DB`

Keep here first:

- authentication metadata
- admin accounts
- authority groups and permission metadata
- menu, page, feature, and manifest registry
- route family registry metadata
- screen/theme/component/builder definitions
- artifact registry metadata
- version governance metadata
- compatibility matrix metadata
- project registry
- central audit and trace metadata
- common code dictionaries that are not project-local business data

### `PROJECT_DB`

Keep here first:

- emission business data
- trade, settlement, refund, and certificate business data
- project content records
- project approval results
- project workflow states
- project-local file and upload records
- project statistics and domain reports
- project-local scheduler/job state when it is runtime-owned
- project-local user-entered operational records

### `BINDING_LAYER`

Keep here first:

- project-to-menu exposure rows
- project-to-route activation rows
- project-to-theme attachment rows
- project-to-common-artifact version selection rows
- project adapter activation rows
- project-specific authority override rows
- project external endpoint selection rows

## What Must Move Before Common Runtime Expansion

Before expanding the common runtime with many standard modules, move or isolate these first:

1. project business services that directly use project tables
2. project approval and calculation executors
3. project payment/order state semantics
4. project member/company-specific organization rules
5. project-local content publication rules
6. project-local external integration endpoint logic

If those remain inside common candidates, common runtime growth will become expensive to unwind.

## Immediate Starter Structure

Use this first separation map:

```text
/modules
  /common-core
  /common-auth
  /common-admin-runtime
  /common-builder-runtime
  /common-payment
  /common-content-runtime

/projects
  /carbonet-runtime
  /carbonet-adapter
  /project-template-runtime
  /project-template-adapter

/apps
  /runtime-assembly
  /control-plane
```

## First Closeout Criteria

The first phase is good enough to proceed when:

1. every route family has an assigned target lane
2. every major business table family is assigned to `COMMON_DB`, `PROJECT_DB`, or `BINDING_LAYER`
3. project business services are no longer treated as common-runtime candidates by default
4. project creation can be described as `template runtime + template adapter + project config`
5. project deployment can describe which common artifact line and adapter line are selected

## Practical Conclusion

For Carbonet right now:

- split `ADMIN_SYSTEM` into reusable runtime and later control-plane lanes
- split `ADMIN_MEMBER`, `EMISSION_MONITORING`, `TRADE_PAYMENT`, and most business-facing content into project runtime plus adapter lanes
- keep reusable route families, manifests, auth, runtime shells, and builder runtime support in common runtime
- lock DB ownership before adding many more common modules

Use `docs/architecture/carbonet-backend-and-db-split-starter-matrix.md` as the next-level starter map when code movement must go below route-family classification into package, service, mapper, and table-family decisions.
