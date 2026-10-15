# agents/ — per-agent memory folders

One folder per agent instance: `agents/<agent-id>/`. Fresh agents bootstrap
from their brief + pointers, **never** from another agent's full history —
the manager aggregates what matters into project records.

## Folder structure (convention)

```
agents/<agent-id>/
  brief.md              # assigned at spawn: identity, scope, reporting
                        #   manager, authority limits, verification steps,
                        #   pointers to the exact spec slices needed
  observations.csv      # per-agent observation ledger (see
                        #   orchestration/observations.md for the format)
  reports-queue.md      # batched matters for the manager (when busy) —
                        #   classified: blocker|question|decision|observation
  handoff.md           # written at lane-exit: state, in-flight items,
                        #   gotchas — the successor's entry point
```

## Rules

- **Write your own folder; read others' only when pointed to** (handoffs).
- The brief is the authority on scope — when brief and habit disagree, brief
  wins; when the brief seems wrong, that's a manager question, not a
  unilateral reinterpretation.
- Observations are unrouted never — every row gets a disposition.
- handoff.md is the *only* file written for a successor; everything else is
  the agent's own working memory. Aggregation is the manager's job.
- Folder size discipline: ledgers stay tables; anything narrative and longer
  than a screen belongs in the project records, referenced by ID.
