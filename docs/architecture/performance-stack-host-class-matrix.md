# Performance Stack Host-Class Matrix

Generated on 2026-03-21 for Resonance speed-first optional stack placement.

## Goal

Define where each optional performance stack should run without bloating thin runtime nodes.

## Host Classes

- `CONTROL_PLANE`
  - design, build, governance
- `RUNTIME_MAIN`
  - main web node
- `RUNTIME_SUB`
  - sub rollout node
- `RUNTIME_IDLE`
  - extra web capacity node
- `SUPPORT_NODE`
  - cache, queue, search, metrics, AI, archive

## Stack Placement Matrix

| Stack | Preferred Host Class | Allowed On 1GB Runtime Node | Notes |
|---|---|---:|---|
| Nginx micro-cache | `RUNTIME_MAIN`, `RUNTIME_SUB` | Yes | read-heavy response optimization |
| Brotli/gzip asset delivery | `RUNTIME_MAIN`, `RUNTIME_SUB` | Yes | static asset acceleration |
| Redis | `SUPPORT_NODE` | No | use separate node when possible |
| In-process cache | `RUNTIME_MAIN`, `RUNTIME_SUB` | Yes | keep bounded memory |
| Summary tables | `PROJECT_DB` or `SUPPORT_NODE` | N/A | DB-side acceleration |
| Worker queue | `SUPPORT_NODE` | No | offload heavy jobs |
| Prometheus/Grafana | `SUPPORT_NODE`, `CONTROL_PLANE` | No | avoid on runtime nodes |
| Loki | `SUPPORT_NODE` | No | lighter than ELK |
| ELK | `SUPPORT_NODE` | No | only when scale justifies it |
| Ollama runner | `SUPPORT_NODE` | No | dedicated AI node only |

## Placement Rule

Use this rule:

- runtime nodes keep only thin web runtime plus bounded in-process helpers
- cache/search/queue/AI heavy services prefer support nodes
- every placement decision should be recorded per project or global platform class
