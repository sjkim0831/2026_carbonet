# Builder Install Deploy Closeout Checklist

## Goal

Define the minimum closeout required before claiming that a builder-managed page or page family is installable and deployable.

Use this document together with:

- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/system-builder-project-domain-install-target.md`
- `docs/architecture/large-move-completion-contract.md`

## Closeout Checklist

### 1. Install Readiness

- page or page family manifest exists
- install scope is explicit
- required binding inputs are explicit
- compatibility checks are explicit
- validator output shape is explicit

### 2. Project Binding Readiness

- menu binding rule is explicit
- route binding rule is explicit
- authority override rule is explicit
- theme or presentation override rule is explicit where relevant
- project executor handoff is explicit where write-heavy logic exists

### 3. Packaging Readiness

- packaging owner path is explicit
- app assembly owner path is explicit
- module/resource source of truth is explicit
- fallback root paths are removed or documented as explicit shims

### 4. Runtime Deploy Readiness

- target runtime URL is known
- bootstrap payload target is known
- compare or parity target is known where relevant
- restart or deploy sequence is known
- freshness verification sequence is known

### 5. Evidence Readiness

- validator evidence path is known
- deploy evidence path is known
- rollback evidence path is known
- audit or trace linkage is known

## Not Ready

Treat install/deploy closeout as incomplete when:

- page installs only by source copy
- project binding values are still guessed manually
- runtime package owner is unclear
- resource ownership still silently falls back to legacy root paths
- runtime verification target is not named

## Closeout Sentence

Use this sentence when ready:

`CLOSED: builder install and deploy closeout is complete for <page-family>; install inputs, project bindings, packaging source of truth, runtime target, and evidence surfaces are explicit.`
