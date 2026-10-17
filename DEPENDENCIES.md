# Dependencies — the skill tree

`system-engineer` is the front door; expertise lives in dependency skills, each
with its own repo, versioning and board. One rule holds for every link type:
**every absence is visible** — stop, or a declared fallback that is recorded.
Never silent, never emulated.

Vocabulary: the manager role is the **chief engineer** (older docs say
"manager"). Encoding phases are **X0–X7** (see the board).

| type | meaning | when absent |
|---|---|---|
| **hard** | required for a declared behavior | refuse that behavior — stop, or a declared downgrade |
| **soft** | absence degrades quality or coverage | run the declared fallback; record the degradation |
| *conditional* | hard only from its trigger onward (scale, phase, scenario) | same as hard, from the trigger onward |

## The tree

| dependency | type | trigger | absent → | advertise | home |
|---|---|---|---|---|---|
| `spec-standard` | hard | first spec read/write | stop — no format, no OS | hidden | in-repo `requirements/spec-template.md` → X1 |
| `requirements-gathering` | hard | intake | stop (offers install) | advertised | in-repo `requirements/` + `techniques/` → X2 |
| `system-architecture` | hard for spec producers | structural decisions | spec cannot be stamped; escalate | hidden | new repo → X3 |
| `spec-authoring` | hard (design phase) | spec work | stop the design phase; never construct unspecced | advertised | in-repo `library/` (corpus) → X4 |
| `spec-to-system` | hard (build) | build | stop — no free-hand construction | hidden | in-repo build docs → X5 |
| `construction-overseer` | hard, conditional | scale = team | declared downgrade: cap at solo lane | hidden | in-repo `orchestration/` + `agents/` → X6 |
| `practices` | soft | intake + build | proceed; record "practices unbound" | advertised | new repo → X7 |
| `ui-ux-audit` | soft | critique | un-KB'd critique; findings flagged not acceptance-grade | advertised | external (exists) |

`interactive-skeleton` stays inside `requirements-gathering` (initial split
leaning; it splits only if it grows a non-requirements audience).

Edges between dependencies (they know each other directly):

| edge | type | meaning |
|---|---|---|
| `spec-authoring` → `spec-standard` | hard | drafts target the standard; the validator gates them |
| `spec-authoring` → `system-architecture` | hard | structural decisions are spec content |
| `construction-overseer` → `spec-standard` | hard | refuses a spec without the compliance stamp |
| `construction-overseer` → `spec-to-system` | hard | delegating is done *to* the execution discipline |
| `ui-ux-audit` → `better-design` (MCP) | soft | instruments when connected (audit's own rule) |

## Interfaces

- **Compliance stamp** — `spec-standard`'s export: a spec is *compliant* only
  when it passes the standard's checks (format + honesty: no placeholder
  rows, no empty verifications, inferred rows flagged, altitude respected).
  Construction never starts un-stamped. Full definition drafted with X1.
- **Question channel** — gaps discovered while authoring travel back as
  `open-questions` rows (`asked_to` = a skill), batched; genuine unknowns
  escalate: skill → chief engineer → human.
- **Provenance line** — at intake, the spec folder records
  `skill: vX.Y.Z @commit · deps: name@ver ✓, name@ver ✗(flagged)`.
  Version ranges are advisory pre-1.0; mismatches are made visible, not
  prevented.

## Load protocol (runtime)

1. Before a step that needs a dependency, attempt to load it by exact skill
   ID (`skill` tool; `@id` for humans).
2. **Hard**: loaded → proceed; missing → per the table (refuse or declared
   downgrade). **Soft**: loaded → use; missing → run the fallback and record
   it (provenance + observations).
3. Never emulate a dependency's expertise silently. During the transition
   (X1–X7 pending), the Home column stands in for the skill ID: the
   capability is in-repo, read as files.

## Advertisement policy (provisional — owner confirmation pending, Q-D)

- **Hidden** (`metadata.opencode/autoinvoke: false`) — infrastructure:
  `spec-standard`, `system-architecture`, `spec-to-system`,
  `construction-overseer`.
- **Advertised** — user-facing: `requirements-gathering`, `spec-authoring`,
  `practices`, `ui-ux-audit`.

## Growth rule

A dependency is added only with: a trigger, absence behavior, an
advertisement class — and a real consumer (the same evidence bar as
everything else). Extractions are move-not-copy; an extracted capability
never remains in-repo.
