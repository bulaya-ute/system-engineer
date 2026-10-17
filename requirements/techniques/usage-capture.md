# Usage capture — "testing state" telemetry (PLANNED)

Status: **planning / discussion — deferred**. Do not implement without owner
go. Recorded from the 2026-10-17 design session.

## What

Launch a prototype in a **testing state** that logs how a human actually uses
it: screen state (screenshots), clicks and interactions, the user's exact
flow and what they were seeing — so the skill family can learn real behavior
instead of guessed behavior.

## Why

- It is the instrumented form of the **observation / contextual inquiry**
  technique (`catalog.md`) — tasks observed as they happen, not as recalled.
- The NFC interactive-skeleton session (localhost + phone) is the proto: a
  served skeleton the owner actually operates.

## Design questions (open)

- Log schema: screen state + interactions + timing; how flows are
  reconstructed from them.
- Where the data lives (local-first vs server) and retention.
- Consent + privacy: screenshots of the user's own environment require
  explicit consent — the ui-ux-audit rule is the family norm.
- Fold-back: what becomes spec `discovered` rows, observations, practices?

## Placement

When built: a requirements-gathering technique (it moves with `techniques/`
at extraction X2). Tooling likely — a candidate for its own extraction later.
