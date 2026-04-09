# Builder Structure Owner Checklist

## Goal

Give the current owner one short execution checklist for builder structure-governance decisions.

Use this when the request is any of:

- continue the builder structure cleanup
- decide whether a builder path is canonical
- decide whether an old path is a shim or delete target
- decide whether the current builder wave is already closed

## Read Order

1. `docs/architecture/builder-structure-wave-20260409-closure.md`
2. `docs/architecture/builder-source-of-truth-matrix.md`
3. `docs/architecture/system-folder-structure-alignment.md`
4. `docs/architecture/builder-folder-refactor-priority-map.md`
5. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-structure-wave-closeout.md`

## Decision Checklist

### 1. Confirm The Family

Confirm that the current question is still about:

- `BUILDER_STRUCTURE_GOVERNANCE`

If the question is really about resource movement, shim removal, or control-plane composition, do not pretend this same family is still being closed.

## 2. Confirm The Canonical Path

Use `builder-source-of-truth-matrix.md`.

Ask:

- is the path explicitly listed as canonical
- is the competing path explicitly non-canonical

If no:

- do not improvise a new canonical answer in a random note
- update the closure documents first or leave the family open

## 3. Decide Old Path Treatment

Use this order:

1. if no remaining entry needs the old path, choose `DELETE`
2. if one remaining entry still needs it and the path is extension-free, choose `EXPLICIT_SHIM`
3. if the old path is still growing, choose `NOT_CLOSED`

Do not use vague terms like:

- maybe keep for now
- temporary duplicate
- still shared a bit

Use one of:

- `DELETE`
- `EXPLICIT_SHIM`
- `NOT_CLOSED`

## 4. Apply Large-Move Closure Correctly

Ask:

- is the claim only about the selected family
- are remaining open families named explicitly

If no:

- do not say the wave is complete

If yes:

- it is valid to say the builder structure-governance family is closed

## 5. Record The Output

Any owner output should include:

- closed family
- family source of truth
- canonical path answer
- old path treatment
- what is still not closed

## Required Output Phrase

Use a phrase close to:

`HANDOFF READY: builder structure-governance closure remains frozen; continue from the next family without reopening source-of-truth debate.`

Or, if closure is not valid:

`BLOCKED: builder structure-governance closure cannot be claimed because canonical path or old-path treatment is still ambiguous.`

## Not In Scope

This checklist does not authorize:

- backend implementation
- frontend implementation
- runtime verification claims
- repository-wide builder completion claims

## Next Step After This Checklist

If the structure-governance family is already closed, continue with:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

instead of reopening the same source-of-truth decision.
