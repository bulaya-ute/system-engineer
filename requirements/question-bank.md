# Question bank — full intake set (v1)

IDs are stable (`QB-<section><nn>`). Each question: what it protects against
(`why`), and when it may be skipped (`skip`). **Adaptive intake**: never ask
everything — run the core (A, B, C), then select sections by system kind.
Recording goes straight into the spec tables (`requirements.csv`,
`source:user`) or `open-questions.md` — never into chat-only memory.

## A. Purpose & users (core — always)

| id | question | why | skip |
|---|---|---|---|
| QB-A01 | What problem does this solve, in one paragraph? | everything downstream keys off it | never |
| QB-A02 | Who uses it (roles/personas), and what's their daily task in it? | flows + surfaces derive from roles | never |
| QB-A03 | What makes this an obvious success at 3 months? at a year? | acceptance criteria anchor | never |
| QB-A04 | What systems does it replace or live alongside? Why replace them? | migration + integration scope | greenfield |
| QB-A05 | Who accepts the result, and what does their acceptance look like? | "done" is defined by them | never |
| QB-A06 | Biggest failure mode to avoid (data loss? outage? wrong money?) | prioritizes invariants + failure modes | never |

## B. Scope & boundaries (core — always)

| id | question | why | skip |
|---|---|---|---|
| QB-B01 | What is explicitly OUT of scope, v1 and forever? | prevents scope creep + wrong builds | never |
| QB-B02 | Client surfaces needed (web/mobile/desktop/API/CLI), priority order? | component inventory + effort split | API-only system |
| QB-B03 | Scale targets: users, records, requests/sec, retention? | architecture tier decisions | never |
| QB-B04 | Locales, currencies, time zones? date/time display rules? | i18n plumbing is retrofit-hostile | single-locale |
| QB-B05 | Compliance/regulatory: PII, data residency, audit logging? | constrains storage + logs | internal tools |
| QB-B06 | What data exists already and must survive (migration)? | migration plan honesty | greenfield |

## C. Domain & behavior (core — always)

| id | question | why | skip |
|---|---|---|---|
| QB-C01 | Name the core domain nouns and how they relate? | `data.csv` skeleton | never |
| QB-C02 | Walk the lifecycle of each key object (states + transitions)? | `states.csv` + guards | stateless-ish |
| QB-C03 | Which invariants must never break, even under concurrency/race? | the atomic-booking class; test plan | never |
| QB-C04 | Business rules that surprise newcomers (waitlists, auto-close, caps)? | the rules nobody guesses from nouns | never |
| QB-C05 | Edge-time semantics: deadlines, grace periods, timezone basis? | off-by-one-hour bugs | timeless domains |
| QB-C06 | Rate the flows by frequency and by pain-if-broken? | ordering of build phases | never |
| QB-C07 | Which actions are reversible/undoable, which aren't? | confirm/undo design + failure care | never |

## D. Data & integration (select by kind)

| id | question | why | skip |
|---|---|---|---|
| QB-D01 | External systems to integrate (payments, SMS, identity, maps)? | API/cred/async failure surface | none |
| QB-D02 | Per integration: realtime or batch? failure behavior? cost model? | failure-modes + retry policy | none |
| QB-D03 | Read-heavy vs write-heavy? report/export needs? | indexes + store choices | never |
| QB-D04 | Who may see/edit which data (row/tenant-level rules)? | authorization matrix | single-user |
| QB-D05 | Data quality duties: dedupe, validation, cleanup? | ingestion design | clean inputs |

## E. Non-functional (select by exposure)

| id | question | why | skip |
|---|---|---|---|
| QB-E01 | Availability target? offline/degraded mode needs? | architecture + UX state design | internal tool |
| QB-E02 | Performance budgets that matter (page load, API p95)? | measurable acceptance | never |
| QB-E03 | Accessibility bar (WCAG AA default) + target devices/browsers? | the user's acceptance env is canon | API-only |
| QB-E04 | Security posture: threat model concerns worth naming? | authN/Z depth, storage choices | never |
| QB-E05 | Secrets/keys in scope (which providers, rotation expectations)? | deploy design | none |

## F. Delivery & rollout (select by risk)

| id | question | why | skip |
|---|---|---|---|
| QB-F01 | Environment topology (dev/staging/prod) + deployment constraints? | deployment spec | never |
| QB-F02 | Phasing: what ships first, what waits for feedback? | plan ordering + feature flags | never |
| QB-F03 | Cutover/rollout plan (big bang, staged, parallel-run)? | migration + rollback design | greenfield |
| QB-F04 | What's negotiable first if time/complexity bites? | pre-agreed tradeoffs prevent panic | never |

## G. Operations & observability (systems with a service)

| id | question | why | skip |
|---|---|---|---|
| QB-G01 | Who operates this (on-call? office hours?) | ops spec + alert thresholds | throwaway builds |
| QB-G02 | Logging needs: what must be reconstructable later? | log design + retention | never |
| QB-G03 | Metrics/alerts that would page someone? | observability spec | no ops staff |
| QB-G04 | Backup/restore expectations (RPO/RTO)? | storage + ops design | stateless |
| QB-G05 | Background jobs expected (cleanup, dispatch, sync)? | scheduler + failure handling | none |

## H. Content & UX (UI-bearing systems)

| id | question | why | skip |
|---|---|---|---|
| QB-H01 | Navigation model (sidebar/tabs/stack) and information density? | layout class | API-only |
| QB-H02 | Visual identity: existing brand tokens or new? | theme choice + suite policy | API-only |
| QB-H03 | Dark/light themes? which is primary? | token schema both themes | API-only |
| QB-H04 | Tone of copy (formal/friendly)? terminology constraints? | copy drift prevention | API-only |
| QB-H05 | Empty/error/loading states: examples of each that satisfy? | state-hole prevention | API-only |

## I. Cost & constraints (always, short)

| id | question | why | skip |
|---|---|---|---|
| QB-I01 | Hosting/licensing budget ceilings? | tech choices bounded | never |
| QB-I02 | Hard constraints (must-use stack, must-not-use services)? | prevents dead-end plans | never |

## During-construction questions (standing set)

| id | question | why |
|---|---|---|
| QB-X01 | What did you observe that changed an assumption? | → `discovered` spec rows |
| QB-X02 | What would you like working at the next check-in? | phase exit criteria |
| QB-X03 | What's bothering you about the current build? | observation catalog trigger |
| QB-X04 | Who else should see this before it hardens? | review scheduling |

## Growth rule

New questions get the next ID in their section + a `why` + `skip` + provenance
(one line: which project's incident created it). Renumbering is forbidden —
IDs are references.
