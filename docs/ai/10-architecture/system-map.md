# System Map

Summarize the major subsystems and their boundaries.

Suggested sections:

- public site
- join and membership
- mypage
- admin
- shared content management
- observability and audit modules
- external integrations

For each subsystem, record:

- main routes
- main packages
- main tables
- main roles

Builder structure-governance note:

- when the subsystem is the builder family, use `docs/architecture/builder-structure-wave-20260409-closure.md` to answer which path is canonical and whether an old path is a shim or delete candidate

Builder resource-ownership continuation note:

- when the subsystem question is about which builder resource row is currently blocked, provisional, or next, use `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md` first and then `docs/architecture/builder-resource-ownership-queue-map.md`
- use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md` when the subsystem note itself changes live continuation state
- treat those two docs as the single live entry pair before opening row-specific review cards
- if subsystem notes change blocker count, active row, next review target, or partial-closeout wording, update both docs in the same turn
