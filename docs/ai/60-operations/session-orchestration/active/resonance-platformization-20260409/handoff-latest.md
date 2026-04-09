# Latest Handoff

Updated on `2026-04-09`.

## Current Position

- boundary rules are already established
- the repository is in the implementation phase, not the idea phase
- the highest-value unfinished area is still control-plane composition under `feature/admin`
- builder structure-governance closure for the current wave is now frozen in `docs/architecture/builder-structure-wave-20260409-closure.md`
- app assembly, package, runtime, and asset freshness closure for the current owner wave is now frozen around `apps/carbonet-app`

## Current Closed Family

- `BUILDER_STRUCTURE_GOVERNANCE`
- `APP_ASSEMBLY_BUILD_RUNTIME_CLOSURE`

This means the following are now frozen for the current wave:

- which builder family is counted as closed today
- which builder paths are source of truth
- when a legacy builder path may stay as a shim
- how `large-move-completion-contract.md` should be interpreted for this wave
- which app assembly path is canonical
- which packaged jar path is canonical
- which closure and runtime-proof scripts are the standard operator path

Operator-ready closeout note:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-structure-wave-closeout.md`
- `ops/scripts/app-closure-help.sh`
- `ops/scripts/verify-app-closure-all.sh`
- `ops/scripts/codex-verify-18000-freshness.sh`

## Immediate Next Slice

- start with `Priority 1A` from the separation status doc:
  - move control-plane menu/bootstrap and observability entry composition out of `feature/admin`
  - keep compatibility shims only where runtime routes still need them

Most recent direct-coupling and compatibility-shim reductions already completed:

- `feature/admin` observability entry points now use `PlatformObservabilityAdminPagePort`
- `AdminSessionSimulationService` is now further narrowed to `PlatformObservabilityCompanyScopePort`
- `AdminMainController` access-history company-option helpers are now also narrowed to `PlatformObservabilityCompanyScopePort`
- `AdminMemberController` security-history page data is now narrowed to `PlatformObservabilityHistoryPagePayloadPort`
- `AdminShellBootstrapPageService` external-monitoring and certificate-audit bootstrap payloads are now narrowed to `ExternalMonitoringPayloadPort` and `CertificateAuditLogPageDataPort`
- certificate-audit page-data no longer routes back through a reverse bridge into `AdminShellBootstrapPageService`
- admin-facing help API aliases now terminate directly in `platform-help` `HelpManagementApiController`
- `feature/admin` help ownership is now reduced to the page-forwarding shim for `/admin/system/help-management`
- `feature/admin` self-healing and safe-plan workbench entry points now use `SrTicketWorkbenchPort`
- `feature/admin` authority payload support now uses `PlatformObservabilityAuditQueryPort`
- direct `platform.* service/web` imports under `feature/admin` are now `0`

Current narrow remainder:

- remaining `feature/admin` dependence is now at contract-interface and composition ownership level, not direct platform service/web type imports
- remaining `feature/admin` observability references are now narrowed contract ports plus metadata strings in `ScreenCommandCenterServiceImpl`

Do not reopen the app-closure owner slice unless one of these changes again:

- canonical app jar path
- operator closure verifier sequence
- React route-registry runtime proof on `:18000`

Builder-family next kickoff:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-kickoff.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`
- `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-partial-closeout-example.md` for the first provisional handoff shape on rows `1` and `2`

For active continuation, treat these as the single live entry pair:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

If handoff refresh changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

Current builder resource-ownership provisional state:

- row `1` (`framework-builder compatibility mapper XML`) is currently tracked as `BLOCKS_CLOSEOUT`
- row `2` (`framework contract metadata resource`) is currently tracked as `BLOCKS_CLOSEOUT`
- current provisional blocker count from reviewed start-now rows is `2`
- next review target is row `3` (`builder observability metadata/resource family`)
- row `3` should start from `docs/architecture/builder-resource-review-builder-observability.md`
- row `3` partial handoff may start from `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-observability-partial-closeout-example.md`
- row `3` is currently bounded at provisional review level, but is not yet counted as a blocker
- review queue after row `3` is row `4` (`builder-owned root resource line excluded by app packaging`)
- row `4` partial handoff may start from `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-app-packaging-partial-closeout-example.md`
- review queue after row `4` is row `5` (`executable app resource assembly fallback`)
- row `5` partial handoff may start from `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-executable-app-partial-closeout-example.md`

## Do First

1. open `docs/architecture/carbonet-resonance-separation-status.md`
2. open `docs/architecture/carbonet-resonance-boundary-classification.md`
3. confirm the selected family is still in `Priority 1A`
4. freeze owner paths before touching Java or route files
5. if the selected family is `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`, resume from the single live entry pair before opening any row-specific review card

## Do Not Skip

- keep DTO ownership platform-owned when the API is control-plane owned
- keep release-unit/runtime-package/deploy-trace naming under platform governance
- keep route split work behind one frontend owner

## Verification Expectation

- document path ownership before implementation
- if runtime behavior changes on `:18000`, use the repository freshness sequence before claiming completion
- for app-closure proof, use:
  1. `bash ops/scripts/verify-app-closure-all.sh`
  2. `bash ops/scripts/codex-verify-18000-freshness.sh`
