# Spawn profiles — task-class → model tier + brief template

Multi-model dispatch: when multiple models are available, task class decides
the tier. The brief is always the contract — a cheap model with a precise
brief beats a strong model guessing.

## Profiles

| task class | tier | brief contains | artifact + evidence required |
|---|---|---|---|
| skeleton generation | cheap/fast | interactive-skeleton brief (1 page: models, screens, flows, mock notes) | one HTML file, zero deps; self-check: opens, nav works, modals fire, export produces JSON |
| interview / intake | strong | question-bank section, recording rules | requirements.csv rows with IDs |
| spec writing | strong | spec-template + the intake artifacts | full table set, ID-consistent |
| exemplar matching | any (table-driven) | router + intake nouns | similarity tier + delta list |
| code generation, greenfield core | strong | spec slices + verification.csv rows | code + passing verification evidence |
| mechanical port (tokens/CSS/values) | cheap | exact from→to mapping table | diff + verification re-run |
| audit / critique | strong + ui-ux-audit KB | artifact + acceptance environment | findings with evidence tiers |
| documentation / summaries | cheap | sources by pointer (IDs) | terse doc, IDs preserved |

## Rules

- **Tier is a floor, not a cage** — escalate one tier on: ambiguous brief,
  second same-class failure, or any domain-inference moment. Never let a
  cheap model *infer* domains (the brief must already carry the inference).
- **Brief quality gates the spawn** — if the brief can't be written in ≤1
  page with IDs and verification steps, the task is not spawnable yet;
  decompose first.
- **Evidence is tier-independent** — a cheap-model artifact passes the same
  verification a strong-model artifact does. Cheap ≠ unverified.
- **Parallelism** — independent task classes run concurrently (skeleton +
  document analysis + exemplar matching are classic co-runners).
- Fresh context is a feature: spawned agents get the brief + pointers only.

## Growth rule

New task classes get a row only after being exercised on a real build —
with a provenance note of which project ran them first.
