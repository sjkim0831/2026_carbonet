# External Auth Integration Guide

Use this document when Carbonet login must be extended with modular external authentication such as KISA simple authentication, joint certificate, or financial certificate flows.

## Goal

Keep external authentication integration:

- modular across providers
- isolated across SDK versions
- compatible with the existing Carbonet JWT login flow
- resumable by future Codex sessions without rediscovery

## Repository boundary

### Backend

- Controller:
  - `src/main/java/egovframework/com/feature/auth/external/web/ExternalAuthApiController.java`
- Orchestrator:
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/ExternalAuthServiceImpl.java`
- Provider:
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaExternalAuthProvider.java`
- Adapter:
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaSdkV1Adapter.java`
- Token issuance bridge:
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/AuthTokenLoginServiceImpl.java`

### Frontend

- Login and auth choice UI:
  - `frontend/src/features/public-entry/PublicEntryPages.tsx`

## Design rules

1. Provider modularity
   - Each auth vendor or major auth family should sit behind `ExternalAuthProvider`.
2. Adapter version isolation
   - SDK-specific logic should sit behind `ExternalAuthAdapter`.
   - Future SDK upgrades should replace or add adapters, not leak across controllers and login services.
3. Login reuse
   - External auth success should end by reusing the existing Carbonet token issuance path.
4. Link storage reuse
   - Persist linked identity values through existing `AUTH_TY`, `AUTH_CI`, `AUTH_DI` fields.
5. Predictable failures
   - Incomplete credential or endpoint setup must surface as JSON failure responses, not server 500s.
6. UI stability
   - Do not redesign the login page unless explicitly requested.

## KISA standard API interpretation

For Carbonet login use, prefer this minimal path first:

1. `token`
2. `request`
3. `result`

Add one of these only when needed:

- `identify`
- `verify`

Use `prepare + clientrequest` only when the vendor flow truly requires client-side original-document hash confirmation before push delivery.

## Configuration checklist

These values are required before the flow can be marked live-ready:

- `SECURITY_EXTERNAL_AUTH_KISA_CLIENT_ID`
- `SECURITY_EXTERNAL_AUTH_KISA_SERVICE_CODE`
- `SECURITY_EXTERNAL_AUTH_KISA_CA_CODE`
- `SECURITY_EXTERNAL_AUTH_KISA_PREPARE_ENDPOINT`
- `SECURITY_EXTERNAL_AUTH_KISA_RESULT_ENDPOINT`
- `SECURITY_EXTERNAL_AUTH_KISA_PUBLIC_KEY_JWK`

Sometimes also required:

- `SECURITY_EXTERNAL_AUTH_KISA_CALLBACK_SCHEME`
- IP whitelist registration
- callback URL registration
- production or development base URL distinction

## What portal issuance alone does and does not solve

Portal issuance can give:

- client and service identifiers
- endpoint URLs
- public JWK
- callback or whitelist registration status

Portal issuance alone does not finish the implementation. The code still needs:

- actual request and response mapping
- token/assertion generation details
- result polling or callback handling
- identity extraction and Carbonet account linking

## What to ask the partner portal or operator for

- `client_id`
- `service_code`
- `ca_code`
- development and production base URLs
- `token`, `request`, `result`, and ideally `identify` sample payloads
- assertion generation rules for `token`
- callback registration rules
- whitelist rules
- result response identity field names

## Current status snapshot

- Modular provider/adapter/orchestrator structure exists.
- Login page consumes server-provided auth methods.
- Availability is gated by live-readiness.
- Live KISA transaction execution is not yet complete.
- The next likely implementation step is the login-first `token -> request -> result` path.

## Local runtime verification

When external-auth code changes must be visible on `:18000`, run:

1. `cd frontend && npm run build`
2. `mvn -q -DskipTests package`
3. `bash ops/scripts/restart-18000.sh`
4. `bash ops/scripts/codex-verify-18000-freshness.sh`

Then verify:

- `https://127.0.0.1:18000/signin/loginView`
- `https://127.0.0.1:18000/signin/external-auth/methods`
- any changed start or completion endpoint
