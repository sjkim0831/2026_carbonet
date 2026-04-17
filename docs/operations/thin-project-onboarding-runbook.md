# Thin Project Onboarding Runbook

Generated on 2026-04-17 for Carbonet Platform Operations.

## Goal
Add a new project (e.g., P004) to the Carbonet Platform using the Thin Project Package architecture, completely isolated from `carbonet-common-core`.

## Prerequisites
- Maven 3.9+
- JDK 17+
- Access to `ops/scripts`

## Step 1: Create the Project Adapter Module
A thin project does not need the entire Carbonet source code. It only needs an adapter module.

1. Create a new directory under `projects/`: `projects/p004-adapter`
2. Create a minimal `pom.xml`:
   ```xml
   <project ...>
       <parent>
           <groupId>egovframework</groupId>
           <artifactId>carbonet</artifactId>
           <version>1.0.0</version>
       </parent>
       <artifactId>p004-adapter</artifactId>
       <dependencies>
           <dependency>
               <groupId>egovframework</groupId>
               <artifactId>carbonet-common-core</artifactId>
           </dependency>
       </dependencies>
   </project>
   ```

## Step 2: Implement Binding Ports
Implement the project-specific behavior by overriding the common-core default ports.

1. Create `P004MenuAdapter.java` implementing `egovframework.com.common.adapter.ProjectMenuPort`.
   - Annotate with `@Component`.
   - Return custom menu items and hidden common menus.
2. Create `P004AuthorityAdapter.java` implementing `egovframework.com.common.adapter.ProjectAuthorityPort`.
   - Annotate with `@Component`.
   - Define custom access rules.

## Step 3: Register Source of Truth
The platform needs to know about P004 to manage its lifecycle and database binding.

1. Edit `data/version-control/project-runtime-manifest.json`:
   - Add a new block under `projects` with `"projectId": "P004"`.
   - Define `bindings.database.url` and `bindings.database.schema` for P004's exclusive database.
   - Set `installations.adapter` to the new adapter version (e.g., `1.0.0`).

## Step 4: Build and Bootstrap
Package the new adapter and assemble the independent runtime.

```bash
# Build the adapter
mvn -pl projects/p004-adapter clean package

# Bootstrap the runtime environment
bash ops/scripts/bootstrap-thin-project.sh P004

# Verify the adapter jar was copied
ls -l var/run/project-runtime/P004/lib/
```

## Step 5: Start the Runtime
Use the management script to spin up the P004 process.

```bash
# Start
bash ops/scripts/manage-project-runtime.sh start P004

# Check Status
bash ops/scripts/manage-project-runtime.sh status P004
```

## Step 6: Package Governance (Operations Console)
1. Navigate to `/admin/system/package-governance` in the Operations Console UI.
2. P004 will appear in the Fleet Overview.
3. Use the "Manage" button to review its versions, compatibility matrix, and perform future upgrades.
