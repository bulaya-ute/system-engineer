# Development state

Always current. Any session (human or agent) resumes from this board.
Convention: `[built]` done · `[wip]` in progress · `[next]` queued ·
`[untested]` planned, not yet exercised by a real build.

## Built
- [built] Repo skeleton: SKILL.md, orchestration + requirements + library
  scaffolding, per-agent memory convention, branch registry, dev board.
- [built] Batch 2 — requirements machinery: full question bank v1 (11
  sections, 60+ IDed questions with why/skip columns + standing during-build
  set), intake procedure (adaptive selection, ≤15/session, recording into
  spec tables, during-construction mini-intakes, stop conditions),
  open-questions machinery (CSV lifecycle: blocking rules, fold-into-spec,
  stale→inferred, drop-with-reason), spec-template v1.1 (example rows per
  table, row lifecycle: proposed→accepted→building→verified→dropped,
  discovered-row rules).

## Next (in order)
- [next] Library router manifest (`library/_router.md`) + first exemplar
  spec written from an **open-source** system (candidates: Snipe-IT, Odoo,
  Frappe) — validates the information-first "diagram" formats.
- [next] Multi-agent orchestration dry run: two sub-agents + manager on a
  toy build, exercising scope honoring, branch registry, attempt ledger,
  escalation.
- [next] Theme-library interactivity upgrade (in `ui-ux-audit` repo, first
  exercise run by this skill): animated sidebar collapse, FLIP-animated
  table rows, live search/add/remove, real modals — per approved outline.

## Untested system classes (spec stubs exist only when marked)
- [untested] Fleet tracking / management
- [untested] Ride ticket booking (generic; no proprietary content)
- [untested] HR management
- [untested] Point-of-sale (POS)
- [untested] Library/asset management (candidate exemplar: Snipe-IT)
- [untested] ERP-core (candidate exemplar: Odoo, Frappe)

## Evaluation backlog
- [untested] E1: agent rebuilds a system matching a library exemplar;
  score = spec fidelity, correctness, token cost vs baseline.
- [untested] E2: adjacent-to-library builds (the untested classes above).
- [untested] E3: far-from-library build (stress test of intake + planning).

## Policy reminders
- **No private projects in this repo, ever** (no LusakaRide or other
  proprietary content). Real-world projects get built *using* the skill in
  their own repos; evaluation happens there, results (scores, lessons only)
  may return here.
- Public repo; MIT.

## Open questions
- Q-A: exemplar #1 — Snipe-IT (smaller, asset domain) vs Odoo (huge, ERP)?
  Lean: Snipe-IT first (digestible), Odoo as domain chunks later.
- Q-B: SQLite layer for the library — introduce at exemplar #1 or when the
  library passes ~50 KB of spec text? Lean: later, keep text-first.
