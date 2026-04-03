# Banner Management Meta Runbook

## Purpose

Apply and verify the sidecar metadata storage used by `/admin/content/banner_list` and `/admin/content/banner_edit`.

This runbook covers:

- schema creation for banner-side metadata
- verification queries
- application behavior after schema apply
- failure notes for local environments missing the CUBRID OS account or client

## Files

- Schema:
  [`docs/sql/20260331_banner_management_meta.sql`](/opt/projects/carbonet/docs/sql/20260331_banner_management_meta.sql)
- Repeatable seed refresh:
  [`docs/sql/20260331_banner_management_meta_migration.sql`](/opt/projects/carbonet/docs/sql/20260331_banner_management_meta_migration.sql)
- Rollback:
  [`docs/sql/20260331_banner_management_meta_rollback.sql`](/opt/projects/carbonet/docs/sql/20260331_banner_management_meta_rollback.sql)

## Scope

`COMTNBANNER` remains the baseline table for:

- banner name
- link URL
- image fields
- reflect flag
- sort order

`COMTNBANNERMETA` adds React admin management fields that do not exist in the baseline schema:

- English banner title
- Korean and English placement labels
- status code
- start and end schedule
- click count
- English note

## Preconditions

- Target DB is `carbonet`.
- Baseline `COMTNBANNER` already exists.
- Backend code including
  [`AdminBannerManagementMetaMapper.java`](/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/mapper/AdminBannerManagementMetaMapper.java)
  is already deployed or will be deployed together.
- A working CUBRID client is available.

## Apply

Run:

```bash
/opt/util/cubrid/11.2/scripts/csql_local.sh -u dba carbonet -i /opt/projects/carbonet/docs/sql/20260331_banner_management_meta.sql
```

If the local wrapper fails because the OS account `cubrid` does not exist, run the same SQL from a host where:

- the `cubrid` account exists, or
- `csql` is available directly with valid `CUBRID`, `CUBRID_DATABASES`, and `LD_LIBRARY_PATH`

## Seed Refresh

After the schema exists, refresh the bundled baseline rows with:

```bash
/opt/util/cubrid/11.2/scripts/csql_local.sh -u dba carbonet -i /opt/projects/carbonet/docs/sql/20260331_banner_management_meta_migration.sql
```

Use this when:

- a local or dev DB already has `COMTNBANNERMETA`
- the default banner metadata rows should be restored
- the four bundled banner IDs need to be reset to the current screen baseline

## Verify

### Table existence

```sql
SELECT class_name
FROM db_class
WHERE class_name IN ('comtnbanner', 'comtnbannermeta');
```

Expected:

- `comtnbanner`
- `comtnbannermeta`

### Column sanity

```sql
SELECT attr_name
FROM db_attribute
WHERE class_name = 'comtnbannermeta'
ORDER BY def_order;
```

Expected columns:

- `banner_id`
- `banner_nm_en`
- `placement_ko`
- `placement_en`
- `status_code`
- `start_at`
- `end_at`
- `click_count`
- `note_en`
- `frst_register_id`
- `frst_regist_pnttm`
- `last_updusr_id`
- `last_updt_pnttm`

### Row check

Immediately after schema apply, row count may still be `0`.

```sql
SELECT COUNT(*) AS META_COUNT
FROM COMTNBANNERMETA;
```

After an operator saves a banner through the admin screen, verify:

```sql
SELECT
    BANNER_ID,
    BANNER_NM_EN,
    PLACEMENT_KO,
    PLACEMENT_EN,
    STATUS_CODE,
    TO_CHAR(START_AT, 'YYYY-MM-DD HH24:MI') AS START_AT,
    TO_CHAR(END_AT, 'YYYY-MM-DD HH24:MI') AS END_AT,
    CLICK_COUNT,
    LAST_UPDUSR_ID
FROM COMTNBANNERMETA
ORDER BY LAST_UPDT_PNTTM DESC, BANNER_ID DESC;
```

### Baseline seed check

After running the migration file, expected bundled IDs are:

- `BNR-240301`
- `BNR-240288`
- `BNR-240271`
- `BNR-240199`

## Application Verification

1. Sign in to admin.
2. Open `/admin/content/banner_list`.
3. Open any banner in `/admin/content/banner_edit`.
4. Change title, URL, status, and schedule.
5. Save.
6. Reload the edit page.
7. Confirm:
   - base fields still load
   - English title and schedule now survive beyond runtime overlay

## Failure Notes

- If `/opt/util/cubrid/11.2/scripts/csql_local.sh` fails with `unknown user cubrid`, the machine is missing the expected OS account used by the wrapper.
- If `/home/cubrid/CUBRID` does not exist, the local CUBRID client path is also missing.
- In that case, apply the SQL from another DB-capable host before expecting `COMTNBANNERMETA` persistence.
- Until then, the application continues to work with DB-backed `COMTNBANNER` plus runtime overlay fallback for meta fields.

## Rollback

### Seed-only rollback

Run:

```bash
/opt/util/cubrid/11.2/scripts/csql_local.sh -u dba carbonet -i /opt/projects/carbonet/docs/sql/20260331_banner_management_meta_rollback.sql
```

This removes only the bundled baseline metadata rows.

### Full destructive rollback

If the sidecar store must be removed entirely, uncomment the `DROP` section in
[`docs/sql/20260331_banner_management_meta_rollback.sql`](/opt/projects/carbonet/docs/sql/20260331_banner_management_meta_rollback.sql)
and run it only after verifying no retained operator data is needed.
