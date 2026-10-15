# Requirements techniques — catalog

Technique families with when-to-use. Combinations are normal; the intake
procedure (`../intake-procedure.md`) drives selection. Every technique's
artifact folds back into the spec tables (`../spec-template.md`) — a
technique whose output doesn't fold back is chat, not elicitation.

| technique | best-for | cost | artifact | token-profile | provenance |
|---|---|---|---|---|---|
| interview (question bank) | unknown-unknowns discovery | high (human time) | `requirements.csv` rows `source:user` | strong-model, manager-run | BABOK; our bank v1 |
| questionnaire / async bank | distributed stakeholders | low | same rows, batched | cheap-model can tabulate | BABOK; our bank v1 |
| interactive skeleton | users who can *recognize* but not *describe* flows | med (build) + low (session) | `discovered` rows + open questions | strong: domain inference; cheap: skeleton generation | owner proposal 2026-10-15 (see `interactive-skeleton.md`) |
| targeted single-screen skeleton | one flow the user can't verbalize (e.g. live tracking) | low-med | deep `discovered` rows for one screen | cheap-model friendly | owner proposal, same session |
| observation / contextual inquiry | tasks already done manually today | high | flow steps + pain points → flows.md | strong-model observes, summarizes | classic CI (Holtzblatt) |
| document analysis | existing SOPs, spreadsheets, legacy DB schemas | low | data.csv seeds, constraints | cheap-model extract, strong-model reconcile | BABOK |
| story mapping | prioritization across a broad surface | med | phased plan + backlog order | strong-model facilitate | Patton |
| journey mapping | multi-actor, multi-day lifecycles | med | flows.md + states.csv skeletons | strong | standard UX practice |
| card sorting | noun/terminology discovery, IA | low | corrected domain nouns | cheap-model can run | standard |
| workshops (requirements) | contested priorities, cross-team invariants | high | decisions.csv rows | strong | BABOK |
| exemplar / competitive matching | domains similar to a library system | very low | delta-only requirements | any-model, table-driven | our `library/` matching rule |
| wizard-of-oz | behaviors too costly to build, must feel real | med | flow corrections | strong runs the wiz | HCI classic |

## Selection heuristics

1. Always: interview core (A–C) + exemplar match first (cheapest coverage).
2. User says "I want to **see** it" or names a screen they can't describe →
   interactive skeleton (broad) or targeted single-screen variant.
3. Existing manual process (spreadsheets, paper) → document analysis +
   observation before asking questions the documents already answer.
4. Multi-actor lifecycle (request → approve → dispatch → complete → bill) →
   journey mapping before story mapping.
5. Techniques compose across one intake; each artifact folds back by ID.

## Growth rule

A lived technique (used on a real project) gets a provenance update; a new
technique gets cataloged only with a when-to-use + artifact + token profile
— the same evidence bar as the audit KB.
