# Dry-run 1 — multi-agent orchestration (2026-10-16)

**Setup**: toy build (kvstore CLI), manager-pinned `CONTRACT.md`, two sub-agents
in parallel on one shared working tree. Models per spawn-profiles:
A = `opencode-go/kimi-k2.7-code` (code core + tests), B =
`opencode-go/glm-5.3-flash` (mechanical CLI surface + branch exercise).
Toy repo (local artifact, not pushed): `~/SoftwareDevelopmentProjects/dryrun-kvstore`.

## What the machinery proved (held, with evidence)

| mechanism | verdict | evidence |
|---|---|---|
| spawn-profiles (tier split) | HELD | cheap tier (B) delivered the mechanical surface + E2E + caught its own bogus test (invalid-path on Linux: `--file :/bad` is valid); mid code tier (A) 9/9 tests |
| contract-coding (parallel, disjoint scopes) | HELD | both coded against `CONTRACT.md`; zero conflicts; zero cross-file touches |
| scope honoring | HELD (both) | 0 violations; out-of-scope items routed as notices (4 from B, 2 from A) — never "helpfully" edited |
| branch registry | HELD | BR-1 full lifecycle: declared open → `feat/export` → commit `ff6499a` → returned → flipped `done`; no silent switch |
| per-agent memory folders | HELD | both wrote `handoff.md` + `observations.csv` (10 rows total) |
| expected-failure observation | HELD | B treated the missing `core.py` import as the planned observation, not a blocker |
| manager verification gate | HELD | merge deferred until tests + E2E ran; routed observations closed by manager commits |

## Incidents → skill refinements (the run's actual yield)

1. **A squashed the atomicity fix into the first commit** (ledger slip) and
   correctly refused history surgery without permission. Refinement:
   attempt ledger is **forward-only** — never rewrite history; a defect found
   after a commit gets the fix as the NEXT attempt-tagged commit. Applied to
   `orchestration/attempt-tracking.md`.
2. **A created `.venv/` (tooling artifact) and flagged it under strict scope.**
   Refinement: scope rules carve out *environment setup artifacts*
   (.venv, caches) — allowed; source files remain the scope boundary.
   Applied to `orchestration/roles.md`.
3. **No `.gitignore` at repo init** — manager's own miss (both agents flagged
   the fallout: untracked `kv.json`/`__pycache__`). Refinement: managers
   initialize repos with `.gitignore`. Applied to `orchestration/roles.md`.
4. **Token-cost measurement unavailable**: the subagent tool doesn't expose
   per-run usage. Recorded as an evaluation limitation — E1 must add a
   measurement hook (or estimate from message sizes).

## Verdict

Orchestration machinery is now **tested**, not prose. Still untested (honest):
escalation paths (no blocker occurred), manager-busy queueing (nothing to
queue), attempt-ledger under a real failure chain (A's slip was the only
near-miss), and the stop-rule path under a genuinely stuck agent.
