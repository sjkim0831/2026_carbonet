# Builder Editor Runtime Module Split

## Goal

Clarify one architectural rule for future extraction:

- the runtime builder framework is not the same thing as the admin editor tool

This matters because a new project may want:

- shared runtime builder support
- shared install/bind/validate contracts
- but not necessarily the full Carbonet admin editing console in the same artifact

## Core Rule

Split builder-related assets into at least these lanes:

1. `screenbuilder-core`
2. `screenbuilder-runtime-common-adapter`
3. `screenbuilder-project-binding-adapter`
4. `screenbuilder-editor-admin`

## What Each Lane Means

### `screenbuilder-core`

Owns:

- schema model
- draft/publish/version services
- validation rules
- runtime-facing contracts
- shared storage and support ports

Does not own:

- project menu/service wiring
- admin console controllers
- theme registry UI
- editor-only workflow chrome

### `screenbuilder-runtime-common-adapter`

Owns:

- property-backed default policy ports
- common runtime naming/binding defaults
- request-context defaults
- common compare-policy defaults

Does not own:

- project business reads
- project bridge services
- admin editor-only actions

### `screenbuilder-project-binding-adapter`

Owns:

- project menu catalog reads
- project authority bindings
- project runtime compare bridges
- project route binding
- project-local wrappers and compatibility shims

### `screenbuilder-editor-admin`

Owns:

- admin editor controllers
- package-builder UI
- registry/detail/install/validator/rollback consoles
- editor workflow actions
- theme/API package administration UI

Does not own:

- shared runtime contracts
- project business transactions
- theme asset bundles themselves

## Theme Rule

Theme packages may be folder-driven.

That means a theme can be prepared as:

- one folder of tokens
- one folder of frame overrides
- one folder of component overrides
- one folder of preview assets

Then copied, renamed, and edited as a new theme package.

This is acceptable if:

- the folder stays in `THEME_PRESENTATION`
- the package remains manifest-driven
- business logic does not move into the theme folder

## Practical Delivery Rule

For fast adoption:

- runtime framework jars should stay separate from editor/admin jars
- themes should stay as folder/package assets
- projects should bind those packages through thin adapters and config

This makes these later moves easier:

- use runtime without the full admin editor
- upgrade editor without rewriting runtime
- upgrade theme packages without changing project business code

## Success Test

The split is good enough when:

- a project can import runtime builder support without importing the full admin editor
- the editor can evolve as a separate admin product
- theme packages can be copied and modified by folder/package unit
- project customization remains binding/config driven
