---
name: carbonet-runtime-topology-ops
description: Design, review, document, or standardize Carbonet runtime topology and operations-platform build flow for small-memory multi-node environments, including Jenkins plus Nomad coordination, main/sub web nodes, shared idle-node pools, per-system DB isolation, Nginx entrypoints, central scaffolding/build/deploy authority, and latest-vs-archive file placement. Use when the request is about splitting or sharing runtime roles across servers or centralizing operations-system build ownership rather than implementing application feature logic.
---

# Carbonet Runtime Topology Ops

Use this skill when the main problem is runtime layout or server-role allocation, especially for:

- Jenkins plus Nomad operating model
- operations-system-centralized scaffolding, build, and deploy flow
- main/sub web node topology
- shared idle web-node pools
- per-system DB isolation versus shared web workers
- Nginx entrypoint ownership and internal upstream access
- latest-file versus archive-file placement
- small-memory capacity planning for multiple systems
- tmux session and pane layout for safe multi-node operations work

Use this as the primary skill only when the task is about operations topology, runtime boundaries, or deployment-node policy. If the work turns into application feature code, use `carbonet-feature-builder`. If the work turns into Codex runner behavior, use `carbonet-codex-execution-console`.

Read only what you need:

- Read [`/opt/projects/carbonet/docs/ai/80-skills/skill-boundaries.md`](/opt/projects/carbonet/docs/ai/80-skills/skill-boundaries.md) first for overlap rules.
- Read [`/opt/projects/carbonet/docs/ai/80-skills/skill-index.md`](/opt/projects/carbonet/docs/ai/80-skills/skill-index.md) when updating the skill map.
- Read [`/opt/projects/carbonet/docs/ai/80-skills/skill-gaps.md`](/opt/projects/carbonet/docs/ai/80-skills/skill-gaps.md) when a new topology pattern exposes remaining gaps.
- Read [`/opt/projects/carbonet/.codex/skills/carbonet-codex-execution-console/SKILL.md`](/opt/projects/carbonet/.codex/skills/carbonet-codex-execution-console/SKILL.md) when Jenkins, runner scripts, or execution-console behavior overlaps with the topology request.
- Read [`/opt/projects/carbonet/docs/architecture/operations-platform-console-architecture.md`](/opt/projects/carbonet/docs/architecture/operations-platform-console-architecture.md) when the work includes centralized scaffolding, common artifacts, project artifacts, or operations-system governance.

## Workflow

1. Classify the request:
   - fixed-role topology
   - shared idle-node topology
   - Jenkins plus Nomad coordination
   - operations-system centralized build ownership
   - DB split strategy
   - file placement strategy
   - traffic and failover flow
   - tmux/operator workflow
2. Keep these boundaries explicit:
   - DB is dedicated per system or per approved DB group
   - web/app instances may share idle worker nodes
   - file-serving may share nodes only when DB is not colocated
   - Jenkins and Nomad control-plane roles may be colocated only in small environments
3. For small-memory nodes, prefer this order:
   - DB separate first
   - main Nginx and hot/latest file placement second
   - sub web nodes and archive file placement third
   - idle-node pool and Nomad orchestration fourth
4. When Nomad is proposed, state clearly:
   - what Nomad will manage
   - what Nomad will not manage
   - whether scale-out is manual, Jenkins-triggered, or policy-driven
5. Treat Nginx as the public entrypoint and Nomad as backend placement unless a reverse-proxy automation path is explicitly defined.
6. If the design uses idle-node reuse, define:
   - fixed main/sub nodes
   - shared idle nodes
   - internal port ranges
   - how Nginx reaches those ports
7. For file placement, separate:
   - hot/latest files
   - archive/old files
   - file metadata ownership
   - direct Nginx file serving versus app-mediated file serving
8. For DB planning, separate:
   - per-system CAS budget
   - per-instance connection-pool budget
   - when a new DB server must be added
   - what “shared” means and what it does not mean
