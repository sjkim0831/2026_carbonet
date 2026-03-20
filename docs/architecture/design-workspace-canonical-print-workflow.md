# Design Workspace Canonical Print Workflow

## Goal

Define how Resonance manages the design workspace under `/opt/reference/화면설계/설계` so that:

- source documents are indexed and queryable
- one canonical source is chosen per governed family
- alternate drafts remain traceable
- mature output packages can be printed or exported directly
- scaffold generation always references stable design IDs instead of raw file browsing

## Core Rule

Design documents may begin as files, but canonical source selection, print packaging, and scaffold consumption must be governed by the control plane.

No screen generation should depend on an unmanaged file path once the document has been indexed.

## Document Families

Resonance should index at least:

- requirement mapping
- actor definition
- BPMN or process flow
- scenario specification
- route and menu design
- component and interaction design
- API design
- DB design
- wireframe
- UI detail design
- screen flow
- test plan
- test scenario
- proposal or RFP
- theme package
- CSS source package
- design token package

The mature output layer should be able to emit at least these governed deliverable families:

- requirement summary package
- actor and authority definition package
- BPMN or process package
- menu and route design package
- page-design package
- element-design package
- page-assembly package
- interaction and binding package
- API and backend-chain package
- DB and SQL package
- test and acceptance package
- help and operator-guide package
- page design-guide package
- release-ready scaffold package
- theme-set package

## Project Proposal Design Output Rule

When a new project begins from proposal upload, the design workspace should
produce mature design-output packages as part of the same onboarding chain that
creates menu trees, scenario families, and scaffold requests.

The design-output view should therefore support:

- project-level output counts
- synthesis-run level output counts
- package-family level output counts
- direct links from design-output packages to scenario families and page designs
- direct links from page designs to page-level design guides

## Canonical Source Rule

For each:

- `projectId`
- `requirementDomain`
- `documentFamily`
- `domainCode`
- `versionLine`

there should be at most one active canonical source.

Additional files may exist as:

- draft
- supplement
- superseded
- rejected
- evidence attachment

but scaffold and mature-print workflows must prefer canonical approved sources first.

## Recommended Data Objects

### `DESIGN_SOURCE_REGISTRY`

- `designSourceId`
- `projectId`
- `requirementDomain`
- `documentFamily`
- `domainCode`
- `sourcePath`
- `sourceFormat`
  - `TXT`
  - `DOCX`
  - `PDF`
  - `HWP`
  - `PNG`
  - `PPTX`
  - `FIGMA_EXPORT`
- `versionLine`
- `approvalState`
- `canonicalSourceYn`
- `derivedSummaryId`
- `hashValue`
- `uploadedBy`
- `uploadedAt`

### `DESIGN_OUTPUT_PACKAGE`

- `packageId`
- `projectId`
- `requirementDomain`
- `packageFamily`
  - `REQUIREMENT_SUMMARY`
  - `ACTOR_AUTHORITY`
  - `BPMN_PROCESS`
  - `SCENARIO_BUNDLE`
  - `BUSINESS_RULE`
  - `WIRE_UI_DETAIL`
  - `SCREEN_FLOW`
  - `API_DB`
  - `TEST_PLAN`
  - `TEST_SCENARIO`
  - `SCAFFOLD_READY`
- `canonicalSourceSet`
- `supplementSourceSet`
- `printableOutputPath`
- `exportFormatSet`
- `approvalState`
- `generatedAt`

Recommended `exportFormatSet` values:

- `HTML`
- `PDF`
- `DOCX`
- `HWP`
- `JSON`
- `ZIP`

### `PROPOSAL_SYNTHESIS_RUN`

- `synthesisRunId`
- `projectId`
- `sourceDocumentSet`
- `requirementSummaryId`
- `menuCandidateSet`
- `pageCandidateSet`
- `scenarioFamilySet`
- `componentCandidateSet`
- `apiCandidateSet`
- `dbCandidateSet`
- `commonAssetPlanId`
- `projectAssetPlanId`
- `scaffoldRequestSet`
- `approvalState`
- `generatedAt`

### `proposal-mapping-draft.json`

The first AI-assisted output after proposal upload should be stored as a
governed mapping draft.

It should include:

- requirement item set
- menu candidate set
- scenario-family candidate set
- page-family candidate set
- component candidate set
- API candidate set
- DB candidate set
- common-versus-project candidate split

This draft is not final truth. It is the reviewable bridge between uploaded
proposal files and canonical mapping approval.

### `PAGE_DESIGN_REGISTRY`

- `pageDesignId`
- `projectId`
- `scenarioFamilyId`
- `pageFamily`
- `menuCandidateSet`
- `routeCandidateSet`
- `shellProfileId`
- `pageFrameId`
- `themeId`
- `responsiveProfileId`
- `languageProfileSet`
- `actorPolicyId`
- `approvalState`

### `ELEMENT_DESIGN_REGISTRY`

- `elementDesignId`
- `projectId`
- `elementFamily`
- `componentKind`
- `themeCompatibilitySet`
- `spacingProfileId`
- `bindingCapabilitySet`
- `reusableYn`
- `approvalState`

### `PAGE_ASSEMBLY_REGISTRY`

- `pageAssemblyId`
- `projectId`
- `pageDesignId`
- `elementDesignSet`
- `bindingAssemblyId`
- `helpAssemblyId`
- `diagnosticsAssemblyId`
- `approvalState`

