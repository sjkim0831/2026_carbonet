# Authority Scope Application Checklist

## Goal

Turn authority scope from an abstract policy into a page-by-page implementation checklist.

Use this document together with:

- `docs/architecture/actor-authority-generation-contracts.md`
- `docs/architecture/page-systemization-minimum-contract.md`

## Required Application Points

Authority scope is only considered applied when it appears consistently across all of the following.

### 1. Menu And Entry

- menu visibility rule exists
- page entry guard exists
- localized route entry follows the same policy

### 2. Page-Level Runtime

- page bootstrap respects actor and data scope
- list/detail payload respects actor and data scope
- empty, denied, and blocked states are explicit

### 3. Component And Button Actions

- button visibility rule exists
- disabled reason exists where relevant
- backend execution rule matches frontend visibility rule
- sensitive actions trigger audit when denied or executed

### 4. Query And Export

- list query scope is explicit
- row detail query scope is explicit
- export and download scope is explicit
- popup selector scope is explicit

### 5. Mutation And Approval

- save/update/delete scope is explicit
- approve/reject/execute scope is explicit
- approval-authority requirement is explicit where relevant

### 6. Audit And Trace

- audit records identify actor family
- trace records identify page or page family
- deny and allow paths can both be interpreted from evidence

## Not Applied

Authority scope is not fully applied when any of these remain true:

- frontend hides an action but backend still executes it
- backend blocks an action but UI has no governed denied state
- data scope exists only in service code and not in page metadata
- exports, downloads, or popup selectors bypass the same scope family

## Closeout Sentence

Use this sentence when ready:

`CLOSED: authority scope is consistently applied for <pageId>; menu, entry, query, action, approval, audit, and trace surfaces follow the same governed policy.`
