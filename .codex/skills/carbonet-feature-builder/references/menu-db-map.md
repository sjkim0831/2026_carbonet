# Carbonet Menu and DB Map

## Menu metadata tables

- `COMTCCMMNDETAILCODE`
  - Stores menu hierarchy labels and code metadata
  - Admin menu code set uses `CODE_ID = 'AMENU1'`
  - Home or user menu code set uses `CODE_ID = 'HMENU1'`
- `COMTNMENUINFO`
  - Stores page-level menu URL and icon metadata
- `COMTNMENUFUNCTIONINFO`
  - Stores page feature catalog entries
- `COMTNAUTHORINFO`
  - Stores role definitions
- `COMTNAUTHORFUNCTIONRELATE`
  - Maps roles to feature codes
- `COMTNEMPLYRSCRTYESTBS`
  - Maps user security targets to author codes

## Menu code hierarchy

- Length `4`: top domain
- Length `6`: group under a domain
- Length `8`: page node

The current admin menu builder reads this hierarchy directly. Do not change code length semantics for a normal feature request.

## Route and menu relationship

- A page that must appear in managed menus usually needs:
  - one detail code row in `COMTCCMMNDETAILCODE`
  - one `COMTNMENUINFO` row with URL and icon
- A page that must participate in function permission checks usually also needs:
  - one or more `COMTNMENUFUNCTIONINFO` rows

## Existing query semantics

- Admin feature catalog combines:
  - `COMTNMENUFUNCTIONINFO`
  - `COMTNMENUINFO`
  - `COMTCCMMNDETAILCODE`
- Page management list queries target 8-character menu codes only
- Authority queries infer menu family from the menu-code prefix:
  - `A...` -> admin / `AMENU1`
  - `H...` -> home or user / `HMENU1`

## Practical implementation rules

- When adding a new admin screen, check whether the screen is only a route/template or a managed page
- If it is a managed page, update both the code table and the menu info table
- If roles must control behavior beyond page entry, define explicit feature codes
- Prefer feature-code naming that ends with action suffixes such as `_VIEW`, `_CREATE`, `_UPDATE`, `_DELETE` when consistent with nearby modules
- If you add a view-protected page, verify whether the security layer expects a `%_VIEW` feature code for the route

## Relevant reference files in the repo

- `src/main/resources/egovframework/mapper/com/feature/admin/AdminCodeManageMapper.xml`
- `src/main/resources/egovframework/mapper/com/feature/admin/MenuFeatureManageMapper.xml`
- `src/main/resources/egovframework/mapper/com/feature/admin/AuthGroupManageMapper.xml`
- `src/main/java/egovframework/com/feature/admin/web/AdminMenuController.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminSystemCodeController.java`
