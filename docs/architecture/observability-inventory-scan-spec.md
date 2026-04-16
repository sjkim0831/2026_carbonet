# Observability Inventory Scan Specification

This specification defines the "Virus Scan" style 전수 조사 (Full Inventory Scan) required to establish a baseline for Chaos Engineering and general system health in Carbonet.

## 1. Objective
To automatically discover, catalog, and monitor every functional component (API, Function, Asset) within the Carbonet runtime environment to ensure 100% visibility before injecting faults.

## 2. Scan Targets

### 2.1. API Layer (Web/REST)
- **Endpoint Discovery:** Automated scanning of `@RequestMapping` and `@RestController` definitions.
- **Contract Metadata:** Method, Path, Parameters, and expected Response types.
- **Authentication Scope:** Which endpoints require which roles.

### 2.2. Functional Layer (Service/Logic)
- **Core Services:** Listing all `@Service` beans and their public methods.
- **Dependency Map:** Which services call which other services (Circular Dependency Check).
- **External Integrations:** Identifying all outgoing calls (HTTP clients, SMTP, External APIs).

### 2.3. Data Layer (Assets)
- **Database Schema:** Scanning `CUBRID` tables, indexes, and constraints.
- **Connection Pools:** Monitoring active/idle connections per project project.
- **File Assets:** Cataloging configuration files, binary releases, and static resources.

## 3. The "Scan" Process

1.  **Bootstrap Scan:** Triggered during application startup to map the static topology.
2.  **Runtime Heartbeat:** Continuous "ping" style checks to verify the existence and responsiveness of assets.
3.  **Integrity Check:** Comparing the current runtime state against the "Version Governance" baseline (SQL, Code SHA, Config).
4.  **Reporting:** Generating a "Health Inventory Report" (e.g., "98% of identified assets are healthy").

## 4. Implementation Steps in Carbonet

- **`carbonet-builder-observability` Extension:** 
    - Implement a `ProjectAssetScanner` service.
    - Create a Registry for all discovered `Asset` types.
- **Admin UI Console:**
    - New Menu: `/admin/system/observability/inventory`
    - Visualization: A tree/graph view showing the hierarchy from Server -> Service -> API -> Method.
- **Integrity Baseline:**
    - Link the scan results to `PROJECT_VERSION_GOVERNANCE` to detect unauthorized drift.

## 5. Integration with Chaos Monkey
The Chaos Monkey (implemented via `carbonet-resilience-engineering`) will use this scan data to:
1.  **Select Targets:** "Randomly select 1 API from the 'Payment' category for latency injection."
2.  **Verify Impact:** "The scan shows 10 assets were impacted by the failure; verify if all returned to 'Steady State' after the experiment."
