# AI-Assisted Module Intake Checklist

Generated on 2026-03-21 for Resonance governed module intake.

## Goal

Provide the repeatable checklist used when an operator requests a new module folder or external module candidate to be absorbed into Resonance.

This checklist assumes:

- the raw folder is not trusted as build-ready
- an AI agent inspects and normalizes it first
- the operator approves the attach plan before build and deploy

## 1. Intake Registration

Confirm the request records:

- `projectId`
- intake source path or repository
- requested module family
- requested target runtime scope
- request reason
- target release-unit or later attach intent

For current reference work, intake should support these source folders explicitly:

- `/opt/reference/modules/gnrlogin-4.3.2`
- `/opt/reference/modules/certlogin-4.3.2`

## 2. Ownership And Boundary Review

Confirm the AI review answers:

- should this become `COMMON` or `PROJECT` scope
- which files stay thin-runtime
- which assets should move into common jars or shared bundles
- whether the module introduces control-plane-only screens that must not ship to runtime
- whether shared `egovframework.com.cmm` code should be promoted into common lines instead of project-local runtime code

## 3. Frontend And Design Review

Confirm the AI review answers:

- which page families are included
- which component families are required
- which theme set and shell/frame families are compatible
- whether slot profiles exist for all internal layouts
- whether CSS duplicates or token overrides exist

## 4. Backend And DB Review

Confirm the AI review answers:

- which backend-chain family applies
- whether new API contracts are required
- whether DB objects or SQL drafts are required
- whether migration and rollback SQL are prepared
- whether data patch impact exists
- whether login/member/common tables, codes, and auth-related DML from the reference source should be normalized or rejected

## 5. Runtime Package Review

Confirm the attach plan answers:

- which runtime package asset families will be added
- which common lines are required
- which project-local thin-runtime assets remain
- which server roles are affected
- whether cron, logs, retention, or scheduler bindings are added

## 6. Approval Blockers

Do not approve module attach when:

- ownership is unclear
- module pattern family is missing
- module depth profile is missing
- CSS dedupe is red
- backend or DB impact is unresolved
- rollback path is missing
- runtime package target set is unclear
- reference source still contains unsplit common baseline mixed with certificate-specific logic

## 7. Completion Standard

The module may proceed to governed build only when:

- AI normalization is complete
- operator review is complete
- attach-plan blockers are zero
- runtime package matrix can represent the module as governed assets
