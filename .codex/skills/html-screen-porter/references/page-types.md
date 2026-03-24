# Page Types

## Allowed types

- `LIST`
- `DETAIL`
- `EDIT`
- `CREATE`
- `APPROVE`
- `AUTHORITY`
- `LOG`
- `WORKSPACE`

## Identification guide

### LIST

Use when the page has:
- search filters
- result summary
- table or card list
- row actions

Required frame:
- search card
- result toolbar
- table section

### DETAIL

Use when the page is mostly read-only and shows one entity.

Required frame:
- lookup context strip
- detail section layout
- bottom action bar

### EDIT

Use when the page modifies an existing entity and carries existing context.

Required frame:
- lookup context strip
- edit page frame
- bottom action bar

### CREATE

Use when the page creates a new entity and has no required parent record context.

Required frame:
- create page frame
- bottom action bar

### APPROVE

Use when the page includes approval, rejection, pending review, or decision actions.

Required frame:
- approval page frame
- approval action area

### AUTHORITY

Use when the page changes permissions, roles, or policy assignment.

Required frame:
- authority page frame
- action bar

### LOG

Use when the page searches and reviews history, trace, access, audit, or error records.

Required frame:
- search card
- log result table
- trace or detail drawer if needed
