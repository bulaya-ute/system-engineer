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

## Example rows (one each — shape is the contract)

```csv
# requirements.csv
R-14,Passengers can book on behalf of non-account guests,Guest riders are common in shared minivans,QB-C06,user,verified,"POST /api/bookings {isOnBehalf:true, behalfName, behalfPhone} returns guest ride-code",
# components.csv
C-03,BookingService,service,Owns atomic seat commitment (SELECT..FOR UPDATE),,ITINERARY_STORE|FARE_SVC,
# data.csv
D-02,Booking,`id:uuid; itineraryId:uuid; boardingStopId:uuid; status:enum(confirmed|waitlisted|cancelled)`,`Itinerary 1:N`,never double-book a segment,
# states.csv
Itinerary,draft,created,publish(admin)|cancel,shows to admins only,
# api.csv
API-11,POST /api/bookings,POST,Passenger,BookingRequest,Booking,{409:segment full|404:unknown stop},waitlist-promotion side effect on cancel,
# failure-modes.csv
F-04,Duplicate booking on concurrent submit,seat-count invariant check,one segment double-sold,row-lock the itinerary row in one txn,never auto-retry,
# verification.csv
V-03,Concurrent bookings cannot oversell,integration,run SlotEngineConcurrencyTests,0 failures,
# decisions.csv
DEC-2,JSON column for itinerary stop list,Route/RouteStop table|JSON array column,ordered simple list; no stop-level joins needed,revisit if per-stop analytics needed,
```

(Example values are generic shapes, not any real system's — keep exemplars
that way in the library; real content lives in each exemplar's own folder.)

## Row lifecycle rules

- `requirements.status`: `proposed → accepted → building → verified → dropped`
  (dropped rows stay visible with a reason — never deleted).
- `source:inferred` rows must be **reviewed at a check-in before the phase
  that depends on them** — the intake procedure enforces asking.
- `source:discovered` rows arrive mid-build (observation or realization);
  the affected `inferred` rows flip to `dropped` with the discovered row's ID
  in their reason. Never silently edit a requirement row's substance — new
  substance = new row.
- All tables accept row IDs referenced elsewhere by ID only.

## Spec altitude rule (owner policy, 2026-10-15)

The majority of effort/complexity lives in the **logic, API, and data
layers** — spec those completely. UI is rendered detail: with an excellent
foundation, AI builds frontends cheaply (skeletons → themes → components).
Therefore:

- **Every spec**: full fidelity on domain logic, API, data, invariants,
  failure modes. Always.
- **UI in specs**: include specifics **only** when the reference system has
  an excellent foundation *and* excellent UI (screens worth copying as
  patterns). Otherwise stay reasonably vague (surfaces + flows, no styling).
- UI specifics never gate verification — foundational behavior does.

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

