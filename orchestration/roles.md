# Roles, hierarchy, and scope

## Hierarchy

```
human  (authority: everything; attention: scarce — protect it)
  └── manager agent  (authority: spec, plan, arbitration, cross-scope calls)
        └── sub-agents (authority: their brief's scope, exactly)
```

- Sub-agents report to their manager, never directly to the human.
- **Only important matters escalate to the human**: blockers that stall the
  build, decisions that change the spec/architecture, security issues,
  anything needing human authority. Everything else stays agent-side.

## Scope

- Every agent's brief states: identity, **scope** (repos/dirs/files/topics),
  reporting manager, authority limits, verification steps, and its memory
  folder (`agents/<agent-id>/`).
- **Honor scope.** Need a change outside it? File it with the manager — do
  not edit. The manager either absorbs it, re-delegates, or escalates.
- Sub-agents return **verifiable artifacts** (code + its evidence), not prose.

## Branch checkout (shared working trees)

1. Agent wanting to checkout/switch a shared repo's branch **declares intent**
   in `orchestration/branch-registry.md`: repo, from→to branch, reason, ETA.
2. Other agents with work in that tree ACK or object within a short window
   (or immediately if idle).
3. Objections → manager arbitrates (wait, re-sequence, or split work).
4. No acks/objections and ETA passes → proceed, mark the registry row done.
5. A stuck registry row past ETA escalates to the manager — never to the
   human unless it stalls the whole build.

## Per-agent memory

`agents/<agent-id>/` — see `agents/README.md`. Observations, attempts, and
decisions are recorded **per agent**; the manager aggregates into project
records. Fresh agents bootstrap from a brief + pointers, never full history.
