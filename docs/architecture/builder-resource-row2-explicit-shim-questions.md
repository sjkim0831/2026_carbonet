# Builder Resource Row 2 Explicit-Shim Questions

## Purpose

Use this guide only for row `2` of:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

This guide now serves as regression-only support.

## Row

- row `2`
- `framework contract metadata resource`

## Questions

1. Is there one named temporary reason for keeping a root framework metadata copy?
2. Is that root metadata copy explicitly temporary?
3. Is there one explicit removal trigger for that same temporary root metadata copy?

## Current Result

All three questions currently answer `no`, so row `2` still stays on:

- `DELETE_NOW`

## Immediate Rule

Do not open the explicit-shim branch unless all three answers later become `yes`.
