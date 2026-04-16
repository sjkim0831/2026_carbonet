# Resilience and Chaos Engineering in Carbonet

This document outlines the strategy for implementing resilience patterns and Chaos Engineering within the Carbonet platform, moving beyond basic "Chaos Monkey" concepts towards a comprehensive reliability framework.

## 1. Core Philosophy
Resilience is not just about avoiding failure; it's about the system's ability to remain functional under stress and recover gracefully from disruptions. In Carbonet, we adopt the "Continuous Verification" approach to proactively identify weaknesses before they become production incidents.

## 2. The Evolution: Beyond Chaos Monkey
While the original Chaos Monkey focused on random instance termination, modern resilience engineering at Carbonet encompasses:

### 2.1. Full-Spectrum Fault Injection
- **Infrastructure Layer:** Random node/pod termination (Chaos Monkey/Gorilla).
- **Network Layer:** Latency injection, packet loss, and partition simulation.
- **Application Layer:** Injecting 5xx errors, malformed responses, and dependency failures.
- **Resource Layer:** CPU/Memory hogging and disk I/O throttling.

### 2.2. Observability as a Prerequisite (The "Scan")
Before injecting chaos, the system must be "scanned" to establish a **Steady State**:
- **Inventory:** Automated mapping of all APIs, services, and assets.
- **Metrics:** Real-time visibility into Latency, Error Rates, Saturation, and Throughput (Golden Signals).
- **Topology:** Understanding service dependencies to predict the "Blast Radius".

## 3. Resilience Patterns
Systems must be designed to handle the faults injected by chaos experiments:

- **Circuit Breaker:** Prevents cascading failures by tripping when a downstream service is unhealthy.
- **Bulkheads:** Isolates critical resources so a failure in one component doesn't exhaust resources for others.
- **Adaptive Concurrency Limits:** Dynamically adjusts the number of allowed requests based on system health.
- **Graceful Degradation:** Providing a fallback or "essential-only" service when full functionality is unavailable.

## 4. Implementation Roadmap

### Phase 1: Observability & Baseline (Current Focus)
- Enhance `carbonet-builder-observability` to provide a full inventory scan.
- Establish baseline performance metrics for all critical paths.

### Phase 2: Controlled Experiments (Game Days)
- Manual, scheduled fault injection in staging environments.
- Verifying that Circuit Breakers and Timeouts work as expected.

### Phase 3: Automated Chaos (The Monkey)
- Introducing random, automated disruptions within a controlled "Blast Radius".
- Continuous verification in CI/CD pipelines.

### Phase 4: Self-Healing
- Automated recovery actions triggered by observability signals.
- AIOps-driven anomaly detection and proactive mitigation.

## 5. Security & Safety
- **Blast Radius Control:** Experiments must be scoped to minimize impact.
- **Kill Switch:** Every chaos experiment must have an immediate manual and automated stop mechanism.
- **No-Go Times:** No chaos experiments during critical business hours or known maintenance windows.
