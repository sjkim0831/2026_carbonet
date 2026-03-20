# Performance Stack Checklists

Generated on 2026-03-21 for Resonance optional speed stack attachment and rollback.

## Goal

Provide a repeatable checklist for attaching performance-oriented optional stacks without breaking thin runtime nodes.

## 1. Attachment Checklist

Before enabling any performance stack, confirm:

1. the stack is declared as installable and removable
2. target host class is chosen
3. memory budget is declared
4. rollback path is declared
5. affected project units are recorded
6. current runtime and target runtime compare is available

## 2. 1GB Runtime Safety Checklist

When a project uses 1GB runtime nodes, confirm:

1. no heavy cache/search/queue/AI service is attached directly to runtime web nodes
2. only bounded in-process cache and edge response helpers remain on web nodes
3. micro-cache rules do not bypass authority or personalization boundaries
4. summary-table or async offload is used before adding heavyweight runtime services

## 3. Stack-Specific Checks

### Nginx micro-cache

1. cache key and bypass rules are explicit
2. authenticated or authority-scoped pages are excluded when needed
3. purge or invalidation rule exists

### Redis

1. target support node exists
2. session or token usage is explicit
3. TTL and failure fallback are defined

### Worker queue

1. queue target node exists
2. retry and dead-letter rules are defined
3. job ownership is mapped to project or common scope

### Prometheus/Grafana or Loki

1. support node or control-plane host is selected
2. scrape and retention rules are defined
3. runtime nodes are not overloaded by exporters

## 4. Rollback Checklist

Before marking stack attachment complete, confirm:

1. disable path is tested
2. rollback target config is stored
3. post-disable smoke is defined
4. runtime package matrix reflects the new stack state
