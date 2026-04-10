# Builder Productization Priority Backlog

## Goal

Rank which page families should enter the real builder/install flow first, using the newly frozen productization baseline.

This backlog is coordinator-owned. It is not a runtime verification log and it is not an implementation checklist.

## Priority Rule

Prefer page families that satisfy most of the following:

- already builder-adjacent
- already `COMMON_DEF_PROJECT_BIND`
- already carry explicit compare, repair, validator, or rollback surfaces
- have clear install/project binding inputs
- can prove reusable install flow without source-copy delivery

## Current Priority

### P0

1. `screen-builder`
   - already owns builder authoring, runtime compare, and repair surfaces
   - strongest fit for first real builder/install flow
   - canonical proof target for `COMMON_DEF_PROJECT_BIND`

2. `environment-management`
   - directly binds menu, route, manifest, and project activation
   - strongest operator-facing install/bind console after `screen-builder`
   - best second proof target for explicit project binding inputs

3. `project-version-management`
   - closes the version/install side of the same builder-managed path
   - strong candidate for install, validator, and rollback coordination after `screen-builder` and `environment-management`

### P1

4. `platform-foundation`
   - strong governance and observability family
   - useful after builder-specific families prove the install path
   - should not be the first builder/install proof because it is broader than the builder lane itself

5. `admin-system`
   - large governed family with many runtime targets
   - valuable after the builder path is proven on narrower families

6. `admin-member`
   - strong authority/approval family
   - good follow-up once entry, binding, and validator patterns are stable

### P2

7. `emission-monitoring`
   - rich project-scoped runtime family
   - larger project/runtime complexity makes it a later proof target

8. `content-support`
   - broad mixed admin/home family
   - useful after the first builder/install families stabilize

9. `trade-payment`
   - heavy project executor behavior
   - later candidate because business-specific write paths are denser

10. `home-experience`
    - broad public/member family
    - valuable, but lower priority for first builder/install proof

11. `app-owned-entry`
    - foundational and important
    - not the first install proof target because entry/auth fallback semantics are special-case heavy

## Current Recommendation

The first real builder/install execution sequence should be:

1. `screen-builder`
2. `environment-management`
3. `project-version-management`

Treat this as one bounded progression, not as permission to open every family at once.

## Active Pilot

The currently selected pilot family is:

- `screen-builder`

Use:

- `docs/architecture/builder-productization-pilot-screen-builder-handoff.md`

Do not treat `environment-management` or `project-version-management` as active pilot families yet.
Do not start them in partial or exploratory implementation state during this wave.

## Coordinator Guardrails

- keep the baseline contract fixed
- open only the current target family in implementation follow-up
- keep the current wave scoped to one active pilot family
- do not claim family closeout from backlog ranking alone
- do not convert this backlog into a source-copy rollout plan

## Backlog Update Rule

Only reorder this backlog when one of the following changes:

- the baseline productization contract changes
- a higher-priority family proves real builder/install flow and can be marked done
- a blocker makes the current top family unsuitable as the next proof target

## Closeout

`CLOSED: productization priority is fixed for the next execution wave; screen-builder, environment-management, and project-version-management are the first builder/install proof targets under COMMON_DEF_PROJECT_BIND.`
