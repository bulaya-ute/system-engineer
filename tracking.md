# Tracking — artifacts, issues, and the truth

The OS's project brain. The contract lives here; the data lives with the
project (its own repo, `tracking/` folder). **Rule zero: state is updated from
reality, never from claims** — "done" exists only as evidence (verification
results, repo inspection, owning-skill reports). Corrections append; nothing
is silently rewritten.

## Artifacts registry — `artifacts.csv`

`id, type, version, status, produced-by, compliance, links, evidence, updated`

- `type`: requirements | spec | build (extendable).
- `version`: the artifact's own version — requirements docs and specs are
  versioned documents; links say which one answers which.
- `status`: `draft → review → stamped → building → verified → superseded`.
  A spec is `stamped` only with spec-standard's compliance result; a build
  is `verified` only with evidence.
- `produced-by`: `skill@version @commit` (provenance).
- `links`: upstream/downstream artifact ids — which spec version implements
  which requirements version; which build corresponds to which spec version.
- `evidence`: pointer to the verification/report that justifies `verified`.

## Issues — `issues.csv`

`id, issue, severity, owner, status(open|in-progress|blocked|done), opened,
closed-by, evidence`

Distinct from `open-questions` (unknown requirement) and failure-modes
(design-level). Issues are the live defect/task register.

## Truth reconciliation (the update protocol)

Runs on: session resume · phase exits · before any status report · on demand.

1. **Query reality** — repo state, verification suites (re-run where cheap),
   owning skills asked for current status *with evidence*.
2. **Diff** — registry vs reality; every mismatch becomes an item.
3. **Apply** — update rows (append a new version/row where history matters);
   open an issue for "claimed done, evidence absent"; never mark from memory.
4. **Record** — a reconcile entry: when, by whom, method, what changed. The
   audit trail is what makes the registry trustworthy.

## Scenarios

Scenario routing lives in `scenarios.md`; every scenario reads and updates
tracking as it runs.

## Provenance

Artifacts carry producing skill + version + dep set (see `DEPENDENCIES.md`),
so mismatches stay visible across upgrades and downgrades — VERSIONING
promise 4 extended to projects.

## Extraction

Core contract now. When reconciliation grows tooling (scripts that query
git/repos, run verify suites, validate the registry, render status), it
moves (not copies) to a `project-tracking` skill.