9. Prefer incremental rollout:
   - start with one system
   - validate web instance placement and DB connectivity
   - validate Nginx upstream reachability
   - only then scale the pattern to more systems

## Operations-System Build Rules

When the request is about how systems are developed and shipped:

1. Treat the operations system as the central scaffolding authority.
2. Generate screen, menu, feature, and backend scaffolds from the operations system instead of hand-creating them on each runtime project server.
3. Build common runtime artifacts in the operations system first.
4. Build project-specific artifacts in the operations system second.
5. Publish versioned artifacts for runtime consumption.
6. Runtime servers should receive artifacts and configuration, not act as the primary build origin.
7. Prefer common jars and shared runtime modules for stable controller/service contracts with low import churn.
8. Keep project-specific thin layers small and explicit.

## tmux Working Rules

Use tmux for topology and rollout work when more than one node or control-plane role is involved.

Recommended baseline:

- 1 tmux session for one active system rollout
- 4 tmux windows minimum:
  - `control`: Jenkins, Nomad, and deployment scripts
  - `main`: main web node checks and Nginx state
  - `sub`: sub web node or archive-node checks
  - `db`: DB connectivity, CAS, and backup verification

When shared idle nodes are involved, add:

- 1 extra window named `idle-pool`

When two systems are being coordinated in parallel, prefer:

- 2 tmux sessions, one per system
- keep Jenkins/Nomad control in one session only if the rollout order is serialized

Do not run unrelated project rollouts in the same pane group when they share Nginx, Nomad, or DB verification steps.

## Current Design Rules

- Do not describe clustered servers as if RAM becomes one shared heap.
- Do not describe DB CAS or DB memory as automatically shareable across nodes.
- Keep DB off file-serving and archive-serving nodes whenever possible.
- If file-serving must be colocated with web runtime, keep it off DB nodes.
- Prefer direct Nginx file serving over app-mediated file download.
- Prefer `storage_id` or server number mapping over storing raw file-server IPs in business data.
- For 1 GB class nodes, assume one meaningful app instance per node unless measured otherwise.
- When a topology uses fixed main/sub web nodes plus shared idle nodes, document that as a hybrid model, not a fully shared cluster.
- When Jenkins and Nomad are colocated, treat that as a small-environment compromise.
- When the operations system is the build authority, document where common jars are built, versioned, and consumed.
- Prefer project selection plus folder-mapping metadata over ad hoc path edits during scaffold generation.

## Recommended Decision Order

1. Decide whether DB is per-system or grouped.
2. Decide which servers are fixed main/sub web nodes.
3. Decide whether hot/latest files stay on the main node or on a dedicated file server.
4. Decide where archive files live.
5. Decide whether shared idle nodes are manual or Nomad-managed.
6. Decide whether scaffolding, build, and deploy are centralized in the operations system.
7. Decide how Nginx reaches temporary instances.
8. Decide the per-system DB connection ceiling before increasing app instance counts.
9. Decide the tmux operator layout before parallel rollout work starts.

## Required Checks

- Is DB completely separated from file-serving and archive-serving roles?
- Are main/sub web nodes fixed and documented?
- Are shared idle nodes clearly separated from fixed nodes?
- Are Nginx entrypoints and internal upstream ports explicitly defined?
- Is per-system CAS budget defined before adding more web instances?
- Is Jenkins plus Nomad colocated intentionally rather than accidentally?
- Is file metadata ownership defined separately from actual file placement?
- Is the proposed topology simple enough for current memory and disk limits?
- Is the operations system clearly defined as the scaffold/build authority or not?
- Are tmux session and window counts explicit for the rollout complexity?

## Delivery Shape

For a topology request, produce:

- the proposed node-role map
- scaffold/build/deploy ownership
- what is fixed per system
- what is shared across systems
- DB boundaries
- file boundaries
- Nginx and internal port flow
- tmux working layout when operators must touch more than one node family
- rollout order
- operational risks and what to verify first
