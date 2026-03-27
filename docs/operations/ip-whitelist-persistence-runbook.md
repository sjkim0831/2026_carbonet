# IP Whitelist Persistence Runbook

## Purpose

Apply, verify, and rollback the DB-backed persistence layer for `/admin/system/ip_whitelist`.

This runbook covers:

- schema creation
- initial seed loading
- repeatable seed refresh
- verification queries
- rollback order

## Files

- Schema + initial seed:
  [`docs/sql/20260328_ip_whitelist_persistence.sql`](/opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence.sql)
- Repeatable seed refresh:
  [`docs/sql/20260328_ip_whitelist_persistence_migration.sql`](/opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence_migration.sql)
- Rollback:
  [`docs/sql/20260328_ip_whitelist_persistence_rollback.sql`](/opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence_rollback.sql)

## Preconditions

- Target DB is `carbonet`.
- Application datasource currently points to:
  `jdbc:cubrid:${CUBRID_HOST:127.0.0.1}:33000:carbonet:::?charset=UTF-8`
- Backend code with `IpWhitelistPersistenceService` is already deployed or will be deployed together.
- DB operator has a working CUBRID client path. In this workspace, the wrapper script expects:
  `/opt/util/cubrid/11.2/scripts/csql_local.sh`

## Apply

### 1. First-time schema apply

Run this only when the tables do not exist yet.

```bash
/opt/util/cubrid/11.2/scripts/csql_local.sh -u dba carbonet -i /opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence.sql
```

This creates:

- `COMTNIPWHITELISTRULE`
- `COMTNIPWHITELISTREQUEST`
- supporting indexes
- FK from rule to request
- baseline seed rows used by the current admin screen

### 2. Repeatable seed refresh

After schema exists, use this file for safe re-seeding of the bundled baseline rows.

```bash
/opt/util/cubrid/11.2/scripts/csql_local.sh -u dba carbonet -i /opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence_migration.sql
```

Use this when:

- local/dev DB needs the default rows back
- baseline data drifted and should be reset
- a fresh environment already has the tables but not the expected seed rows

## Verify

### Table existence

```sql
SELECT class_name
FROM db_class
WHERE class_name IN ('comtnipwhitelistrule', 'comtnipwhitelistrequest');
```

Expected:

- `comtnipwhitelistrule`
- `comtnipwhitelistrequest`

### Seed row counts

```sql
SELECT COUNT(*) AS RULE_COUNT
FROM COMTNIPWHITELISTRULE;

SELECT COUNT(*) AS REQUEST_COUNT
FROM COMTNIPWHITELISTREQUEST;
```

Expected minimum after first apply:

- `RULE_COUNT >= 4`
- `REQUEST_COUNT >= 3`

### Baseline row check

```sql
SELECT RULE_ID, STATUS, ACCESS_SCOPE, IP_ADDRESS
FROM COMTNIPWHITELISTRULE
ORDER BY RULE_ID;

SELECT REQUEST_ID, APPROVAL_STATUS, ACCESS_SCOPE, IP_ADDRESS
FROM COMTNIPWHITELISTREQUEST
ORDER BY REQUEST_ID;
```

Expected baseline IDs:

- rules: `WL-001`, `WL-002`, `WL-003`, `WL-004`
- requests: `REQ-240312-01`, `REQ-240311-07`, `REQ-240307-02`

### Application verification

1. Open `http://localhost:18000/admin/system/ip_whitelist`
2. Register a temporary allowlist request
3. Refresh the page
4. Confirm the request still exists
5. Approve or reject the request
6. Refresh again
7. Confirm request status and rule status persist

### Direct persistence check

After registering or deciding in UI:

```sql
SELECT REQUEST_ID, APPROVAL_STATUS, REVIEW_NOTE, REVIEWED_AT
FROM COMTNIPWHITELISTREQUEST
ORDER BY REQUESTED_AT DESC;

SELECT RULE_ID, REQUEST_ID, STATUS, UPDATED_AT
FROM COMTNIPWHITELISTRULE
ORDER BY UPDATED_AT DESC;
```

## Rollback

### Seed-only rollback

Use this to remove only the bundled baseline data.

```bash
/opt/util/cubrid/11.2/scripts/csql_local.sh -u dba carbonet -i /opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence_rollback.sql
```

This file:

- deletes the baseline seed rows
- leaves operator-created rows untouched unless they share the same IDs
- includes verification queries
- leaves full table drop commands commented out

### Full destructive rollback

Only run the commented `DROP` section in
[`docs/sql/20260328_ip_whitelist_persistence_rollback.sql`](/opt/projects/carbonet/docs/sql/20260328_ip_whitelist_persistence_rollback.sql)
when:

- the feature must be removed entirely
- no retained operator history is required
- backend code is being rolled back at the same time

Recommended order:

1. stop request traffic to the screen
2. export retained rows if needed
3. run seed cleanup
4. verify no required rows remain
5. drop FK
6. drop indexes
7. drop tables
8. redeploy code without DB-backed persistence if applicable

## Failure notes

- If the wrapper script fails with `unknown user cubrid`, the machine is missing the expected OS account.
- If `csql` is not found, run from a host where the CUBRID client is installed and the wrapper script is valid.
- If schema apply partially succeeds, do not rerun the schema file blindly. Verify existing objects first, then continue with the migration file.

## Recommended operator sequence

For a normal first rollout:

1. deploy backend/frontend code
2. apply `20260328_ip_whitelist_persistence.sql`
3. verify row presence with SQL
4. open the admin screen and test create/approve/reject
5. keep `20260328_ip_whitelist_persistence_migration.sql` for future baseline refresh
6. keep `20260328_ip_whitelist_persistence_rollback.sql` for rollback evidence and cleanup
