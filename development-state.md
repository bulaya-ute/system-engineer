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
- [built] Batch 2.5 — elicitation techniques: `requirements/techniques/catalog.md`
  (12 technique families, selection heuristics, composition rules),
  `techniques/interactive-skeleton.md` (owner-proposed technique: domain
  inference → unstyled one-file HTML skeleton w/ mock data + feedback modals
  + JSON export; fold-back rules; strong/cheap model split),
  `orchestration/spawn-profiles.md` (task-class → model tier + brief gates).
- [built] Batch 3 — library router (`library/_router.md`) + exemplar #1
  **Snipe-IT** (`library/exemplars/snipe-it/`): full table set (18
  requirements, 10 components, 18 entities, 7 flows, state tables incl.
  status-label meta-types, 15 API rows, 7 failure modes, 8 verification
  rows, 6 decisions) — `documented` status; run-verification pending (V-08)
  per the exemplar honesty rule. Q-A resolved: Snipe-IT first; Odoo later.

- [built] Batch 4 — Snipe-IT run-verification (the skill's own rules used for
  real): podman stack (MariaDB + snipe-it), first-run wizard automation
  (migrate → /setup/user; the 405-after-create quirk recorded), Sanctum PAT
  minted via artisan tinker when web login fought back (pivot per stop
  rules), **V-01…V-05 all PASS with evidence**; V-08 reconciliation folded
  4 discoveries into the exemplar: ERR-envelope semantics (HTTP 200 +
  {status:error} on rejections), category_type `asset` (not `hardware`),
  consumable `qty` field ignored (1 call = 1 unit), license checkout needs
  `target_type`. V-06/V-07 pending (company-mode toggle; CSV multipart).
  Harness: `evaluation/{launch-snipeit.sh, setup-snipeit.py,
  verify-snipeit.py}` — reusable for any future run. Foundation-first spec
  altitude policy (owner, 2026-10-15) encoded.

- [built] Batch 5 — multi-agent dry run 1 (orchestration machinery now
  tested, not prose): two sub-agents on different models (kimi-k2.7-code
  core / glm-5.3-flash surface) built the kvstore toy in parallel against a
  pinned contract; held: spawn-profiles tier split, contract-coding (zero
  conflicts), scope honoring (0 violations, 6 routed notices), branch
  registry (BR-1 full lifecycle), per-agent memory folders, manager
  verification gate. 4 incidents refined into the skill: forward-only
  attempt ledger, tooling-artifact scope carve-out, manager .gitignore duty,
  token-measurement limitation. See `evaluation/runs/dry-run-1.md`.

- [built] SKILL.md frontmatter (name + description + license) — the repo
  parses as a skill in skill-aware harnesses (OpenCode V2 / Claude Code
  format); install step = register the clone as a skill source.

- [built] Right-sizing (owner green-light, 2026-10-17):
  `orchestration/right-sizing.md` — three scales (one-shot / solo lane /
  team build), entry criteria, machinery matrix, movement rules (promote
  immediately, trim at phase boundaries, retro-intake), evidence floor
  ("scale trims coordination, never evidence"). SKILL.md core-loop step 0;
  scale gates on roles / awareness / branch-registry / spawn-profiles /
  observations + intake pointer. Default when ambiguous: solo lane.
  Unexercised on a real build — see E4.

## Owner direction (2026-10-16)

Focus = the skill's core: **AI-model software-engineer expertise first.**
The skeleton-technique upgrades (kit-on-Vue, cockpit, fidelity tiers,
editable skeleton) are DESIGNED + DOCUMENTED (`techniques/
interactive-skeleton.md` "Planned upgrades") but DEFERRED — build each only
on session evidence, not endpoint shine.

## Where we are (halt point, 2026-10-17)

- **Frontmatter + right-sizing shipped this halt**: `7b95b53` (SKILL.md
  frontmatter — repo parses as a skill in skill-aware harnesses; install =
  register as a skill source; not installed anywhere yet), `2addad3` +
  `c2272e7` (right-sizing — three scales, machinery matrix, movement rules,
  evidence floor; SKILL.md step 0 + scale gates), `1c82b6d` (board + E4).
  **The scale model is untested — E4 is its exercise ticket**; next real
  build declares its scale.
- **NFC order-wallet project (first real loop) — SESSION OPEN** (carried):
  spec v0 + session folds in `nfc-loyalty-docs/spec/` (requirements.csv
  13 rows, open-questions OQ-02/03/04 live, skeleton brief, v3 declaration).
  Owner's interactive-skeleton session live (localhost:4322 + phone;
  inspect-mode cockpit). Feedback notes pending fold-back; then: phase plan
  (.NET 8 + Postgres + React) → build → critique → record. OQ-04
  (counter pinpad vs phone-push) unanswered. On resume: declare the scale
  (likely team build) — starts E4 evidence.
- **Skeleton technique (carried)**: kit v1 + cockpit + shell v2 shipped,
  194 assertions green; kitty styling rule locked (chrome styled, preview
  functionally colored — faint table row lines, owner preference). Kit
  v1.1 backlog (proven needs): sk-select, reusable sk-modal, money-table
  per-row actions, openComment()/sk-feedback-button.
- **E1 "AssetYard"**: fully designed (`evaluation/e1-assetyard.md`),
  owner-POSTPONED.

## Next (in order)
- [next] NFC order-wallet project (FIRST REAL LOOP, in flight): intake done
  (spec v0+session folds at nfc-loyalty-docs/spec); skeleton v2 session with
  owner; then phase plan (.NET 8 + Postgres + React) → multi-agent build →
  critique → record. This build IS the core exercise.
- [next] Exemplar growth: Odoo (domain chunks) or Frappe — library breadth is
  the expertise backbone (target: 4-6 across system classes before E1).
- [postponed, owner 2026-10-16] E1 evaluation — FULL EXPERIMENT DESIGN at
  `evaluation/e1-assetyard.md` (rebranded blind Snipe-IT clone, .NET 8 +
  Postgres + React, verified-core scope, incident classification spec-gap vs
  execution-failure, differential-rebuild disambiguation, scoring). Do not
  start without owner go.
- [next] Deferred technique upgrades (build on evidence only): skeleton kit
  (Vue vendored) → cockpit → fidelity tiers → editable skeleton.

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
- [untested] E4: right-sizing exercise — real builds run at a declared scale;
  at least one promotion (one-shot→solo or solo→team) validated, with
  retro-intake cost checked against what it saved.

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
