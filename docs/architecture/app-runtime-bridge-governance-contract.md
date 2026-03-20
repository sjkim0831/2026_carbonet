# App Runtime Bridge Governance Contract

## Goal

Define the final runtime-bridge contract for generated screens that run in:

- web browser
- mobile web
- hybrid webview
- native wrapper
- kiosk

The purpose is to let Resonance generate one governed screen family while binding runtime-specific behavior through explicit capability and bridge contracts instead of scattered device checks.

## Core Rule

Generated frontend code should never branch directly on user agent, platform string, or ad hoc global objects.

All runtime-sensitive behavior must resolve through:

1. `appRuntimeProfileId`
2. `bridgeAdapterId`
3. `capabilitySet`
4. `fallbackPolicy`

## Runtime Objects

### `APP_RUNTIME_PROFILE`

Recommended fields:

- `appRuntimeProfileId`
- `runtimeKind`
  - `WEB_BROWSER`
  - `MOBILE_WEB`
  - `HYBRID_WEBVIEW`
  - `NATIVE_WRAPPER`
  - `KIOSK`
- `bridgeAdapterSet`
- `capabilitySet`
- `fallbackPolicyId`
- `offlinePolicyId`
- `securityProfileId`
- `status`

### `BRIDGE_ADAPTER_REGISTRY`

Recommended fields:

- `bridgeAdapterId`
- `bridgeType`
  - `NONE`
  - `WEB_STANDARD`
  - `POST_MESSAGE_BRIDGE`
  - `ANDROID_JS_INTERFACE`
  - `IOS_WEBKIT_MESSAGE`
  - `NATIVE_WRAPPER_RPC`
- `adapterName`
- `version`
- `supportedCapabilitySet`
- `securityPolicySet`
- `diagnosticActionSet`
- `status`

### `APP_RUNTIME_CAPABILITY`

Recommended fields:

- `capabilityId`
- `capabilityCode`
- `capabilityFamily`
  - `navigation`
  - `device`
  - `storage`
  - `notification`
  - `camera`
  - `file`
  - `clipboard`
  - `security`
  - `offline`
- `defaultFallbackMode`
- `requiresExplicitApprovalYn`
- `auditRequiredYn`

### `APP_RUNTIME_FALLBACK_POLICY`

Recommended fields:

- `fallbackPolicyId`
- `policyName`
- `unsupportedCapabilityMode`
  - `HIDE`
  - `DISABLE`
  - `WEB_SAFE_DEGRADE`
  - `REDIRECT_TO_GUIDE`
  - `BLOCK_AND_EXPLAIN`
- `operatorMessagePolicy`
- `auditOnFallbackYn`
- `status`

## Required Capability Families

At minimum, runtime profiles should classify these capabilities.

- `ROUTE_NAVIGATION`
- `EXTERNAL_LINK_OPEN`
- `WEBVIEW_BACK_BUTTON`
- `CAMERA_BRIDGE`
- `FILE_PICKER_BRIDGE`
- `DOWNLOAD_BRIDGE`
- `SECURE_STORAGE_BRIDGE`
- `PUSH_TOKEN_SYNC`
- `CLIPBOARD_WRITE`
- `OFFLINE_CACHE_READ`
- `OFFLINE_CACHE_WRITE`
- `APP_CLOSE_REQUEST`
- `DEEPLINK_HANDLE`
- `CERTIFICATE_PINNING_SIGNAL`

## Bridge Resolution Rule

Generated code should resolve runtime behavior in this order:

1. load `appRuntimeProfileId`
2. resolve allowed `bridgeAdapterSet`
3. resolve supported `capabilitySet`
4. bind wrapper helpers from the common frontend runtime
5. execute capability through adapter, not through raw global objects
6. apply fallback policy if unsupported
7. emit audit or diagnostics events when policy requires it

## Frontend Wrapper Rule

Project screens should use stable wrappers such as:

- `runtime.navigate(...)`
- `runtime.openExternal(...)`
- `runtime.pickFile(...)`
- `runtime.captureImage(...)`
- `runtime.writeSecureStore(...)`
- `runtime.syncPushToken(...)`

Do not allow generated screens to call:

- raw `window.Android.*`
- raw `window.webkit.messageHandlers.*`
- raw `window.ReactNativeWebView.postMessage(...)`

except inside centrally governed bridge adapters.

## Security Rule

Every bridge adapter should declare:

- what data can cross the bridge
- whether the action needs actor confirmation
- whether the action requires audit
- whether CSRF or origin checks still apply
- whether fallback should block or degrade

Sensitive capabilities such as file export, secure-store write, push registration, and camera access should always be tied to:

- actor policy
- runtime security profile
- audit event policy

## Diagnostics And UX Rule

Runtime bridge failures should not appear as silent no-ops.

The UI must support:

- capability-not-supported message
- runtime-degraded badge
- diagnostics drawer with adapter and capability status
- retry action when appropriate
- fallback explanation

## Scaffold Binding Rule

`scaffold-request.json` should bind:

- `appRuntimeProfileId`
- `responsiveProfileId`
- `deviceProfileSet`
- `actorPolicyId`
- `csrfPolicyId`

Generated outputs should include:

- `app-runtime-manifest.json`
- `bridge-adapter-binding.json`
- `capability-gate-manifest.json`
- `runtime-diagnostics-manifest.json`

## Publish Blockers

Do not publish a runtime-bound screen if:

- `appRuntimeProfileId` is missing for hybrid, kiosk, or wrapper flows
- a required capability has no registered bridge adapter
- fallback mode is undefined for unsupported capabilities
- a security-sensitive capability lacks audit or actor-policy linkage
- bridge diagnostics cannot identify adapter version and capability status

## Non-Goals

- full native-app architecture
- ad hoc device-conditional page forking
- project-local bridge implementations outside central governance
