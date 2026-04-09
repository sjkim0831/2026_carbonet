---
name: carbonet-external-auth-integration
description: Implement or continue Carbonet external authentication integration for login and identity-linking flows. Use when the task involves simple authentication, joint/financial certificate login, KISA standard APIs such as token/request/result/prepare/clientrequest/verify/validate/identify, SDK adapter upgrades, provider modularization, or turning issued portal credentials into a working Carbonet login flow.
---

# Carbonet External Auth Integration

Use this skill when Carbonet work involves:

- `/signin/loginView` external authentication buttons
- modular provider and adapter design for multiple auth methods
- KISA simple-auth or certificate APIs
- issued portal credentials such as `client_id`, `service_code`, `ca_code`
- public key JWK, callback registration, IP whitelist
- linking external identity results to existing Carbonet accounts through `AUTH_TY`, `AUTH_CI`, `AUTH_DI`
- SDK version upgrades with minimal changes outside the adapter layer

Read first:

- [`/opt/projects/carbonet/docs/operations/external-auth-integration-guide.md`](/opt/projects/carbonet/docs/operations/external-auth-integration-guide.md)
- [`/opt/projects/carbonet/.codex/skills/carbonet-external-auth-integration/references/current-code-map.md`](/opt/projects/carbonet/.codex/skills/carbonet-external-auth-integration/references/current-code-map.md)

## Current repository shape

- Backend modular entry:
  - `src/main/java/egovframework/com/feature/auth/external/web/ExternalAuthApiController.java`
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/ExternalAuthServiceImpl.java`
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaExternalAuthProvider.java`
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaSdkV1Adapter.java`
- Token/JWT issuance reuse:
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/AuthTokenLoginServiceImpl.java`
- Existing account link storage:
  - `AUTH_TY`, `AUTH_CI`, `AUTH_DI` on member entities
- Frontend screens:
  - `frontend/src/features/public-entry/PublicEntryPages.tsx`

## Workflow

1. Confirm whether the task is:
   - credential/config registration only
   - login flow integration
   - result parsing and account linking
   - SDK version upgrade
   - provider expansion to another auth vendor
2. Inspect `application.yml` external-auth keys first.
3. Check whether issued values now exist:
   - `client_id`
   - `service_code`
   - `ca_code`
   - base URL
   - callback details
   - public JWK
4. For login-first implementation, prefer this API path:
   - `token`
   - `request`
   - `result`
   - optionally `identify` or `verify`
5. Do not force `prepare + clientrequest` unless the vendor flow explicitly requires out-of-app original-document hash confirmation.
6. Keep version-specific SDK handling inside the adapter only.
7. If a new SDK arrives:
   - add or replace adapter implementation
   - keep provider and controller contracts stable
   - avoid spreading SDK classes across general auth code
8. When external auth success returns CI/DI or equivalent identity values:
   - match Carbonet account
   - update `AUTH_*` fields when linking is explicit
   - issue the existing JWT login through `AuthTokenLoginServiceImpl`
9. If live endpoints or credentials are incomplete, fail with structured JSON, not a server 500.
10. After runtime-affecting changes, follow the `:18000` freshness sequence and verify:
   - `/signin/loginView`
   - `/signin/external-auth/methods`
   - any changed auth endpoint

## Delivery rules

- Keep login UI layout stable unless the user explicitly asks for redesign.
- Treat button availability as configuration readiness, not JAR presence alone.
- Expose pending state when SDK is present but live endpoints or issued credentials are missing.
- Prefer documented config keys over hardcoded values.

## When you need more detail

- API and rollout checklist: read the operations doc.
- File-by-file continuation map and missing work: read `references/current-code-map.md`.
