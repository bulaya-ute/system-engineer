# Scenarios — triggers → skills to call

The OS's routing table. Each scenario names the trigger, the skills in order,
and the gates. Scenarios update `tracking.md` as they run; scale
(`orchestration/right-sizing.md`) decides solo vs team execution inside each.

| # | scenario | trigger | route (in order) | gates |
|---|---|---|---|---|
| S-1 | **New system build** | owner asks for a system to be built | requirements-gathering → requirements doc vN → spec-authoring [forward] → spec-standard [stamp] → construction-overseer* → spec-to-system → ui-ux-audit† + verification → record | no stamp → no construction |
| S-2 | **Resume / open project** | session start on an existing project | truth reconciliation (`tracking.md`) → state report → continue from the first artifact not `verified` | never plan from memory |
| S-3 | **Requirements change** | owner adds or corrects needs | requirements-gathering [delta] → requirements doc vN+1 → spec-authoring [impact: which spec rows] → re-stamp → spec-to-system [delta] | re-stamp before the delta build |
| S-4 | **Incomplete system completion** | "finish this system" | spec-authoring [reverse: understand] → [assess: gap report] → requirements-gathering [round 2] → spec-authoring [forward] → spec-standard [stamp] → architecture + overseer [rebuild strategy] → owner decision → S-1 steps | strategy recorded in `decisions.csv` |
| S-5 | **System → spec capture** | existing system needs a spec (modernize, document, exemplar) | spec-authoring [reverse] → spec-standard [stamp] → hand off (S-1) or close | exemplar growth uses this route |
| S-6 | **Bug fix** | defect on a built system | spec-to-system [fix loop: attempts, stop rules] → `discovered` rows if behavior changed → re-verify | chain > 2 → halt |
| S-7 | **Audit only** | "review this UI/flow" | ui-ux-audit standalone → findings routed (issues / observations / spec rows) | report-only |
| S-8 | **Verification / prove** | "is it actually done?" | truth reconciliation + spec-to-system verification | evidence or it didn't happen |
| S-9 | **Exemplar growth** | library expansion (Odoo, Frappe) | spec-authoring [reverse] → corpus + router update | qualification rules (`library/README.md`) |
| S-10 | **Upgrade / dependency change** | a skill or dependency changes version | VERSIONING per repo → provenance check → flag mismatches | project data never migrates |
| S-11 | **One-shot** | small, single-sitting work | right-sizing one-shot lane — no spec folder | below system scale → don't wrap |

\* construction-overseer only when scale = team; solo runs the phase table
direct. † ui-ux-audit on UI-bearing builds; verification always.

## Scenario protocol

- Declare the scenario at session start, like the scale: state it, route it.
- Each scenario ends in **record**: tracking updated + journals +
  falsification records (SKILL.md charter).

## Growth rule

New scenarios earn a row after a real run — with provenance. An unmatched
situation defaults to S-4's first move: understand before acting.
