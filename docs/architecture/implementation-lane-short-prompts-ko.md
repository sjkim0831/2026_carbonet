# Implementation Lane Short Prompts KO

Generated on 2026-03-21 for immediate execution after the `01` handoff.

## 목적

구현 세션에 바로 붙일 수 있는 짧은 한국어 지시문입니다.

전제:

- handoff 문서 확인 완료
- 시작 지시문 문서 확인 완료
- 현재 저장소 상태 확인 완료

## 05 프런트엔드

- `05 레인: 승인된 프로토타입 기준으로 governed React 운영 셸과 context-key strip을 먼저 만들고, 그 다음 project-runtime과 current-runtime-compare를 구현하되 guidedStateId, templateLineId, screenFamilyRuleId, ownerLane 이름은 절대 바꾸지 마세요.`

## 06 백엔드

- `06 레인: src/main/java와 mapper 기준으로 repair open/apply, compare request/result, module-selection trace용 control-plane API 골격을 만들고, governed identity 필드명은 계약 문서 그대로 유지하세요.`

## 08 배포

- `08 레인: runtime-package matrix와 deploy-console 계약 기준으로 첫 runtime package 조립과 deploy status 흐름을 만들고, main-server truth, public/admin split, governed identity trace linkage를 유지하세요.`

## 09 검증

- `09 레인: current-runtime-compare, repair-workbench, chain-matrix-explorer 기준으로 compare, blocker, repair queue 모델을 만들고 ownerLane과 전체 governed identity 연결을 current/generated/baseline/patch 상태 전부에 유지하세요.`

## 07 DB

- `07 레인: 06이 첫 backend family 이름을 고정하면 그 기준으로 첫 SQL draft, migration draft, rollback draft를 만들고 common/project DB 분리와 release-unit 추적을 유지하세요.`

## 10 모듈

- `10 레인: attach-plan 기반 module selection과 common-line linkage 흐름을 만들고, 폴더를 바로 빌드에 넣는 방식은 금지하며 template line과 screen family rule 추적이 끊기지 않게 하세요.`

## 04 빌더

- `04 레인: asset-studio와 screen-builder 기준으로 첫 screen-builder frame과 governed asset editor shell을 만들고, 등록된 자산만 사용하도록 강제하며 screen-family-rule 잠금 상태를 항상 보이게 하세요.`

추가 규칙:

- `04` 레인이 builder resource ownership continuation을 받으면 먼저 `builder-resource-ownership-current-closeout.md` 와 `builder-resource-ownership-queue-map.md` 를 읽고 해당 row review card부터 이어가세요.
- `이 두 문서는 해당 모드의 single live entry pair 로 취급하세요.`
- `04` 레인 resource-ownership 모드: `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` 를 current closeout과 queue map 기준으로 이어가고, 구조-governance는 다시 열지 말고 다음 queued row review card와 provisional handoff shape만 진행하세요.

## 03 테마

- `03 레인: 승인된 theme 계약 기준으로 template-line selector와 theme-set selector 모델을 만들고, public/admin 분리와 canonical screen-family-rule 사용을 유지하세요.`

## 02 제안

- `02 레인: proposal 계약 기준으로 proposal upload result와 proposal-mapping draft review 흐름을 만들고, 결과는 승인 전까지 governed draft로 유지하며 candidate set이 항상 보이게 하세요.`
