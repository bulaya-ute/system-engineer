# Intake procedure — how requirements gathering runs

Scale check first: one-shot intake shrinks to intent + acceptance
(`../orchestration/right-sizing.md`); this procedure governs solo lanes
and team builds.

## Session shape

1. **Manager (or delegated intake agent) runs the bank** (`question-bank.md`):
   core sections A–C always; D–H selected by system kind (API-only skips H,
   throwaway builds skip G, etc. — honor the `skip` column, don't improvise).
2. **≤15 questions per session.** More than that, answers degrade. If more
   are needed, batch: session 1 (A, B), session 2 (C + selected), session 3
   (rest + review of inferred assumptions).
3. Questions are answerable async where possible: phrase them so a reply can
   be a sentence, not a meeting.

## Recording (the part that makes it a system)

- **Provenance first**: the spec folder records the producing skill version
  — `skill: vX.Y.Z @<short-commit>` — so an upgrade or downgrade can tell
  what machinery the spec assumed (`../VERSIONING.md`).
- Answer lands **directly as a `requirements.csv` row**:
  `id, requirement, rationale, source:user, status:accepted, verification…` —
  not in chat, not in a doc that drifts.
- No answer yet → `open-questions.md` row (see its header) with
  `blocking:yes/no` decided immediately.
- Partial answer → requirement row with `source:user` for the answered part +
  `source:inferred` rows for the agent's completion of it — assumptions are
  always visible as `inferred`, never blended into `user`.
- Every requirement row must name its **question ID** (`QB-…`) in the
  rationale or a dedicated column — traceability from spec back to intake.

## During construction (requirements keep being gathered)

- Mini-intakes run at phase boundaries using the standing set (QB-X01…X04).
- Mid-build observations that change an assumption → spec `discovered` row +
  the affected `inferred` rows flipped to `dropped` (never silently edited).
- New questions discovered mid-build enter the bank with provenance, so the
  next system's intake already asks them.

## Stop conditions

- Stop asking when: the remaining questions are all `inferred`-answerable AND
  a check-in is scheduled to review those assumptions before the phase that
  depends on them.
- Never stop asking when: a `blocking:yes` open question's dependent phase is
  next — that's a blocker escalation path (see `orchestration/awareness.md`).
