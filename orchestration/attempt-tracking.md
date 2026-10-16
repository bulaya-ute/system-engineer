# Attempt ledger — tracking attempts, reverting chains

Every fix attempt on a problem is a **separately tagged commit** on a scratch
branch (`att/<problem-slug>/`), so any failed chain is mechanically revertible.

## Protocol

1. New problem → scratch branch `att/<slug>-<n>`; first commit reproduces or
   instrument-observes the problem (evidence first, fix second).
2. Each attempt = one commit:
   `attempt: N, hypothesis: <one line>, change: <one line>, result: <evidence|refuted>`.
3. Attempts never mix concerns — one hypothesis per commit.
4. **The ledger is forward-only** (dry-run-1 lesson): history is never
   rewritten. A defect discovered after a commit gets its fix as the NEXT
   attempt-tagged commit; folding a fix into an already-reported commit is
   a ledger slip — record it, don't rewrite it.
5. **Root cause found** (e.g. "outdated browser", "stray pasted character
   flipped meaning"):
   - `git revert` the whole failed chain (or reset to the chain's base if the
     branch is scratch-only);
   - apply the true fix as ONE reviewed commit on the working branch;
   - record the incident (attempt count, root cause, revert hash) in the
     agent's `observations.csv` — a `kb` route candidate if the trigger is
     repeatable.
6. **Stop rule**: same error class twice → escalate, don't retry blind;
   three refuted hypotheses with no evidence of progress → halt, report
   blocker to the manager with the ledger summary. Piling patch upon
   refuted patch is prohibited.

## Why git (not notes)

Notes drift from reality; commits *are* the change. `git log` + tags answer
"what exactly did attempt 3 change?" without trusting any narrative. The
ledger's honesty is enforced by the toolchain, not by discipline.

## Branch switching (shared trees)

Declaring/acking happens through `orchestration/branch-registry.md` **before**
any checkout on a shared working tree — see `roles.md`. The registry is the
coordination point; the working tree is never silently switched out from
under other agents.
