# Project DB Switch Checklist

Generated on 2026-03-21 for Resonance project DB attachment changes.

## Goal

Define the checklist for switching a project runtime from an initial attached DB target to a later dedicated DB server.

## 1. Before Switch

Confirm:

1. `projectId` and `releaseUnitId` are fixed
2. current DB attachment target is recorded
3. target DB server is registered in the project server-role map
4. migration or SQL draft is ready
5. backup checkpoint exists for the current DB target
6. rollback DB target is recorded

## 2. During Switch

Confirm:

1. runtime package points to the new DB target
2. controlled restart or rollout plan is selected
3. main-server smoke will run after switch
4. DB connection, read, write, and key business query checks are prepared

## 3. After Switch

Confirm:

1. active DB attachment target is updated in control-plane records
2. runtime health is green
3. key business pages render correctly
4. write-path tests succeed
5. cron and scheduler jobs still bind to the main server and the correct DB target
6. rollback target remains available

## 4. Blockers

Do not complete the switch when:

- migration is not ready
- backup checkpoint is missing
- active runtime cannot read and write normally
- current target and rollback target are ambiguous
