# Installable Module Pattern Contract

Generated on 2026-03-21 for Resonance module-addition pattern normalization.

## Goal

Ensure that manually requested, AI-assisted module additions are built and attached with the same governed depth and structure every time.

This contract applies to:

- business feature modules
- board families
- report/export helpers
- popup/grid/search composite modules
- theme/CSS/JS bundles
- support adapters and optional stacks

Known reference intake candidates include:

- `/opt/reference/modules/gnrlogin-4.3.2`
- `/opt/reference/modules/certlogin-4.3.2`

## Core Rule

Every installable module should be generated and published with the same structural depth.

At minimum, a module should resolve to:

1. module registry entry
2. version entry
3. parameter and result contract
4. frontend asset family or thin-runtime usage declaration
5. backend chain family or integration contract
6. DB object and SQL impact declaration
7. runtime package attachment mapping
8. rollback and detach path

No module should be attached as an opaque blob.

Module folder intake should also follow this rule:

- adding a new module folder is not an automatic build trigger by default
- module folder analysis, normalization, and pattern fitting should be treated as an AI-assisted intake task
- only approved, normalized module outputs may continue to governed build and deploy

## Required Module Pattern Fields

- `installableModuleId`
- `moduleFamily`
- `modulePatternFamilyId`
- `moduleDepthProfileId`
- `frontendAssetSet`
- `backendChainPatternFamilyId`
- `dbObjectPatternFamilyId`
- `sqlDraftPatternFamilyId`
- `parameterContractSet`
- `resultContractSet`
- `runtimePackageAttachmentProfileId`
- `rollbackProfileId`

## Module Depth Rule

The same module family should preserve the same structural depth.

Examples:

- board modules should always include menu set, page family set, popup/grid/search blocks, backend chain family, DB object family, and SQL draft family
- popup selector modules should always include popup page family, search form block, result grid block, and event/function/API contracts

For the current reference login modules, use this interpretation:

- `gnrlogin-4.3.2`
  - common-web, login, file, and security baseline candidate
- `certlogin-4.3.2`
  - certificate-login extension candidate on top of the same baseline

Do not attach either folder directly as one raw module.
First split them into:

- common security/web baseline lines
- certificate-login adapters
- mail or notification-related adapters where applicable

## Validation Rules

Reject module publish or attach when:

- module pattern family is missing
- module depth profile is missing
- frontend-only asset is declared without backend or DB impact declaration where required
- CSS/JS bundles are attached without theme or token compatibility declaration
- runtime package attachment profile is missing

Do not allow direct auto-build from newly added module folders when:

- ownership is unclear
- common/runtime boundary is unclear
- backend or DB impact is not reviewed
- CSS dedupe state is not reviewed
- rollback path is not recorded

## Use

This contract should be consumed by:

- installable module registry
- runtime package matrix
- parity compare
- module attach or detach screens
- AI-assisted module generation and review
