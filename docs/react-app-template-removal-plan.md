# React App Template Removal Plan

## Current State

- React runtime assets are served from `/assets/react/**`.
- React build output is written under `src/main/resources/static/react-app`.
- React shell views still use Thymeleaf templates:
  - none
- Some admin pages such as SR workbench still use Thymeleaf page templates around React bootstrap data.

## What Was Completed

1. The old `react-migration` naming was removed from active source code paths.
2. React shell entry URLs now use `/app`, `/admin/app`, `/en/app`, `/en/admin/app`.
3. Shell asset metadata was separated from the template through bootstrap APIs:
   - `/api/app/bootstrap`
   - `/api/admin/app/bootstrap`
   - `/en/api/app/bootstrap`
   - `/en/api/admin/app/bootstrap`
4. `react_app_shell*.html` now behaves like a mostly static shell that fetches runtime bootstrap JSON before loading the bundle.
5. The shell now forwards to `static/react-shell/index.html`, so `react_app_shell*.html` were removed.
6. `sr_workbench*.html` were removed and `AdminSrWorkbenchController` now uses the common React shell directly.
7. The following admin-only legacy wrappers were removed because their routes already enter React directly and no controller returns those Thymeleaf views anymore:
   - `auth_change*.html`
   - `auth_group.html`
   - `admin_list*.html`
   - `codex_provision*.html`
   - `dept_role_mapping*.html`
   - `ip_whitelist*.html`
   - `index*.html`
   - `menu_placeholder*.html`
   - `member_register*.html`
   - `member_reset_password*.html`
   - `member_stats.html`
8. `AdminMainController` and `AdminSystemCodeController` no longer scatter legacy admin template view names across page-data and POST fallback paths. Admin fallback pages now enter the common React shell as well.
9. Home menu fallback pages now enter the common React shell too, so `home/menu_placeholder*.html` were removed.

## Remaining Work Before `templates/` Can Be Deleted

### 1. Remove Thymeleaf shell rendering entirely

- Replace `ReactAppPageController` view returns with redirects or static file forwarding to a real static HTML shell.
- Stop using `ReactAppViewSupport.render(...)` for shell page responses.
- Move CSRF/bootstrap delivery away from Thymeleaf meta rendering.

Target files:
- `src/main/java/egovframework/com/feature/home/web/ReactAppPageController.java`
- `src/main/java/egovframework/com/feature/home/web/ReactAppViewSupport.java`
- `src/main/java/egovframework/com/config/web/WebMvcConfig.java`

### 2. Replace Thymeleaf CSRF/meta injection

- Today the shell still depends on `_csrf` and `_csrf_header` meta tags rendered by Spring MVC.
- Replace with one of:
  - bootstrap API response carrying CSRF metadata
  - cookie-based CSRF strategy
  - a dedicated `/api/app/bootstrap` payload that includes request-safe CSRF fields

### 3. Remove remaining Thymeleaf admin shells and admin chrome

- any admin page still returning a dedicated Thymeleaf wrapper around a React root
- any admin page-data builder still tied to a legacy `viewName` contract only for model composition
- admin common chrome fragments:
  - `header.html`
  - `footer.html`

### 4. Remove remaining home Thymeleaf pages

Home Thymeleaf page templates are now removed.

`index*.html`, `mypage*.html`, `home/menu_placeholder*.html`, and `sitemap*.html` now enter the common React shell.

These need either:
- the common static HTML shell plus bootstrap API, or
- full migration into the React router.

### 4. Migrate non-React Thymeleaf pages

The `templates` folder contains many pages that are not React shells yet:
- home index pages
- sitemap pages
- mypage variants
- admin header/layout templates
- legacy admin pages

These need to be:
- migrated to React, or
- moved to static HTML, or
- intentionally retained in a separate server-rendered module

### 5. Remove Thymeleaf configuration

Only after all Thymeleaf views are gone:
- remove `spring.thymeleaf.*`
- remove `templateResolver()`
- remove `templateEngine()`
- remove `thymeleafViewResolver()`

Target file:
- `src/main/java/egovframework/com/config/web/WebMvcConfig.java`

## Recommended Execution Order

1. Convert `react_app_shell*.html` into true static files under `static/react-shell/`.
2. Extend `/api/app/bootstrap` to return CSRF metadata so no template meta injection is required.
3. Move admin chrome/header behavior fully into React.
4. Audit all remaining Thymeleaf views and classify them:
   - migrate
   - keep temporarily
   - delete
5. Remove Thymeleaf beans and delete `templates/`.

## Definition of Done

- No controller returns a Thymeleaf view name.
- No file under `src/main/resources/templates` is used at runtime.
- Spring starts without Thymeleaf beans.
- `/app` and `/admin/app` are served by static HTML + API bootstrap only.
