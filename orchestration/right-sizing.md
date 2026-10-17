# Right-sizing — declare the build's scale before intake

The full loop is expensive; most builds don't need all of it. Three scales —
pick the smallest that fits, declare it before intake with a one-line reason.
The scale decides which machinery applies; **it never decides how much
evidence is required.** Ambiguous → `solo lane`.

| scale | entry criteria (all must hold) |
|---|---|
| **one-shot** | single sitting · single agent · small deliverable · nothing needs to survive the session |
| **solo lane** | durable build (multi-session) · exactly one writer |
| **team build** | a second writer (agent or human) or parallel workstreams on shared trees |

Below one-shot — no lifecycle, no deliverable, a one-line edit: not a system,
don't wrap it in the loop.

## Machinery by scale

| practice | one-shot | solo lane | team build |
|---|---|---|---|
| intake | intent + acceptance stated; only questions whose absence would change the build | adaptive bank — A–C core + selected sections, ≤15/session (`../requirements/intake-procedure.md`) | same, manager-run; briefs carry spec slices |
| match | router glance (never skipped) (`../library/_router.md`) | router match; near-match starts from exemplar deltas | same; slices become brief payloads |
| spec folder | none — acceptance lines + commits are the record | table set (`../requirements/spec-template.md`); requirements + verification essential, rest as complexity demands | full table set; contracts pinned between agents |
| plan | inline steps | phase table with verifiable exits | + spawn profiles (`spawn-profiles.md`), brief gates |
| attempt ledger | commit-per-attempt while looping; mechanical revert on root cause; stop rules (`attempt-tracking.md`) | + `att/` scratch branches when a fix chain exceeds 2 | + branch-registry acks for shared trees |
| verification | evidence before done | `verification.csv` rows; acceptance environment | same — evidence is tier-independent |
| observations | informal; repeatable lesson → one-line KB candidate | one `observations.csv` in the spec folder, routed (`observations.md`) | per-agent folders; manager routes (`../agents/README.md`) |
| orchestration machinery | off | off | roles · awareness · branch registry · spawn profiles · per-agent memory — all ON |

## Movement rules (a floor, not a cage)

- **Promote** one-shot → solo when: a second session is needed · another
  stakeholder appears · the work reveals lifecycle or data that must survive ·
  the stop rules hit inside a fix loop.
- **Promote** solo → team when: a second writer is genuinely needed ·
  shared-tree contention appears · independent critique is wanted. A
  read-only critique spawn does not promote the build.
- Promotion is immediate, any time; **agents trim back only at phase
  boundaries** (no churn mid-phase). The human can move the scale at any time.
- Promotion cost is bounded: **retro-intake** — write the spec folder from
  what exists; everything `source:inferred` except owner-stated facts; review
  at the next check-in. Promotion adds durability; it never rewrites history.

## The floor (never scales)

Scale trims coordination; it never trims evidence. At every scale: evidence
over vibes · verify before done · the user's environment is the acceptance
target · the stop rules hold (`attempt-tracking.md`).

## Where the scale is recorded

- **solo lane / team build**: one line in the project's spec folder or dev
  board — `scale: <name> — <reason>`.
- **one-shot**: stated once in the exchange; `scale:one-shot` in the first
  commit message.

## Growth rule

A scale exercised on a real build gets a provenance line here — which project
ran it first, what strained. New scales are not invented on paper; they appear
only when a real build strains the current three.
