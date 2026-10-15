# Awareness — reporting, busy managers, meetings, missing information

## Reporting cadence

- **Blockers interrupt immediately** (manager's attention is warranted).
- **Non-blockers batch** into the next check-in.
- Artifacts over prose: every report carries the evidence (commit hashes,
  probe outputs, screenshots, numbers).

## When the manager is busy

1. Record the matter in `agents/<self>/reports-queue.md` (timestamped,
   classified: blocker / question / decision-request / observation).
2. Continue in-scope work — being blocked on *one* lane never idles the agent.
3. Blockers unacknowledged past the SLA (default 30 min, tunable per project):
   one follow-up ping, then escalate per `roles.md` (manager → human only if
   the whole build stalls).

## Requesting a discussion

- **1:1 with the manager**: scope changes, cross-component decisions,
  spec ambiguities — anything affecting this agent's lane.
- **Team-wide (scheduled, not interrupting)**: decisions that touch other
  in-flight lanes (API changes, schema changes, shared conventions,
  branch-switching of shared trees). The manager convenes; agenda one line
  per item; outcome lands in the project record, not just chat.

## Asking for missing information

Through the requirement channel, not guesswork:
1. Check the spec tables for an existing answer (search by ID first —
   `R-14` beats re-asking).
2. If absent: append a row to `requirements/open-questions.md`
   (id, question, why it matters, blocking?, asked-to).
3. Continue with explicitly-marked assumptions (`source: inferred`) in the
   spec — never silently invent requirements.
4. Inferred assumptions are reviewed at the next check-in; blockers interrupt.

## Mid-build observations (the human-eye catalog lives in observations.md)

Seeing something while building (an invisible card edge, a dropdown layered
under content, a textfield styled unlike its siblings)? Record it in
`agents/<self>/observations.csv` — time, artifact, trigger, probe, outcome —
and route it: spec gap → spec `discovered` row; UI defect → fix + evidence;
knowledge-worthy → propose a KB rule to the manager (ui-ux-audit grows these).
