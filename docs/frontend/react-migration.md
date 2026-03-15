# React Migration Notes

## Working copy

- Path: `<PROJECT_ROOT>`
- Existing Thymeleaf flows remain intact in this copy.
- New React work starts under `/frontend`.

## First migration decisions

- Keep existing member join backend flow unchanged for now.
- Add new React screens only for newly created step-based pages.
- Move permission rendering to capability-based frontend components.
- Keep final authorization checks on backend APIs.

## Added in step 1

- `GET /api/frontend/session`
  - returns current user id
  - current author code
  - company scope
  - csrf token/header
  - current author feature codes
  - normalized capability codes for React
- `frontend/`
  - Vite + React + TypeScript scaffold
  - `PermissionGate` component
  - session bootstrap example page

## Next recommended step

- Choose the first new screen to build entirely in React.
- Define required capabilities per component before implementing the page.
- Add write APIs for that screen in JSON form instead of redirect/form style.
