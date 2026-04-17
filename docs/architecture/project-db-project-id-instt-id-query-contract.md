# Project DB `PROJECT_ID` And `INSTT_ID` Query Contract

Generated on 2026-04-16 for split-project query safety.

## Goal

Prevent future project expansion from forcing repeated query rewrites when many
project runtimes share one structural pattern.

## Rule

For project-owned business tables, prefer these columns by default:

- `PROJECT_ID`
- `INSTT_ID` when institution/company scoping exists

Use these rules:

1. `PROJECT_ID` is the first ownership key.
2. `INSTT_ID` is the second scope key when institution/company filtering exists.
3. new list/detail/search queries should prefer:
   - `WHERE PROJECT_ID = ?`
   - `AND INSTT_ID = ?` when scoped
4. add a supporting index:
   - `(PROJECT_ID, INSTT_ID)`

## Applies To

- project business master tables
- project business detail tables
- project workflow and approval tables
- project-local settings and integration state
- project-owned observability copies or runtime-admin tables

## Does Not Apply By Default

Do not force this onto pure common-governance tables in `COMMON_DB` when
`PROJECT_ID` is not part of the ownership meaning.

## Starter SQL Pattern

```sql
CREATE TABLE PROJECT_SAMPLE_ENTITY (
    SAMPLE_ID VARCHAR(64) NOT NULL,
    PROJECT_ID VARCHAR(80) NOT NULL,
    INSTT_ID VARCHAR(60),
    SAMPLE_NAME VARCHAR(200) NOT NULL,
    CREATED_AT DATETIME NOT NULL,
    PRIMARY KEY (SAMPLE_ID)
);

CREATE INDEX IDX_PROJECT_SAMPLE_ENTITY_PROJECT_INSTT
    ON PROJECT_SAMPLE_ENTITY (PROJECT_ID, INSTT_ID);
```

## Search Contract

When a screen supports both project and institution scoping, the backend should
accept both:

- `projectId`
- `insttId`

and the query should treat them as explicit filters, not only keyword search
fragments.

## Transitional Application Rule

When legacy common tables are still reused by many projects, apply the same
contract at the repository boundary first:

- add `projectId` to shared search VO types
- default it from runtime context when the caller does not provide it
- push `PROJECT_ID = ?` into mapper conditions before adding more module-specific
  branches

This reduces repeated rewrites when many project modules are added later.

## Legacy File Table Rule

When a legacy attachment or evidence table still does not carry `PROJECT_ID`
directly, do not leave file lookups scoped only by `FILE_ID` or `INSTT_ID`.

Apply project ownership at query time by joining the parent ownership table, for
example:

- `COMTNINSTTFILE -> COMTNINSTTINFO.PROJECT_ID`
- `COMTNENTRPRSMBERFILE -> COMTNENTRPRSMBER.PROJECT_ID`

Use this only as a transitional rule. New project-owned file tables should still
store `PROJECT_ID` directly.
