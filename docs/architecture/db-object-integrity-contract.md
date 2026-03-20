# DB Object Integrity Contract

Generated on 2026-03-21 for the Resonance build-first data integrity track.

## Goal

Define the minimum integrity and performance contract that every scaffolded DB object must satisfy before it can be published through Resonance.

This contract applies to:

- project-owned business tables
- common control-plane tables
- scaffold-generated relation tables
- summary, snapshot, and archive tables
- scaffold-generated indexes and constraints
- scaffold-generated DDL and migration SQL
- scaffold-generated data patch SQL
- scaffold-generated rollback SQL

## Compliance Position

Generated DB objects should be easy to review against:

- eGovFrame-oriented backend and persistence conventions already used in Carbonet
- Korean public-sector style naming, comment, audit, and documentation expectations
- NIS-sensitive review requirements around traceability, masking, least privilege, integrity, and operational visibility

Resonance should generate DB outputs in a form that is:

- reviewable through GUI governance screens
- traceable back to scenario and actor policy
- exportable as structured review evidence
- consistent with approved project naming and metadata rules
- publishable as SQL documents before runtime execution

## Core Rule

Every generated DB object must be:

- ownership-bound
- key-defined
- relationship-defined
- query-reviewed
- rollback-aware
- release-unit-bound

Do not allow schema generation that produces tables or queries without explicit integrity intent.

## Required Object Families

Resonance should distinguish at least these object families:

- `MASTER_TABLE`
- `TRANSACTION_TABLE`
- `RELATION_TABLE`
- `SNAPSHOT_TABLE`
- `SUMMARY_TABLE`
- `ARCHIVE_TABLE`
- `QUEUE_TABLE`
- `AUDIT_TABLE`
- `FILE_METADATA_TABLE`

## Required Key Contract

Every generated table must declare:

- `tableId`
- `tableName`
- `objectFamily`
- `ownerScope`
- `projectId`
- `scenarioFamilyId`
- `pkPolicy`
- `softDeleteYn`
- `auditColumnPolicy`
- `classificationScopeYn`
- `expectedQueryShapeSet`
- `namingProfileId`
- `commentPolicyId`

## Table And Column Naming Rule

Generated tables and columns must follow one approved project naming profile.

Use this rule:

- keep physical DB identifiers in one consistent style per project
- keep logical name, physical name, and screen label separately governed
- avoid ad hoc abbreviations unless approved in the project naming dictionary
- generate table and column comments whenever the selected DB standard profile requires them
- keep naming rules compatible with eGovFrame-style mapper and query maintenance

Do not publish:

- mixed naming conventions inside one project
- physical names with no governed logical-name mapping
- governed objects with missing comment metadata when comments are required by the selected profile

### PK policy

Every table must define one explicit PK policy:

- `SURROGATE_SINGLE`
- `BUSINESS_SINGLE`
- `COMPOSITE`

Use this rule:

- do not publish a generated table without PK intent
- if a business key is not stable, use a surrogate PK and separate unique key
- composite PK use must be explicit and justified by query shape or ownership model

## FK Contract

Every governed relationship must declare:

- `fkName`
- `sourceTable`
- `sourceColumns`
- `targetTable`
- `targetColumns`
- `relationshipType`
- `deletePolicy`
- `updatePolicy`
- `blockerPolicy`

Recommended `relationshipType` values:

- `ONE_TO_ONE`
- `ONE_TO_MANY`
- `MANY_TO_ONE`
- `MANY_TO_MANY`

Recommended `deletePolicy` values:

- `RESTRICT`
- `CASCADE`
- `SOFT_BLOCK`
- `ARCHIVE_THEN_DELETE`

Use this rule:

- FK intent must be generated with the table, not retrofitted later
- delete or detach flows should reference FK blocker policy
- archive and retention policy should stay consistent with FK delete policy

## Unique And Nullability Contract

Every scaffolded column set that carries business uniqueness must declare:

- `uniqueConstraintName`
- `columnSet`
- `businessReason`

Every column must also declare nullability intent:

- `REQUIRED`
- `OPTIONAL`
- `DERIVED`
- `SYSTEM_FILLED`

Use this rule:

- duplicate prevention should not depend only on application code
- not-null and unique rules should reflect scenario and validation contracts

## Standard Governance Columns

Unless explicitly exempted, generated business tables should standardize these column families:

- primary identifier
- version or optimistic-lock column when update concurrency matters
- create timestamp
- create actor
- update timestamp
- update actor
- soft-delete flag or archive state when lifecycle requires it
- project or tenant discriminator when shared storage is possible
- classification scope columns when actor/member classification rules apply
- table and column comment metadata when supported by the target DB standard

## Index Contract

Every table must declare index intent for expected query shapes.

### Required query-shape metadata

Each generated screen or API that touches a table should declare:

- default search filters
- sort columns
- join columns
- detail lookup columns
- export filters
- approval or status filters

### Minimum index review

Before publish, verify:

- list-screen search filters are backed by reviewed indexes
- default grid sort does not force avoidable full scans
- detail lookup uses PK or stable unique path
- approval and status queues have indexed filter paths
- export paths do not bypass the same indexed predicates used by list screens

Use this rule:

- no search-heavy feature should be published without index review
- one screen generating one or more query shapes must carry index expectations into DB scaffolding

## Summary And Snapshot Rule

For high-volume dashboards, analytics, or repeated aggregate queries, Resonance should prefer governed summary or snapshot tables instead of repeatedly forcing heavy live aggregation.

Use this rule:

- keep transactional truth in base tables
- allow summary or snapshot tables when query heat justifies it
- bind summary refresh jobs to retention, cron, and release-unit governance

## DB Scaffold Checklist

Every generated DB bundle should answer all of these:

1. what table family is this
2. what project and scenario family own it
3. what is the PK policy
4. what FKs and delete blockers exist
5. what unique constraints are required
6. what nullability rules apply
7. what search, sort, detail, and export query shapes exist
8. what indexes support those shapes
9. what audit, soft-delete, version, and classification columns are required
10. what release unit and rollback plan bind the object

## SQL Draft And Update Rule

Resonance should produce governed SQL documents when schema or seed data changes are required.

Required SQL document families:

- `db-ddl-draft.sql`
- `db-migration-draft.sql`
- `db-data-patch-draft.sql`
- `db-rollback-draft.sql`

Allowed SQL actions:

- create table
- alter table add column
- alter table modify column
- add or drop index
- add or adjust constraints
- update governed seed or reference data
- archive and rollback support statements

Use this rule:

- do not apply schema change directly from the builder without a governed SQL draft
- every SQL draft must identify affected table, affected columns, expected data impact, rollback strategy, and release-unit binding
- existing tables and columns may be updated only through governed migration and rollback drafts
- data updates required for feature activation must be published as reviewable data patch SQL, not hidden inside application startup code

Required SQL draft review metadata:

- `affectedTableSet`
- `affectedColumnSet`
- `dataImpactLevel`
- `backfillRequiredYn`
- `rollbackDraftId`
- `releaseUnitId`
- `reviewState`

## Publish Blockers

Do not publish when:

- PK policy is missing
- governed FK intent is missing
- duplicate-prone business columns have no unique review
- search-heavy query shapes have no index review
- export path bypasses classification or key predicates
- rollback path for schema change is undefined
- table or column naming violates the selected naming profile
- required table or column comments are missing

## Non-Goals

This contract does not replace:

- project-specific physical tuning
- DB-engine-specific optimizer hints
- runtime query metrics dashboards

It provides the minimum structural integrity gate before those later optimizations.
