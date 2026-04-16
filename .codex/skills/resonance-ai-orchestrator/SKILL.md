---
name: resonance-ai-orchestrator
description: Resonance AI Agent and Session Orchestration. Use for multi-agent collaboration, memory-augmented research, and autonomous software engineering within the Resonance framework.
---

# Resonance AI Orchestrator

This skill provides procedural guidance for the Resonance AI Framework in Carbonet.

Current Carbonet interpretation:

- treat Resonance first as `control-plane orchestration with runtime evidence`
- do not assume the repository already has a general autonomous multi-agent runtime
- prefer code-path and runtime-proof reality over aspirational architecture wording

## Core Mandates

1. **Project-First**: All orchestration must resolve a `projectId` and project-specific boundaries.
2. **Scenario-First**: No implementation starts without a governed scenario and requirement mapping.
3. **Resonance Evolution**: Use the **Reflect -> Improve -> Repeat** loop for all complex tasks.
4. **Evidence-First**: In Carbonet, Reflection is not complete until runtime or execution evidence is recorded.

## Orchestration Workflow

### 1. Research & Perceive
- Identify project boundaries using `PROJECT_PATHS.md`.
- Gather context from `docs/ai/` and `docs/architecture/`.
- Search for existing patterns in `resonance-design-patterns.md`.
- Prefer current implementation surfaces first:
  - `codex-request`
  - `sr-workbench`
  - runtime control plane
  - freshness and verification scripts

### 2. Plan & Decompose
- Break down the user request into specialized agent tasks:
  - **Planner**: Strategy and task list.
  - **Researcher**: Codebase and doc search.
  - **Executor**: Surgical code implementation.
  - **Critic**: Quality audit and parity check.

Carbonet-specific interpretation:

- if the work is about `prepare/plan/execute`, runtime compare, repair, verification, or execution console ownership, treat those as the current concrete Resonance surfaces
- do not invent abstract multi-agent lanes when the existing repository already has a governed execution or repair lane

### 3. Execute with Memory
- Check **Episodic Memory** (past logs) for similar tasks.
- Use **Semantic Memory** (RAG) to find relevant components and APIs.
- Refer to **Procedural Memory** (Skill instructions) for standard workflows.

Carbonet current-state note:

- episodic memory is often file-backed (`jsonl`) and runtime-proof-oriented
- procedural memory is strong in docs and skills
- semantic and social memory are still target-state areas, so do not overclaim them

### 4. Reflect & Validate
- Perform a **Self-Critique** before claiming success.
- Verify runtime freshness on port `:18000` using `ops/scripts/codex-verify-18000-freshness.sh`.
- Compare output against **Parity and Uniformity** standards.

Carbonet reflection rule:

- reflection may include `parity compare`, `repair open/apply`, `verification run`, and route proof
- a task touching runtime behavior is not complete until the newest packaged output is proven at `:18000`

## Tooling & Environment

- **Primary Runtime**: `:18000` (Local dev server)
- **Control Plane**: Resonance Builder screens
- **Artifacts**: Maven Jars, Frontend Bundles, SQL Migrations

## Current Strong Surfaces

- `Codex Execution Console`
- `SR Workbench execution lifecycle`
- `Runtime parity compare and repair`
- `Freshness verification`
- `File-backed execution histories`

## Current Weak Surfaces

- semantic memory and RAG
- social memory and learned preferences
- generalized multi-model routing
- self-specializing agent roles
- automatic workflow evolution

## References

- Architecture: [docs/ai/10-architecture/resonance-ai-framework.md](../../../docs/ai/10-architecture/resonance-ai-framework.md)
- Design Patterns: [docs/architecture/resonance-design-patterns.md](../../../docs/architecture/resonance-design-patterns.md)
- Separation Status: [docs/architecture/carbonet-resonance-separation-status.md](../../../docs/architecture/carbonet-resonance-separation-status.md)
- Update Patterns: [docs/ai/80-skills/resonance-skill-and-doc-update-pattern.md](../../../docs/ai/80-skills/resonance-skill-and-doc-update-pattern.md)
