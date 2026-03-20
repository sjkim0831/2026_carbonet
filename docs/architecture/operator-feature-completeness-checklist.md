# Operator Feature Completeness Checklist

Generated on 2026-03-21 for Resonance operator-surface parity closure.

## Goal

Confirm that Resonance exposes every operator-facing surface required to:

- design systems
- scaffold frontend, backend, and DB artifacts
- build and package project units
- deploy to project server sets
- compare generated/runtime/baseline states
- repair drift or missing assets
- govern logs, cron, retention, rollback, and performance stacks

This checklist is used before calling the control plane product-complete.

## 1. Project And Runtime

Confirm the operator can:

- register project
- select project before any generation flow
- see main, sub, idle, DB, file, archive, AI-runner, and support-node roles
- see current DB attachment target and target DB candidate
- review rollout readiness per server role
- inspect runtime package ownership by project unit

## 2. Menu, Scenario, And Page

Confirm the operator can:

- import current runtime menu tree
- register home and admin menu trees
- link menu to scenario family and child scenario
- verify menu-to-rendered-screen status
- see missing page-family and requirement gaps
- open repair from a failed menu/page parity row

## 3. Design And Component Governance

Confirm the operator can:

- manage theme sets
- manage page designs
- manage element design sets
- assemble pages from pre-registered assets
- manage component catalog items
- manage component slot profiles
- manage shell item registries for header, menu, utility, and footer
- review spacing, density, HTML5 semantic, and action-layout consistency
- review internal component-slot consistency by family and page zone

## 4. Binding And Backend Chain

Confirm the operator can:

- inspect event, function, and API bindings
- inspect backend chain from route to controller, service, mapper, SQL, and DB object
- confirm help, authority, security, and diagnostics bindings
- inspect missing binding-family queue
- compare generated backend chain versus runtime backend chain

## 5. DB And SQL Governance

Confirm the operator can:

- review generated table and column definitions
- review PK, FK, unique, not-null, and index plans
- export scaffold SQL, migration SQL, and rollback SQL drafts
- review data patch scripts
- compare baseline DB object set versus target set
- inspect DB switch readiness and DB target history

## 6. Build, Package, Deploy, And Rollback

Confirm the operator can:

- build by project unit
- view runtime package matrix
- select common jar, frontend bundle, module lines, and optional library bundles
- inspect full-stack pattern consistency state
- inspect module pattern and style dedupe state
- deploy to main/sub/idle targets
- verify post-deploy render/log/cron smoke results
- inspect release-unit asset matrix
- roll back to proposal baseline or patch release

## 7. Logs, Audit, And Scheduler

Confirm the operator can:

- search logs by project, release unit, server, and log family
- correlate audit and deploy logs
- inspect main-server cron binding
- register, review, edit, delete, and retry scheduler entries
- inspect retention and orphan cleanup execution evidence

## 8. Performance And Optional Stacks

Confirm the operator can:

- attach and detach performance stacks
- review host-class placement
- review memory budgets
- inspect cache and queue health
- inspect stack rollback history
- verify 1GB runtime safety before attachment

## 9. AI And Productization

Confirm the operator can:

- bind AI providers, models, and runner nodes
- review AI-generated theme sets and repair runs
- inspect generation provenance for AI and human edits
- export diagnostic/support snapshot
- manage version, compatibility, and entitlement-relevant package state

## 10. Release Blockers

The control plane is not complete if any of the following is missing:

- project-unit runtime package matrix
- menu-to-rendered-screen verification
- missing asset queues
- repair open/apply flow
- backend chain explorer
- DB draft review and SQL export
- log search and cron binding ownership
- performance stack placement and budget review
- parity compare between current, generated, baseline, and patch target
