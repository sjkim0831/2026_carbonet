Status: LIVE_ENTRY

# Test Data Safety Policy

## Non-Negotiable Rule

Verification, smoke, regression, and AI-driven testing must not use real production data.

This is mandatory for all Carbonet operator flows, and especially for:

- payment
- refund
- virtual account
- billing notification
- certificate issuance
- external authentication
- external integration
- key rotation

## Required Inputs Before Testing

Before a page or API is executed through a verification console, these must already exist:

- approved test account profile
- approved seed data pack
- scope label showing test-only purpose
- reset or cleanup rule
- expiration date for reusable credentials where needed

## Prohibited

- direct use of a real member account
- real card or bank data
- real company settlement or refund targets
- real external provider keys for routine UI testing
- production customer identifiers copied into test scenarios

## Payment And Similar High-Risk Flows

For payment-like flows, verification must be limited to one of these:

- test gateway
- sandbox account
- fake virtual account dataset
- stubbed callback payload
- masked snapshot evidence

If none of these are ready, the test must be blocked rather than falling back to real data.

## Verification Center Rule

`/admin/system/verification-center` should display and enforce:

- test-only account requirement
- test-only dataset requirement
- high-risk page family warning
- payment/refund/live-auth prohibition note
- blocked state when only real data is available

## AI Work Rule

When AI is asked to verify or regression-test a page:

1. verify that a test account and test data pack exist
2. reject real-data fallback
3. capture evidence with masked identifiers
4. record the account profile and dataset profile used

