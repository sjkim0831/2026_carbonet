# Current Code Map

## Purpose

This reference lets a later Codex session continue Carbonet external authentication work without rediscovering the current structure.

## Current implemented boundaries

### Backend

- Public API controller
  - `src/main/java/egovframework/com/feature/auth/external/web/ExternalAuthApiController.java`
- Orchestrator
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/ExternalAuthServiceImpl.java`
- Provider
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaExternalAuthProvider.java`
- Adapter
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/KisaSdkV1Adapter.java`
- Existing JWT issuance reuse
  - `src/main/java/egovframework/com/feature/auth/external/service/impl/AuthTokenLoginServiceImpl.java`
- Existing account lookup and link helpers
  - `src/main/java/egovframework/com/feature/auth/service/AuthService.java`
  - `src/main/java/egovframework/com/feature/auth/service/impl/AuthServiceImpl.java`
  - `src/main/java/egovframework/com/feature/auth/domain/repository/GeneralMemberRepository.java`
  - `src/main/java/egovframework/com/feature/auth/domain/repository/EnterpriseMemberRepository.java`
  - `src/main/java/egovframework/com/feature/auth/domain/repository/EmployeeMemberRepository.java`

### Frontend

- Login and auth-choice pages
  - `frontend/src/features/public-entry/PublicEntryPages.tsx`

## Current configuration keys

- `SECURITY_EXTERNAL_AUTH_ENABLED`
- `SECURITY_EXTERNAL_AUTH_MOCK_SUCCESS_ENABLED`
- `SECURITY_EXTERNAL_AUTH_METHOD_ORDER`
- `SECURITY_EXTERNAL_AUTH_KISA_ENABLED`
- `SECURITY_EXTERNAL_AUTH_KISA_ADAPTER_VERSION`
- `SECURITY_EXTERNAL_AUTH_KISA_SDK_JAR_PATH`
- `SECURITY_EXTERNAL_AUTH_KISA_DECRYPT_TOOL_PATH`
- `SECURITY_EXTERNAL_AUTH_KISA_CLIENT_ID`
- `SECURITY_EXTERNAL_AUTH_KISA_SERVICE_CODE`
- `SECURITY_EXTERNAL_AUTH_KISA_CA_CODE`
- `SECURITY_EXTERNAL_AUTH_KISA_PUBLIC_KEY_JWK`
- `SECURITY_EXTERNAL_AUTH_KISA_REQUEST_TITLE`
- `SECURITY_EXTERNAL_AUTH_KISA_PREPARE_ENDPOINT`
- `SECURITY_EXTERNAL_AUTH_KISA_RESULT_ENDPOINT`
- `SECURITY_EXTERNAL_AUTH_KISA_CALLBACK_SCHEME`

## Current behavior

- The login page renders external auth methods from `/signin/external-auth/methods`.
- Method availability is gated by live-readiness, not just SDK JAR existence.
- `/start` and `/complete` now return structured JSON failures instead of throwing server 500s for expected setup gaps.
- The login page layout was restored to the original arrangement:
  - one large primary simple-auth button
  - two smaller secondary certificate buttons

## Current known gap

- Live KISA result resolution is not completed.
- The adapter currently supports:
  - mock completion
  - readiness checks
  - a stable module boundary for future implementation
- It does not yet fully perform:
  - `token`
  - `request`
  - `result`
  - `identify` or `verify`
  - decrypt tool driven response handling

## Preferred next implementation order

1. Collect issued values from the partner portal.
2. Implement `token` request contract.
3. Implement login-focused `request -> result` flow.
4. Parse identity values from result.
5. Optionally add `identify` or `verify`.
6. Map CI/DI or equivalent values to Carbonet accounts.
7. Keep all SDK-specific behavior in the adapter.

## Verification path

After changing runtime behavior:

1. `frontend/npm run build`
2. `mvn -q -DskipTests package`
3. `bash ops/scripts/restart-18000.sh`
4. `bash ops/scripts/codex-verify-18000-freshness.sh`
5. check:
   - `/signin/loginView`
   - `/signin/external-auth/methods`
   - any changed auth endpoint
