# Carbonet Project Patterns

## Core structure

- Java package root: `src/main/java/egovframework/com`
- Feature packages already in use:
  - `feature/admin`
  - `feature/auth`
  - `feature/home`
  - `feature/member`
- Common infrastructure lives under:
  - `common`
  - `config`

## Layering pattern

- Controllers live in `web`
- Service interfaces live in `service`
- Existing services may also use `service/impl`
- Mapper classes live in `mapper`
- MyBatis XML lives under `src/main/resources/egovframework/mapper/com/feature/<domain>`
- DTOs and VOs are split by intent when needed:
  - request/response DTOs under `dto`
  - query/result carriers under `model/vo`

## Template pattern

- Admin templates: `src/main/resources/templates/egovframework/com/admin`
- Auth templates: `src/main/resources/templates/egovframework/com/auth`
- Home templates: `src/main/resources/templates/egovframework/com/home`
- Member templates: `src/main/resources/templates/egovframework/com/member`
- File names use `snake_case`
- English pages use `_en` suffix

## URL and locale pattern

- Admin routes use `/admin/...`
- English admin routes use `/en/admin/...`
- User/home routes follow existing patterns such as `/home`, `/en/home`, `/mypage`, `/join/...`
- Existing controllers often detect English by request path or `language=en`
- When adding a view page, add the English template and route variant together unless explicitly out of scope

## Mapper pattern

- Mapper classes extend `egovframework.com.common.mapper.support.BaseMapperSupport`
- Mapper bean names use lower camel case repository names, e.g. `@Repository("menuFeatureManageMapper")`
- Mapper XML namespace matches the class usage string, e.g. `MenuFeatureManageMapper.selectMenuFeatureList`
- Prefer the existing select/insert/update/delete style instead of introducing a new data access abstraction

## Existing implementation anchors

- Admin page and function management already model menu and feature metadata
- `AdminMenuController` builds admin menu trees from code metadata and menu URLs
- `AdminSystemCodeController` is the reference controller for:
  - bilingual admin pages
  - page management
  - feature management
  - validation and redirect patterns
- `MenuFeatureManageMapper.xml` and `AdminCodeManageMapper.xml` are the reference XML files for:
  - page registration
  - feature registration
  - admin search/list screens

## Naming rules

- Keep external eGovFrame style names such as `Egov*`
- Use feature or role based names for repository-owned classes
- Reuse nearby naming before inventing new terms
- Keep URL, template name, DTO name, and VO name aligned with the menu or business noun

## Delivery guidance

- If the feature is mostly admin management, prefer extending `feature/admin`
- If the feature is member-facing or membership-related, prefer `feature/member`
- If the feature only exposes JSON for an existing page, add an API endpoint alongside the page controller only if the current domain already follows that split
- Reuse existing list/detail/register/edit patterns from admin templates before inventing new screens
