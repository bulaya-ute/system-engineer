# open-questions.md — machinery header + live rows

Open questions live **per project** (in that project's spec folder, this same
format). This file defines the machine; projects instantiate it.

## Row format (CSV)

`id, question, why, blocking(yes/no), blocks?(phase/table/row ids), asked_to, asked_at, answer, answered_by, answered_at, status(open|answered|dropped), folded_into`

- `folded_into` = the `requirements.csv` row ID(s) the answer became.
- `dropped` requires a reason inside `answer` ("superseded by R-19" etc.).

## Lifecycle rules

1. **`blocking` is decided at creation time** — never left ambiguous.
2. Blockers interrupt the manager (see `orchestration/awareness.md`);
   non-blockers batch to the next check-in.
3. **Answered** → immediately folded into `requirements.csv` (with the
   question ID in the rationale) and the row set `status:answered`.
4. **Stale** (a non-blocker unanswered past the phase that needed it): the
   agent proceeds with an explicit `source:inferred` requirement row +
   a `why` note in `answer`; the open row stays open until reviewed —
   inferred assumptions never silently graduate to facts.
5. **Dropped** questions stay visible (history = requirements archaeology).
6. Fresh agents discovering an unknown first **search existing rows by ID**,
   then ask — re-asking an answered question is a token crime.

## Seeding (project instantiation)

A project's spec folder starts with this header verbatim + zero rows. Rows
arrive from intake sessions, mid-build discoveries, and review check-ins.
