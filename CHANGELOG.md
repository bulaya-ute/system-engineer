# Changelog

Terse, per release — what a resumed build would do differently. The board
(`development-state.md`) holds the full history; this file holds the
released states.

## v0.2.1 — 2026-10-17

**Fixed**
- S-4 playbook expanded (`scenarios.md`): understand-first rule (full flow +
  intended behaviour before proposing); enumerated rebuild strategies
  (full · front-end only · component-scoped · patch-in-place);
  maintenance-economics rule — patching poor code is often the expensive
  path; decide on economics, not purity.

## v0.2.0 — 2026-10-17

Design lock + X0: the skill becomes a front door over an expertise tree.

**Added**
- `DEPENDENCIES.md` — the skill tree: hard/soft/conditional types, triggers,
  absence behavior, dep-to-dep edges, the compliance-stamp interface, the
  question channel, provenance extension, load protocol, advertisement
  policy, transition map (X1–X7).
- `tracking.md` — artifacts registry, issues, truth reconciliation
  ("updated from reality, never claims").
- `scenarios.md` — routing table S-1…S-11: new build, resume, requirements
  change, incomplete-system completion, system→spec capture, bug fix,
  audit-only, verification, exemplar growth, upgrades, one-shot.
- Honesty charter — argue plainly; falsification records
  (`claim → argument → evidence → held|falsified → lesson → promoted-to`).
- Planned technique note: `requirements/techniques/usage-capture.md`
  ("testing state" telemetry — planning/discussion, deferred).

**Changed**
- Core loop restructured around owning skills (Intake → Spec → Plan &
  delegate → Build → Critique → Record); the manager role is now
  "chief engineer".
- README: dependencies pointer. SKILL.md footer: 0.2.0.

Note: extractions X1–X7 are queued; until each lands, capabilities remain
in-repo (see the Home column in `DEPENDENCIES.md`).

## v0.1.0 — 2026-10-17

First versioned release; everything to date (batches 1–5 plus the
2026-10-17 session) under one tag.

**Added**
- Requirements machinery — question bank v1 (60+ IDed questions), intake
  procedure, open-questions lifecycle, spec template v1.1, elicitation
  techniques incl. interactive skeleton + skeleton-kit v1 (vendored Vue,
  session cockpit, shell v2 — 194 in-repo assertions green).
- Library v1 — router + Snipe-IT exemplar, run-verified with evidence
  (V-01…V-05 pass; four discoveries folded back).
- Orchestration — roles/scope/hierarchy, awareness, branch registry,
  attempt ledger (forward-only), observations catalog, spawn profiles;
  proven in dry run 1 (two-model kvstore, four incidents folded in).
- Right-sizing — one-shot / solo lane / team build scales, machinery
  matrix, movement rules, evidence floor; SKILL.md core-loop step 0.
  Unexercised (E4 ticket).
- Harness discovery — SKILL.md frontmatter (name/description/license);
  install = register the clone as a skill source.
- Version management — `VERSIONING.md` playbook + compatibility promises;
  spec-folder provenance convention.
