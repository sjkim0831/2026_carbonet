---
name: admin-screen-unifier
description: Normalize existing Carbonet admin screens to one governed design system by enforcing shared status messages, action bars, menu active rules, field controls, and page-type-aligned layouts across list, detail, edit, create, approve, and authority screens.
---

# Admin Screen Unifier

Use this skill when Carbonet admin screens already exist but their layout, field height, bottom buttons, menu active behavior, or empty/error states drift apart.

Read only the references you need:

- Read [references/unification-rules.md](references/unification-rules.md) for the common UI rules.
- Read [references/page-family-checks.md](references/page-family-checks.md) for what to verify by page type.

## Workflow

1. Identify the screen family and page type.
2. Compare the target screen with the canonical sibling in the same family.
3. Normalize:
   - search area
   - context strip
   - status messages
   - input controls
   - bottom action buttons
   - menu active/hide behavior
4. Remove page-local overrides that fight the shared pattern.
5. Verify the screen still preserves its required business behavior.

## Rules

- Unify through shared components first.
- Do not hide behavioral differences that matter to the workflow.
- Do not use visual fixes that introduce a new one-off pattern.
- Treat hidden detail/edit screens as context-rule problems, not CSS problems.