### `THEME_SET_REGISTRY`

- `themeSetId`
- `projectId`
- `themeId`
- `designSystemProfileId`
- `colorTokenBundleId`
- `fontBundleId`
- `spacingProfileId`
- `densityProfileId`
- `shellCompositionProfileId`
- `pageFrameFamilySet`
- `componentCatalogSelection`
- `compositeBlockSet`
- `starterPageDesignSet`
- `starterElementDesignSet`
- `generatedBy`
  - `HUMAN`
  - `AI`
  - `HUMAN_WITH_AI`
- `approvalState`

## Operator Screens

The control plane should expose these design-workspace screens.

### 1. Source Intake Registry

Shows:

- uploaded source files
- source family and format
- project and requirement mapping
- approval state
- hash and duplicate detection
- canonical-source candidacy

### 2. Canonical Source Selector

Shows:

- all candidate documents for one family
- diff or comparison summary
- provenance and approval history
- current canonical source
- recommended canonical source

Actions:

- mark canonical
- demote canonical
- attach supplement
- reject source
- supersede source

### 3. Design Summary And Mapping Workspace

Shows:

- extracted summary
- mapped menus
- mapped scenario families
- mapped actor policies
- mapped API or DB objects
- scaffold-readiness score
- printable family coverage score
- requirement coverage score

### 3-A. Page Design Workspace

Shows:

- page purpose and page family
- route, menu, and shell placement
- selected page frame
- selected theme and token profile
- selected responsive and language profiles
- selected actor and authority profile

Actions:

- create page-design draft
- compare page-design versions
- bind page-design to scenarios and menus
- generate or refresh page-level design guide

### 3-B. Element Design Workspace

Shows:

- component inventory by category
- popup, grid, search, upload, and action-bar families
- selected element design and element variants
- theme compatibility and spacing profile
- reusable versus page-local element decision

Actions:

- create element-design draft
- promote page-local element into reusable asset
- compare element-design versions

### 3-BB. Theme-Set Studio

Shows:

- target visual direction
- selected design-system profile
- token, color, font, spacing, and density bundles
- shell composition preview
- approved component bundle preview
- composite block preview
- starter page and element design set preview

Actions:

- generate theme set with AI assistance
- review generated theme set as one package
- approve and publish theme set
- open page design from the approved theme set

### 3-BC. Incremental Asset Studio

Shows:

- current approved theme set
- single page-design draft
- single element-design draft
- single component-catalog item draft
- single binding-set draft

Actions:

- generate one page-design from the selected theme set
- generate one element-design from the selected theme set
- generate one component-catalog item from the selected theme set
- generate one binding set for one selected page or element
- approve one unit without regenerating the full theme set

### 3-C. Page Assembly Workspace

Shows:

- page frame with placed element instances
- action layout
- help regions
- diagnostics rail
- binding completeness

Actions:

- assemble page from page-design and element-design assets
- validate layout, spacing, and shell conformance
- publish assembled page to scaffold-ready package
- preview design output by printable family

### 3-D. Requirement Coverage Audit Workspace

Shows:

- requirement-domain modules and mapped design coverage
- missing menus, pages, and element families
- missing popup/grid/search/upload/report blocks
- missing help, accessibility, security, and authority bindings
- scaffold-readiness by family

Actions:

- register missing page-design asset
- register missing element-design asset
- bind requirement to existing design asset
- mark justified exception

### 4. Mature Output Package Builder

Shows:

- source coverage by document family
- missing required family warnings
- output package preview
- export formats
- scaffold package linkage

Actions:

- build package
- rebuild from latest canonical set
- export printable package
- publish scaffold-ready package

### 5. Print And Export History

Shows:

- exported package list
- source set used
- print and export formats
- operator
- timestamp
- approval state at export time

## Print Workflow

Recommended order:

1. intake source document
2. classify family and project
3. assign or confirm requirement domain
4. generate searchable summary
5. compare against existing family members
6. choose canonical source
7. attach supplements if needed
8. build mature output package
9. export or print package
10. bind package to scaffold-ready generation

## Scaffold Consumption Rule

Codex CLI, builder APIs, and scaffold generation should reference:

- `designSourceId`
- `packageId`
- `scenarioFamilyId`
- `synthesisRunId`

They should not depend on free-form operator browsing of file paths during generation.

They should also not depend on unmanaged page or element drafts that are not present in the governed registries.

Do not allow:

- generation from raw proposal or design files without governed output packages
- printing incomplete design packages that omit menus, page designs, element designs, bindings, or backend and DB sections

## Proposal Synthesis Rule

Proposal or RFP uploads should be transformed into a governed synthesis run before scaffold generation.

The synthesis run should:

- extract menu and page candidates
- extract popup, grid, search, upload, report, and approval-support blocks
- sort and group them into scenario families
- identify common reusable assets versus project-local runtime assets
- produce scaffold-ready payloads bound to the selected project

No build or deploy should begin directly from a raw uploaded proposal file.

## Publish Blockers

Do not produce a scaffold-ready or printable mature package if:

- no canonical source exists for a required document family
- source approval state is unresolved
- package family is missing required supplements
- requirement mapping and scenario mapping are missing
- the printable output cannot declare exactly which source IDs it was built from

## Non-Goals

- replacing external design tools
- live collaborative document editing
- storing every draft only in DB
