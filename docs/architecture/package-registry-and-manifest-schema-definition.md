# Package Registry and Manifest Schema Definition

Generated on 2026-04-16 for Carbonet independent-boot and runtime-split governance.

## Goal

Define the authoritative schema for:
- **Package Registry**: Available artifact versions (common-core, stable-gate, adapters, skeletons).
- **Compatibility Matrix**: Valid version combinations and upgrade impact classification.
- **Project Runtime Manifest**: Project-specific installation state and runtime binding.

This schema serves as the "Source of Truth" for both the build/boot scripts and the future Management Screen.

## 1. Package Registry Schema (`package-registry.json`)

Tracks every versioned artifact produced by the platform.

### Structure

```json
{
  "commonCore": [
    {
      "version": "string",          // SemVer (e.g., "1.1.0")
      "artifactId": "string",       // Maven artifactId
      "buildId": "string",          // Unique build identifier
      "storageKey": "string",       // Path to artifact (e.g., "releases/common/core-1.1.0.jar")
      "releasedAt": "ISO8601"
    }
  ],
  "stableGate": [
    {
      "version": "string",          // Gate version (e.g., "v1", "v2")
      "artifactId": "string",
      "buildId": "string",
      "storageKey": "string"
    }
  ],
  "adapters": [
    {
      "id": "string",               // Unique adapter ID (e.g., "carbonet-default-adapter")
      "version": "string",          // Adapter artifact version
      "contractVersion": "string",  // Supported Gate version (e.g., "v1")
      "artifactId": "string",
      "storageKey": "string"
    }
  ],
  "skeletons": [
    {
      "id": "string",               // "standard-runtime-skeleton"
      "version": "string",
      "requiredCore": "string"      // Version range (e.g., ">=1.0.0")
    }
  ]
}
```

## 2. Compatibility Matrix Schema (`compatibility-matrix.json`)

Defines the rules for safe upgrades.

### Structure

```json
{
  "rules": [
    {
      "sourceComponent": "commonCore",
      "sourceVersion": "string",
      "dependencies": {
        "stableGate": "string",      // e.g., ">=v1"
        "adapterContract": "string"  // e.g., "v1"
      },
      "compatibilityClass": "string", // "IMPLEMENTATION_SAFE" | "ADAPTER_SAFE" | "CONTRACT_AWARE" | "BREAKING"
      "impact": "string",            // "None" | "Low" | "Medium" | "High"
      "notes": "string"
    }
  ],
  "contracts": {
    "adapter": {
      "v1": { "status": "ACTIVE", "deprecatedAt": null },
      "v2": { "status": "BETA", "deprecatedAt": "2026-12-31" }
    }
  }
}
```

## 3. Project Runtime Manifest Schema (`project-runtime-manifest.json`)

Tracks the active state and runtime bindings for each project.

### Structure

```json
{
  "projects": {
    "PROJECT_ID": {
      "metadata": {
        "projectId": "string",
        "projectName": "string",
        "owner": "string"
      },
      "installations": {
        "commonCore": "string",       // Version from Registry
        "stableGate": "string",       // Version from Registry
        "adapter": "string",          // Version from Registry
        "adapterContract": "string"   // Contract version (v1, v2...)
      },
      "bindings": {
        "database": {
          "url": "string",
          "schema": "string"
        },
        "theme": { "id": "string", "version": "string" },
        "menu": { "profile": "string", "apiPrefix": "string" }
      },
      "runtime": {
        "packagePath": "string",      // Source JAR path (e.g., apps/project-runtime/target/...)
        "bootTarget": "string",       // Deployed JAR path (e.g., var/run/project-runtime/P001/...)
        "bootCommand": "string",      // Full java -jar command
        "status": "string",           // "RUNNING" | "STOPPED" | "UPGRADING"
        "lastHealthCheck": "ISO8601"
      },
      "governance": {
        "compatibilityClass": "string",
        "updatedAt": "ISO8601"
      }
    }
  }
}
```

## 4. Management Screen Data Model

The Management Screen should expose these views by aggregating the schemas above.

### View A: Project Fleet Overview
- **Source**: `project-runtime-manifest.json`
- **Columns**: Project ID, Name, Core Version, Gate Version, Status, Last Updated.

### View B: Upgrade Candidate Selector
- **Source**: `package-registry.json` + `compatibility-matrix.json`
- **Logic**: For a selected project, show newer versions of `commonCore`.
- **Display**: Version, Compatibility Class (e.g., "IMPLEMENTATION_SAFE"), Impact.

### View C: Artifact Inventory
- **Source**: `package-registry.json`
- **Display**: List of all Core, Gate, and Adapter artifacts with their storage locations.

### View D: Runtime Control Plane
- **Source**: `project-runtime-manifest.json`
- **Actions**: Start, Stop, Reload (triggers the `bootCommand`), Update Path.

## Rules for Evolution

1. **Schema First**: Any change to build or boot logic must be reflected in these schemas first.
2. **Backward Compatibility**: Registry entries should never be deleted once a project is bound to them.
3. **Automated Validation**: Build scripts should check the `compatibility-matrix.json` before allowing a package to be built for a project.
