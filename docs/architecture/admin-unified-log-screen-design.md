# Admin Unified Log Screen Design

## Goal

`/admin/system/unified_log` is the operator-facing search surface that correlates access, audit, error, trace, security, and runtime events without collapsing all source tables into one physical table.

The unified log screen must answer:

- who triggered the event
- from which company and role
- on which page, component, function, or API
- against which target
- with which result
- with which related trace flow

## Source Families

The screen aggregates these source families first:

- `ACCESS`
  - `ACCESS_EVENT`
  - login, logout, page access, API access
- `AUDIT`
  - `AUDIT_EVENT`
  - create, update, delete, approve, reject, role assignment
- `ERROR`
  - `ERROR_EVENT`
  - backend exception, frontend report, external integration failure
- `TRACE`
  - `TRACE_EVENT`
  - page view, UI action, API request, API response, layout render, UI error

The screen can later expand with:

- `SECURITY`
- `BATCH`
- `RUNTIME`
- `AI_EXECUTION`

## Tabs

- `all`
- `access-auth`
- `audit`
- `error`
- `trace`
- `security`
- `batch-runtime`

Tabs are presets over the same search DTO, not separate page types.

## Search Contract

Backend request DTO:

- `AdminUnifiedLogSearchRequestDTO`

Key filters:

- `tab`
- `logType`
- `detailType`
- `resultCode`
- `actorId`
- `actorRole`
- `insttId`
- `memberType`
- `menuCode`
- `pageId`
- `componentId`
- `functionId`
- `apiId`
- `actionCode`
- `targetType`
- `targetId`
- `traceId`
- `requestUri`
- `remoteAddr`
- `fromDate`
- `toDate`
- `searchKeyword`

## Unified Row Contract

Backend response row DTO:

- `AdminUnifiedLogRowResponse`

Common output columns:

- `logId`
- `logType`
- `detailType`
- `occurredAt`
- `resultCode`
- `actorId`
- `actorRole`
- `insttId`
- `companyName`
- `memberType`
- `menuCode`
- `pageId`
- `componentId`
- `functionId`
- `apiId`
- `actionCode`
- `targetType`
- `targetId`
- `traceId`
- `requestUri`
- `remoteAddr`
- `durationMs`
- `summary`
- `message`
- `rawSourceType`

These fields are the stable contract for frontend table rendering, detail drill-down, CSV export, and trace correlation.

## Mapping Rules

### Access Event -> Unified Row

- `logId` <- `eventId`
- `logType` <- `ACCESS`
- `detailType` <- `featureType`
- `occurredAt` <- `createdAt`
- `resultCode` <- `responseStatus`
- `actorId` <- `actorId`
- `actorRole` <- `actorRole`
- `insttId` <- `actorInsttId`
- `pageId` <- `pageId`
- `apiId` <- `apiId`
- `traceId` <- `traceId`
- `requestUri` <- `requestUri`
- `remoteAddr` <- `remoteAddr`
- `durationMs` <- `durationMs`
- `summary` <- `parameterSummary`
- `message` <- `companyScopeReason`
- `rawSourceType` <- `featureType`

### Audit Event -> Unified Row

- `logId` <- `auditId`
- `logType` <- `AUDIT`
- `detailType` <- `actionCode`
- `occurredAt` <- `createdAt`
- `resultCode` <- `resultStatus`
- `actorId` <- `actorId`
- `actorRole` <- `actorRole`
- `menuCode` <- `menuCode`
- `pageId` <- `pageId`
- `actionCode` <- `actionCode`
- `targetType` <- `entityType`
- `targetId` <- `entityId`
- `traceId` <- `traceId`
- `requestUri` <- `requestUri`
- `remoteAddr` <- `ipAddress`
- `summary` <- `reasonSummary`
- `message` <- `afterSummaryJson`
- `rawSourceType` <- `httpMethod`

### Error Event -> Unified Row

- `logId` <- `errorId`
- `logType` <- `ERROR`
- `detailType` <- `errorType`
- `occurredAt` <- `createdAt`
- `resultCode` <- `resultStatus`
- `actorId` <- `actorId`
- `actorRole` <- `actorRole`
- `insttId` <- `actorInsttId`
- `pageId` <- `pageId`
- `apiId` <- `apiId`
- `traceId` <- `traceId`
- `requestUri` <- `requestUri`
- `remoteAddr` <- `remoteAddr`
- `summary` <- `message`
- `message` <- `stackSummary`
- `rawSourceType` <- `sourceType`

### Trace Event -> Unified Row

- `logId` <- `eventId`
- `logType` <- `TRACE`
- `detailType` <- `eventType`
- `occurredAt` <- `createdAt`
- `resultCode` <- `resultCode`
- `pageId` <- `pageId`
- `componentId` <- `componentId`
- `functionId` <- `functionId`
- `apiId` <- `apiId`
- `traceId` <- `traceId`
- `durationMs` <- `durationMs`
- `summary` <- `payloadSummaryJson`
- `rawSourceType` <- `eventType`

## Scope Rules

Unified log is still company-scoped.

- `ROLE_SYSTEM_MASTER` can search all companies
- other administrators default to their own `insttId`
- queries without `ALL` capability must be forced to the current actor company scope
- company-scoped filters must also apply to export APIs and detail lookups

## Frontend Rules

The unified log page should render one table contract and switch tabs by filter preset only.

The frontend type must mirror the backend DTO:

- `UnifiedLogTab`
- `UnifiedLogSearchParams`
- `UnifiedLogRow`

The page should not depend on raw source VO field names.

## Rollout Order

1. add DTOs and frontend types
2. add unified-log API search endpoint
3. map access, audit, error, trace to unified rows
4. switch `/admin/system/unified_log` table rendering to unified rows
5. add detail drawer and trace correlation links
