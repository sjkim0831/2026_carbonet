# Admin Menu Screen Decomposition Template

Use this document when a menu name is broad enough that one route does not guarantee one complete operator workflow.

This template is for planning admin work without missing:

- required sibling screens
- approval or review variants
- history and audit surfaces
- exception handling paths
- cross-screen entry and return paths
- common operator functions needed for real use

## Core Rule

Do not plan implementation as:

- one menu = one screen

Plan implementation as:

1. menu
2. business capability
3. operator workflow
4. screen set
5. common functions
6. completion loop

If a menu cannot support the full operator loop, it is not complete even if the main screen exists.

## Recommended Planning Order

1. confirm menu inventory
2. classify each menu by business purpose
3. decompose each menu into operator scenarios
4. derive the required screen set for each scenario
5. map cross-screen transitions
6. attach common features and governance requirements
7. order implementation by closed workflow, not by label order alone
8. verify no scenario is stranded without a reachable screen

## Menu Decomposition Sheet

Copy this block for each menu.

```md
### 1. Menu Overview

- Menu code:
- Menu name:
- Route:
- Parent menu:
- Domain:
- Primary actor:
- Secondary actor:
- Priority wave:

### 2. Menu Purpose

- One-line purpose:
- What operator problem does this menu solve:
- Why this menu exists separately from nearby menus:

### 3. Menu Type

Mark all that apply.

- Dashboard / command center
- List / search
- Detail / drilldown
- Create / register
- Edit / maintain
- Approval / review
- Execution / control
- History / audit
- Settings / policy
- Exception / incident
- Reporting / export

### 4. Operator Scenarios

List each real operator scenario, not UI sections.

| Scenario ID | Scenario name | Trigger | Actor | Success outcome |
| --- | --- | --- | --- | --- |
| SC-01 |  |  |  |  |
| SC-02 |  |  |  |  |

### 5. Required Screen Set

Derive screens from scenarios. A broad menu usually needs more than one.

| Screen ID | Screen name | Screen type | Main purpose | Entry point | Exit / next step |
| --- | --- | --- | --- | --- | --- |
| SCR-01 |  | list / dashboard / detail / create / edit / approve / history / popup |  |  |  |
| SCR-02 |  |  |  |  |  |

### 6. Screen-to-Screen Flow

| From screen | Action | To screen | Required? | Notes |
| --- | --- | --- | --- | --- |
|  |  |  | Y/N |  |

### 7. Screen-Level Functional Requirements

Fill one block per screen.

#### Screen: [screen name]

- Purpose:
- User decision made on this screen:
- Required data summary cards:
- Required filters:
- Required table columns:
- Required form fields:
- Required actions:
- Required status values:
- Required empty state:
- Required error state:
- Required permission behavior:
- Required audit/history behavior:
- Required related links:
- Required bulk actions:
- Required export or print:
- Required attachment or comment:
- Required bilingual labels:

### 8. Completion Loop Check

Confirm the workflow is closed.

- Can operator find the item?
- Can operator inspect the item?
- Can operator act on the item?
- Can operator confirm the result?
- Can operator review history later?
- Can operator recover from failure?
- Can operator hand off to the next role?

### 9. Dependencies

- APIs needed:
- DB tables needed:
- External systems:
- Shared components:
- Shared policy or code tables:
- Existing screens reused:

### 10. Done Definition

- What must be demoable:
- What must persist:
- What must be auditable:
- What must be navigable:
- What must be permission-guarded:
```

## Broad Menu Heuristics

If a menu name contains broad operational meaning, assume multiple screens until proven otherwise.

Typical examples:

- 운영센터
- 회원관리
- 정책관리
- 정산관리
- 보안운영
- 연계운영
- 감사관리
- 환경관리

These names often imply a screen set such as:

- dashboard or overview
- list or queue
- detail drilldown
- create or request
- edit or maintain
- approval or review
- execution result
- history or audit
- exception handling

## Screen Set Patterns

Use these patterns when deriving missing sibling screens.

### Dashboard Pattern

Usually needs:

- main status dashboard
- incident or item detail drilldown
- action history
- shortcut or escalation entry

### List Management Pattern

Usually needs:

- search/list
- detail
- create
- edit
- delete or disable confirmation
- history

### Approval Pattern

Usually needs:

- request list
- request detail
- approve/reject action surface
- result confirmation
- approval history

### Execution Pattern

Usually needs:

- execution control screen
- parameter form
- run result screen
- run history
- failure retry path

### Monitoring Pattern

Usually needs:

- summary dashboard
- live event list
- event detail
- action or mitigation surface
- history or timeline

## Common Missing Functions Checklist

Before calling a menu complete, check these items.

- search and filter
- sorting
- pagination
- empty state
- loading state
- error state
- permission denied state
- detail drilldown
- create path
- edit path
- approve or reject path
- status transitions
- history or audit trail
- comment or memo
- attachment or evidence
- export or download
- bulk action if list volume is high
- notification or alert feedback
- return path after save or action
- failure recovery path
- bilingual text coverage

## Closed Workflow Priority Rule

Do not prioritize by menu order alone.

Prioritize by the smallest complete workflow that reaches business closure.

Recommended implementation order for each domain:

1. list or dashboard
2. detail
3. action screen
4. result confirmation
5. history or audit
6. secondary convenience features

This is the minimum safe loop:

- detect or find
- inspect
- act
- confirm
- trace later

If any one of these is missing, the workflow is incomplete.

## Priority Scoring Template

Use this table to order work across menus.

| Menu | Business criticality (1-5) | Frequency (1-5) | Workflow closure risk if missing (1-5) | Dependency blocker (1-5) | UI breadth (1-5) | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

Suggested reading:

- business criticality: impact if not available
- frequency: how often operators use it
- workflow closure risk: how badly nearby screens break if this menu is absent
- dependency blocker: how much other screens depend on it
- UI breadth: how many sibling screens this menu implies

High total score means earlier decomposition and earlier implementation.

## Example: Operations Center

Example decomposition for a broad menu:

```md
Menu name: 운영센터
Purpose: provide one entry surface for overall operations health and drilldown into detailed action screens

Likely scenarios:
- monitor current operational health
- inspect active incidents
- jump to failed batch details
- review alert backlog
- confirm recent operator actions

Likely screen set:
- operations center dashboard
- incident detail
- action history
- alert queue summary
- batch status summary
- resource usage summary

Completion loop:
- operator detects abnormal state from dashboard
- opens related detail
- performs or delegates action
- confirms result
- reviews history afterward
```

## Request Format For Future Implementation

When asking Codex to implement menus, provide at least:

```md
- menu tree or target menu list
- menu order
- one-line purpose per menu
- screen decomposition if known
- required scenarios if known
- required actions if known
- related screens or routes
- API/DB readiness or mock-data allowance
- done definition
```

If the decomposition is not known yet, ask for:

- menu decomposition first
- implementation second

That sequence reduces missing screens and missing functions much more reliably than direct build requests.
