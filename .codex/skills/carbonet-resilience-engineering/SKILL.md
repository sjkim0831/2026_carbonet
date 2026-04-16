---
name: carbonet-resilience-engineering
description: Guide for implementing resilience patterns and Chaos Engineering within the Carbonet platform, focusing on moving beyond simple instance termination towards comprehensive reliability engineering, observability-driven verification, and self-healing systems.
---

# Carbonet Resilience Engineering

Use this skill when the task involves designing, implementing, or testing system reliability, including fault injection, observability for resilience, and self-healing mechanisms.

## Core Mandates

1.  **Steady State First:** Always define the "Steady State" (normal behavior) before proposing or executing a resilience experiment.
2.  **Blast Radius Control:** Limit the potential impact of any experiment. Start small and expand only after validation.
3.  **Kill Switch Required:** Every resilience experiment must have an immediate, verifiable stop mechanism.
4.  **Observability-Driven:** Use metrics and distributed tracing to verify the system's response to injected faults.

## Workflow

1.  **System Inventory & Topology Mapping:**
    - Identify all APIs, services, and assets.
    - Map dependencies to understand potential cascading failures.
2.  **Hypothesis Generation:**
    - "If we inject [Fault X] into [Component Y], then [Component Z] should [Expected Behavior]."
3.  **Experiment Design:**
    - Define the fault (latency, 5xx, node kill, network partition).
    - Define the blast radius (specific pods, nodes, or percentage of traffic).
    - Identify the monitoring signals to track during the experiment.
4.  **Resilience Pattern Application:**
    - Implement Circuit Breakers, Bulkheads, or Retries to mitigate the hypothesized failures.
    - Configure Graceful Degradation fallbacks.
5.  **Execution & Verification:**
    - Run the experiment in a controlled environment (staging first).
    - Compare actual behavior against the hypothesis.
6.  **Analysis & Remediation:**
    - Identify weaknesses exposed by the experiment.
    - Propose and implement fixes to improve resilience.
7.  **Continuous Verification:**
    - Automate the experiment as part of the CI/CD pipeline.

## Resilience Checkpoints

- **Circuit Breakers:** Are they tuned correctly for the specific workload?
- **Timeouts:** Are they aggressive enough to prevent resource exhaustion but conservative enough to avoid false positives?
- **Bulkheads:** Are critical system resources (threads, memory) isolated from non-critical failures?
- **Observability:** Can we detect a failure within seconds? Is the root cause identifiable from existing logs and metrics?
- **Self-Healing:** Can the system automatically recover (e.g., restart a pod, failover to a different node)?

## Recommended Reading

- [`/opt/projects/carbonet/docs/architecture/resilience-and-chaos-engineering.md`](/opt/projects/carbonet/docs/architecture/resilience-and-chaos-engineering.md)
- [`/opt/projects/carbonet/docs/ai/80-skills/skill-boundaries.md`](/opt/projects/carbonet/docs/ai/80-skills/skill-boundaries.md)
