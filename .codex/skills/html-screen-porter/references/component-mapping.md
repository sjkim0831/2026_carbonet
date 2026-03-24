# Component Mapping

Map HTML blocks to shared React pieces before introducing new layout code.

## Search and list

- search header -> `SearchFilterCard` or list search frame
- summary count -> result toolbar summary block
- excel/create actions -> shared list action bar
- data table -> existing list table pattern for the screen family

## Detail and edit

- entity summary strip -> `LookupContextStrip`
- read-only info grid -> detail section block
- form group -> `AdminInput`, `AdminSelect`, `AdminCheckbox`
- bottom submit/cancel area -> shared `ActionBar` or member action bar

## Status and errors

- empty state
- permission denied
- query failure
- save success/failure

Use:
- `PageStatusNotice`

Do not invent one-off alert boxes unless the family has no shared state component yet.

## Buttons and fields

- raw `<button>` -> shared button component or existing helper class
- raw `<input>` -> `AdminInput`
- raw `<select>` -> `AdminSelect`
- raw `<input type=\"checkbox\">` -> `AdminCheckbox`

## Menu context

- hidden detail/edit screen -> explicit menu context rule
- visible menu entry -> visible menu item with its own active mapping
