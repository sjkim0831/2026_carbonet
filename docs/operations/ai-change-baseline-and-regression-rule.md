# AI Change Baseline And Regression Rule

Status: LIVE_ENTRY

Use this document when AI will modify an existing Carbonet page, workflow, or admin operation and the goal is to avoid breaking behavior that already worked.

## Goal

Before changing code:

- confirm what currently works
- capture a lightweight baseline
- avoid editing against assumptions

After changing code:

- re-run the same baseline checks
- verify the changed path
- detect obvious regressions without asking a person to click every screen again

## Core Rule

For existing behavior, AI should prefer:

1. baseline check before edit
2. implementation
3. same-path regression check after edit
4. changed-path verification

Do not jump straight from source diff to "done" when the task changes an existing page or route.

## Minimum Baseline Capture

Capture only the smallest useful baseline for the affected scope.

### A. Existing route or page change

Capture at least:

- exact route URL
- current response status
- login or redirect behavior
- page-governance metadata when available
- one or two core user-visible actions or state signals

Example:

- route responds with `200` or expected `302`
- page metadata API returns the expected `pageId`, menu code, and feature code
- list count, badge, button presence, or key label exists

### B. Existing save or mutation flow

Capture at least:

- read endpoint or page bootstrap response
- current permission requirement
- one safe pre-change mutation expectation if it can be checked without side effects
- audit or result evidence path

### C. Existing local runtime behavior on `:18000`

Capture at least:

- exact route response before edit
- current runtime metadata endpoint response when available
- current auth/redirect behavior

## Baseline Evidence Types

Use the lightest evidence that still proves current behavior:

- `curl -k -sSI` headers
- `curl -k -sS` body excerpt
- page-governance metadata API result
- repository verification script output
- DB-backed read-only API result

Prefer this over manual browser clicking for every task.

## Safe Verification Ladder

Use this order from cheapest to strongest:

1. route response check
2. metadata/governance API check
3. focused script or audit gate
4. exact changed workflow route check after rebuild/restart
5. e2e or manual click path only when the earlier levels cannot prove the risk area

## When Manual Or E2E Checks Become Necessary

Require stronger checks when:

- the task changes mutation logic
- the task changes permissions or feature exposure
- the task changes multi-step workflows
- the task changes external integration behavior
- the task changes rendering that cannot be trusted from metadata alone

## Request Template For Users

When asking AI to change an existing page or function, give these fields if possible:

1. target route or menu
2. what currently works and must not break
3. what should change
4. one or two critical actions to preserve
5. whether local `:18000` verification is required
6. whether save/mutation/audit behavior must be proven

Recommended short instruction:

`작업 전에 기존 동작 baseline 먼저 확인하고, 수정 후 같은 경로와 핵심 액션을 다시 검증해줘. 특히 유지해야 하는 기능은 <...> 이고, 변경 대상은 <...> 이야. 가능하면 수동 전체 테스트 대신 route/API/metadata 기반으로 먼저 확인하고, 필요한 경우에만 추가 테스트해줘.`

## AI Working Rule

If the user does not provide a baseline explicitly, infer one conservatively from:

- the exact route
- the closest metadata API
- current auth or redirect behavior
- the smallest safe read-only check

Then state what was used as the baseline in the result.

## Carbonet-Specific Fast Checks

### Existing admin route

Use:

```bash
curl -k -sSI 'https://127.0.0.1:18000/<route>'
curl -k -sS 'https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=<pageId>'
```

### Existing local runtime change on `:18000`

Use:

```bash
bash ops/scripts/codex-verify-18000-freshness.sh
curl -k -sSI 'https://127.0.0.1:18000/<route>'
```

### Existing React/page governance change

Use:

```bash
cd frontend
npm run audit:ui-governance
```

Use the findings as a focused regression signal, not blind truth, until the script is fully aligned with the current route model.

## Non-Goals

- This rule does not mean every task needs full manual regression.
- This rule does not mean every task needs full e2e coverage.
- This rule does mean AI should stop claiming success from source edits alone when existing behavior is at risk.
