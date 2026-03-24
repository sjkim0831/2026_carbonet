# Unification Rules

Apply these rules in order:

1. Shared page frame first
2. Shared state notice second
3. Shared field controls third
4. Shared bottom action bar fourth
5. Menu context normalization last

## Must unify

- status message shape
- input height
- button height and min width
- search card density
- context strip placement
- active menu behavior

## Must not diverge

- page-local raw field heights
- page-local primary button widths
- page-local permission denied cards
- page-local empty-state boxes when a shared state component exists
