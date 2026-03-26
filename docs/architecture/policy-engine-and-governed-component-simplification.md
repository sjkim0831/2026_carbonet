# Carbonet Policy Engine and Governed Component Simplification

Generated on 2026-03-26 for the current Carbonet repository.

## 1. Goal

Carbonet should simplify page logic, permission logic, list filtering, and diagnostic logging by moving repeated screen-specific condition checks into one governed policy model.

The target is not "more roles". The target is one reusable decision path for:

- who is acting
- which page is open
- which component is rendering
- which target or list is being touched
- which action is being attempted
- which company, department, type, and state constraints apply

## 1.1 Role layering

Carbonet should not rely on only 8 roles forever.

The recommended role model is four layers:

1. `base role`
   - the 8 identity roles
   - member or admin x member type 4
2. `general role`
   - cross-type shared additional business capability
3. `department role`
   - company-internal department capability
4. `user override`
   - per-user exception add or remove

The 8 base roles stay useful, but only as the baseline layer.
They should not be the only source of truth for all page and function behavior.

## 2. Why the current model becomes complex

Current complexity comes from repeating the same decisions in many screens:

- actor role and member type checks
- current company and target company matching
- list scope filtering
- combo and popup option filtering
- button visible, disabled, readonly rules
- save, delete, approve, and export eligibility
- audit and trace payload shape

Even when SQL looks short, the overall system is still complex if every page rebuilds these rules independently.

## 3. Simplification principle

Use one common policy evaluation model everywhere:

```text
decision = evaluate(actor, page, component, target, action, context)
```

Where:

- `actor` is the logged-in user
- `page` is the current screen identity
- `component` is the governed UI element identity
- `target` is the single object or list resource being accessed
- `action` is `VIEW`, `SEARCH`, `CREATE`, `UPDATE`, `DELETE`, `EXECUTE`, `APPROVE`, `EXPORT`
- `context` contains search filters, state, and interaction state

This makes the page thinner because the page stops deciding policy by itself.

## 4. Minimal common model

### 4.1 Actor

Actor must always contain:

- `userId`
- `actualUserId`
- `userKind`
  - `ADMIN`
  - `MEMBER`
  - `ANONYMOUS`
- `memberType`
  - `E`
  - `P`
  - `C`
  - `G`
- `authorCode`
- `insttId`
- `deptId`
- `master`
- `authenticated`
- `baseRoleCodes`
- `generalRoleCodes`
- `departmentRoleCodes`
- `userOverrideFeatureCodes`

### 4.2 Page

Page must always contain:

- `pageId`
- `menuCode`
- `routePath`
- `domainCode`
  - `admin`
  - `home`
- `pageType`
  - `LIST`
  - `DETAIL`
  - `EDIT`
  - `CREATE`
  - `APPROVE`
  - `WORKSPACE`

### 4.3 Component

Every governed component must contain:

- `componentId`
- `instanceKey`
- `componentType`
  - `LIST`
  - `FORM_FIELD`
  - `COMBO`
  - `POPUP`
  - `TAB`
  - `ACTION_BAR`
  - `BUTTON`
  - `SUMMARY`
- `policyKey`
- `dataSourceKey`
- `designVariantId`
- `helpId`

And for scope-sensitive components, the manifest should also declare:

- `allowAllScope`
  - whether the component may ever return all-company results
- `requireActorInsttId`
  - whether a non-master actor must have a company before the component can run
- `allowedActorKinds`
  - `ADMIN`, `MEMBER`, `ANONYMOUS`
- `allowedMemberTypes`
  - `E`, `P`, `C`, `G`
- `enforceOwnCompanyScope`
  - whether non-master users are always forced to their own `insttId`
- `enforceTargetCompanyMatch`
  - whether the target object's company must match the actor company
- `restrictTargetCompanyOutput`
  - whether the component may only render rows or items from the resolved company scope

If `allowAllScope` is absent or false, the default rule should be:

- master may use global scope
- non-master must use own-company scope
- if the non-master actor has no `insttId`, the component must not run

This keeps "ALL" as an explicit exception instead of the accidental default.

### 4.4 Target

Target must express both single-object and list-object situations:

- `targetType`
  - `SELF`
  - `MEMBER`
  - `ADMIN_ACCOUNT`
  - `COMPANY`
  - `DEPARTMENT`
  - `ROLE`
  - `COMMON_CODE`
  - `LIST`
- `cardinality`
  - `SINGLE`
  - `MULTI`
- `targetId`
- `targetInsttId`
- `targetDeptId`
- `targetMemberType`
- `targetState`

### 4.5 Context

Context must hold runtime filters:

- `requestedInsttId`
- `requestedDeptId`
- `requestedMemberType`
- `requestedStatus`
- `searchKeyword`
- `selectedIds`
- `queryParams`

## 5. Decision result

The policy engine should return one normalized decision:

- `allowed`
- `visibility`
  - `VISIBLE`
  - `HIDDEN`
