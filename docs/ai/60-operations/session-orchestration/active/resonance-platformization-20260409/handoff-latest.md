# Latest Handoff

Updated on `2026-04-09`.

## Current Position

- boundary rules are already established
- the repository is in the implementation phase, not the idea phase
- the highest-value unfinished area is still control-plane composition under `feature/admin`

## Immediate Next Slice

- start with `Priority 1A` from the separation status doc:
  - move control-plane menu/bootstrap and observability entry composition out of `feature/admin`
  - keep compatibility shims only where runtime routes still need them

## Do First

1. open `docs/architecture/carbonet-resonance-separation-status.md`
2. open `docs/architecture/carbonet-resonance-boundary-classification.md`
3. confirm the selected family is still in `Priority 1A`
4. freeze owner paths before touching Java or route files

## Do Not Skip

- keep DTO ownership platform-owned when the API is control-plane owned
- keep release-unit/runtime-package/deploy-trace naming under platform governance
- keep route split work behind one frontend owner

## Verification Expectation

- document path ownership before implementation
- if runtime behavior changes on `:18000`, use the repository freshness sequence before claiming completion
