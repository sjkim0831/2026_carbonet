---
name: admin-screen-unifier
description: Normalize existing Carbonet admin screens to one governed design system by enforcing shared status messages, action bars, menu active rules, field controls, and page-type-aligned layouts across list, detail, edit, create, approve, and authority screens.
---

# Admin Screen Unifier

Use this skill when Carbonet admin screens already exist but their layout, field height, bottom buttons, menu active behavior, or empty/error states drift apart.

Read only the references you need:

- Read [references/unification-rules.md](references/unification-rules.md) for the common UI rules.
- Read [references/page-family-checks.md](references/page-family-checks.md) for what to verify by page type.
- Read [/opt/projects/carbonet/docs/architecture/admin-system-screen-completion-audit.md](/opt/projects/carbonet/docs/architecture/admin-system-screen-completion-audit.md) when the work asks which admin system screens are incomplete or which real functions a starter/static admin screen still needs.

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

For admin system completion checks, classify the screen as `COMPLETE`, `PARTIAL`, or `SCAFFOLD` before editing. Do not treat a rendered React page as complete when the core operator action is still static, sample-backed, read-only, or missing audit/storage closure.

## Rules

- Unify through shared components first.
- Do not hide behavioral differences that matter to the workflow.
- Do not use visual fixes that introduce a new one-off pattern.
- Treat hidden detail/edit screens as context-rule problems, not CSS problems.
