# Spec template — information-first, AI-primary, diagram-on-demand

A spec is a **set of tables** (machine-skimmable, diff-able, ID-addressable).
Diagrams are *rendered views* of these tables on request (Mermaid) — the
tables are the truth; a diagram is a projection, never the source.

## Table set (one file each, in `library/exemplars/<system>/`)

- `requirements.csv` — `id, requirement, rationale, source(user|inferred|discovered), status, verification, open-question?`
- `components.csv` — `id, name, kind(surface|service|store|job|lib), responsibility, talks-to(ids), owns(ids)`
- `data.csv` — entity tables: `id, entity, fields(name:type:constraints), relationships(entity:cardinality), invariants`
- `flows.md` — one section per flow: `actors, trigger, steps(numbered), outcomes, failure-branches` (prose only where sequencing matters)
- `states.csv` — `entity, state, entry-actions, allowed-transitions(to:guard), exit-actions`
- `api.csv` — `id, route, method, auth(roles), request, response, errors(code:meaning), side-effects`
- `failure-modes.csv` — `id, failure, detection, blast-radius, mitigation, retry-policy`
- `verification.csv` — `id, claim, check(kind), how-to-run, pass-criteria`
- `decisions.csv` — `id, decision, alternatives-considered, chosen-because, revisited?`

## View projections (generated, not maintained)

Any of the tables can render a diagram on demand:

- `data.csv` + relationships → **ER diagram** (Mermaid `erDiagram`)
- `components.csv` + talks-to → **context/container diagram** (C4 via Mermaid `flowchart`)
- `flows.md` steps → **sequence diagram** (Mermaid `sequenceDiagram`)
- `states.csv` transitions → **state diagram** (Mermaid `stateDiagram-v2`)
- `requirements.csv` + verification → **use-case map** (actor × goal table; use-case *content* stays tabular)

Rule: if a human asks for a diagram, render it from the tables at that
moment — never hand-maintain a diagram that can drift from the tables.

## Inherited conventions

- Stable IDs (`R-14`, `C-03`, `D-07`) — referenced everywhere, restated nowhere.
- `source:` provenance on requirements; `discovered:` rows are honored
  mid-build findings (never silently absorbed into code alone).
- Terse cells; narrative only inside `flows.md` steps and `decisions.csv`
  rationale — judgment lives there, facts live in tables.
