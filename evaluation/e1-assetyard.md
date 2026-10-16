# E1 — "AssetYard" (rebranded Snipe-IT clone): spec-rebuild evaluation

**Status: DESIGNED 2026-10-16, POSTPONED by owner (do not start without owner go).**

## Purpose (owner's design, formalized)

One experiment validates two things at once:
1. **Spec generation from a complete system** — is `library/exemplars/snipe-it/` good enough to build from, blind?
2. **Building from a well-detailed spec** — can the skill + an agent turn a spec into a working system?

## Design

- **Builder**: spawned agent(s) per spawn-profiles; manager orchestrates;
  builder gets ONLY `exemplars/snipe-it/` (the spec) — NO access to
  Snipe-IT's code or docs (blind rebuild; rebranded "AssetYard" to avoid
  trademark/content concerns).
- **Stack**: ASP.NET Core (.NET 8) + PostgreSQL + React, modern clean UI
  (owner call). Convergence note: the ui-ux-audit admin theme work
  (P2/L1) is directly reusable here.
- **Scope discipline**: build the **verified core** — the behaviors
  `verification.csv` V-01…V-05 prove (asset CRUD + tag uniqueness,
  checkout/checkin lifecycle, status-meta-type gating, consumable stock,
  license seats) + the entities those touch. NOT 100% of Snipe-IT's
  surface (labels/LDAP/reports test endurance, not the spec).
- **Incident classification (the disambiguator)**: every build blockage is
  tagged at the moment it happens:
  - agent INVENTED unstated behavior → `spec-gap` → becomes a `discovered`
    row in the exemplar spec (spec improves)
  - agent failed on STATED behavior → `execution-failure` → attempt
    ledger (skill/build improves)
- **Differential rebuilds (future E1b)**: same spec, different agent/stack;
  shared walls = spec's fault; single-agent struggles = agent's fault.
- **Scoring**: spec fidelity (built-vs-stated), correctness against the
  V-01…V-05 semantics, token cost vs a from-scratch baseline, incident
  counts by class.

## Success criteria

Spec is "good" if: zero `spec-gap` incidents on core flows, or every gap
is minor (cosmetic/labeling) and folds back cleanly. Skill is "good" if:
`execution-failure` incidents are caught by verification gates, not by
the owner's eye.