- `interaction`
  - `ENABLED`
  - `DISABLED`
  - `READONLY`
- `scope`
  - `GLOBAL`
  - `OWN_COMPANY`
  - `OWN_DEPT`
  - `SELF`
  - `TARGET_COMPANY_MATCH`
- `resolvedInsttId`
- `resolvedDeptId`
- `resolvedMemberTypes`
- `requiredFeatureCodes`
- `reasonCodes`

This single result should drive:

- page access
- component rendering
- list filtering
- action enablement
- backend save validation
- audit and trace events

For list, combo, popup, and lookup components, the safe default is:

- no `ALL`
- own-company scope
- allowed member types explicitly declared when type matters
- target company match enforced when the component edits or reveals target-owned data

## 5.1 Why this is enough for many pages

If Carbonet keeps:

- one actor model
- one target model
- one action model
- one scope model
- one layered role model

then new pages mostly consume the same governed selectors and governed actions.

That means adding many pages does not require redesigning the entire authority system each time.

However, it does not mean authority logic will never need changes again.
It means the architecture should absorb most new pages without forcing another authority redesign.

## 6. How this simplifies pages

Pages become simpler because they stop combining raw authority, company, target, and state checks directly.

Instead of page-local logic like:

- check role
- check member type
- check current company
- check target company
- build custom query
- decide whether to disable the button

the page uses:

- `resolvePagePolicy(...)`
- `resolveComponentPolicy(...)`
- `buildScopedListQuery(...)`
- `canExecuteAction(...)`

This removes duplicated conditional branches from each page.

## 7. How this simplifies logs and events

Logs also become simpler because the same decision result can be attached everywhere.

Every governed event can share:

- actor snapshot
- page id
- component id
- target type
- target company
- action type
- scope decision
- allowed or denied
- reason codes

This avoids each page inventing different log payloads.

## 8. How this simplifies SQL

This does not automatically make every SQL statement shorter.
It makes SQL more reliable by standardizing predicates.

Recommended split:

- policy engine computes scope and target constraints
- mapper XML applies normalized predicates

Use reusable SQL fragments for:

- company scope predicate
- department scope predicate
- member type predicate
- state predicate

This reduces drift across pages.

Role layering helps SQL stay predictable:

- base role drives broad page eligibility
- general role adds shared features
- department role narrows company-internal work
- override adjusts exceptions

SQL should not resolve every role branch manually.
Instead, policy should precompute scope and required feature sets before query execution.

## 9. Governed component rule

Not every visual element needs policy metadata.

Policy-governed component scope should include:

- lists
- combo boxes
- popups
- search forms
- action buttons
- approval controls
- file upload and delete controls
- status-changing widgets

Pure layout wrappers should not carry separate policy entries.

## 10. Data loading rule

Governed components must never load unrestricted data directly.

They should always use a governed selector such as:

- `selectVisibleCompanies`
- `selectVisibleMembers`
- `selectGrantableRoles`
- `selectDepartmentRoles`
- `selectVisibleCommonCodes`

This is the key to keeping combo boxes and popups constrained by actor, target, and company ownership.

## 11. Design system alignment

The same governance path should also own design consistency.

Each governed component should carry:

- `designVariantId`
- `designTokenVersion`
- `density`
- `statusVariant`

That allows Carbonet to manage:

- permission
- data scope
- design consistency
- help anchors
- observability

from the same registry.

## 12. Common code alignment

Common code usage should also be bound to governed components.

Each governed component that depends on common codes should register:

- `codeGroupId`
- `codeUsageMode`
  - `LABEL_ONLY`
  - `FILTER_OPTION`
  - `STATE_TRANSITION`
  - `FORM_VALUE`
- `allowedValueConstraint`

That allows the platform to detect:

- missing code groups
- values no longer used
- pages missing required values
- invalid UI combinations

## 13. Recommended rollout

### Phase 1. Define the common model

- backend actor, page, target, decision interfaces
- frontend actor, page, component, target, decision interfaces
- layered role metadata

### Phase 2. Govern the highest-risk UI first

- role combo boxes
- company search popups
- admin/member selection lists
- approval action bars

### Phase 3. Standardize governed selectors

- move list and combo filtering into shared selector helpers

### Phase 4. Connect logs and diagnostics

- all governed decisions emit trace and audit metadata

### Phase 5. Connect design and code dependencies

- component design metadata
- common code dependency metadata
- help anchor coverage

## 14. Non-goals

This model should not:

- turn every visual div into a separate permission row
- replace every page with a no-code schema immediately
- force one SQL generator for every query

The goal is simplification by centralizing policy decisions, not by inventing a heavier runtime.

## 15. Immediate repository step

The minimum implementation step for this repository is:

1. Add shared frontend policy context and decision types.
2. Add shared backend policy context and decision types.
3. Start routing risk-sensitive screens through governed selectors before rewriting the entire UI builder.
