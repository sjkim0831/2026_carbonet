---
name: html-screen-porter
description: Port HTML design files into the current Carbonet React migration structure by classifying page type, assigning screen family and context rules, and rebuilding the screen from approved shared frames instead of embedding raw HTML.
---

# HTML Screen Porter

Use this skill when a request provides HTML files or HTML-based screen designs and the goal is to add or rebuild Carbonet screens in the current React migration structure while preserving common design rules.

If the main problem is choosing the canonical design source under `/home/imaneya/workspace/화면설계`, use `carbonet-screen-design-workspace` first. If the main problem is repository implementation after design interpretation, pair this skill with `carbonet-feature-builder`.

Read only the references you need:

- Read [references/page-types.md](references/page-types.md) to classify the screen before writing code.
- Read [references/component-mapping.md](references/component-mapping.md) to map HTML blocks to shared React components.
- Read [references/porting-checklist.md](references/porting-checklist.md) before finishing.

## Workflow

1. Identify the target route, actor, and menu entry.
2. Classify the HTML into one page type:
   - `LIST`
   - `DETAIL`
   - `EDIT`
   - `CREATE`
   - `APPROVE`
   - `AUTHORITY`
   - `LOG`
   - `WORKSPACE`
3. Assign the screen to an existing screen family or define a new one.
4. Decide whether the screen is:
   - visible menu entry
   - hidden contextual screen
   - flow child of another screen
5. Rebuild the page from shared React frames and controls. Do not embed the raw HTML as the runtime output.
6. Register or update:
   - route definition
   - page manifest
   - page registry
   - menu context rule
   - API binding assumptions
7. Run the porting checklist before finishing.

## Rules

- Treat HTML as design input only.
- Do not keep raw `<input>`, `<select>`, or `<button>` if a shared admin component exists.
- Do not create page-specific spacing rules until the shared frame has been exhausted.
- Keep hidden detail or edit screens tied to an explicit active menu rule.
- If multiple HTML files exist for the same feature, prefer the most canonical design source rather than blending them.

## Required output

- React page component
- shared frame/component usage aligned to page type
- route and manifest updates
- context rule updates for menu active/hide behavior
- short note of assumptions if HTML omitted behavior details
