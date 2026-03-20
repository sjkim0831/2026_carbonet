# Project Scenario And Design Output Contract

Generated on 2026-03-21 for Resonance project-first proposal generation.

## Goal

Define how a new project created from proposal upload should produce both:

- governed scenario outputs
- governed design-document outputs

as first-class generated assets before scaffold, build, and deploy.

## Core Rule

A proposal-created project is incomplete unless Resonance generates:

- public and admin menu trees
- public and admin scenario families
- child scenarios and scenario steps
- printable design-document families
- scaffold-ready outputs

from the same proposal baseline.

Do not allow:

- page generation without scenario-family output
- scaffold generation without mature design-output packages
- build approval when scenario or design-output generation is still partial
- public and admin screen families to be merged into one undifferentiated template line

## Required Scenario Outputs

Each project proposal onboarding flow should generate:

- `scenarioFamilySet`
- `publicScenarioFamilySet`
- `adminScenarioFamilySet`
- `templateLineSet`
- `screenFamilyRuleSet`
- `childScenarioSet`
- `scenarioStepSet`
- `scenarioResultChainSummary`
- `scenarioMenuBindingSet`
- `scenarioPageBindingSet`
- `scenarioComponentBindingSet`
- `scenarioEventBindingSet`
- `scenarioFunctionBindingSet`
- `scenarioApiBindingSet`

## Required Design Outputs

Each project proposal onboarding flow should generate:

- `requirementSummaryPackage`
- `menuRouteDesignPackage`
- `publicShellAndTemplatePackage`
- `adminShellAndTemplatePackage`
- `templateLinePackage`
- `pageDesignPackage`
- `elementDesignPackage`
- `pageAssemblyPackage`
- `interactionBindingPackage`
- `apiBackendPackage`
- `dbSqlPackage`
- `testScenarioPackage`
- `helpOperatorGuidePackage`
- `scaffoldReadyPackage`

## Required Project-Level Counts

The generation summary should expose:

- `scenarioFamilyCount`
- `publicScenarioFamilyCount`
- `adminScenarioFamilyCount`
- `childScenarioCount`
- `scenarioStepCount`
- `designOutputPackageCount`
- `pageDesignPackageCount`
- `elementDesignPackageCount`
- `pageAssemblyPackageCount`
- `interactionBindingPackageCount`
- `backendDbPackageCount`

## Rules

- scenario and design output counts must be visible from the same project view
- generated design packages must trace back to one `synthesisRunId`
- every scenario family should reference at least one mature design-output package
- every mature design-output package should reference at least one scenario family
- every page family should reference one or more screen family rules
- every scenario family should be able to resolve to one template line family
- admin review and admin management families should be generated as separate but linked assets from public or homepage-facing families when the proposal implies paired operation
- page, component, event, function, API, backend, DB, and SQL assets should remain fully data-driven so project scaffolding can rebuild them without source-copy drift
- reusable public/admin template lines should be visible as governed design outputs, not implicit conventions
