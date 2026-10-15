# library/ — solved systems, router-first

## Router manifest (to be created as `library/_router.md`)

A ≤200-token index mapping: `topic → file + line-range`. Agents load slices
through it, never whole files. It is rebuilt whenever a spec lands (scripted
later; see development-state Q-B for the SQLite threshold).

## exemplars/ — complete specs of working open-source systems

Qualification rules:
- The system must be **working, open-source, publicly documented** — specs are
  written from real behavior (running the code, reading its schema), not
  marketing pages.
- **No private/proprietary projects** (owner's rule, 2026-10-15).
- Each exemplar folder = the full table set from
  `requirements/spec-template.md`, plus a one-screen `summary.md` (what the
  system is, who it serves, what makes it hard).

Candidates (unstarted): `snipe-it/` (asset management — lean: start here),
`odoo-erp/` (huge: domain chunks only), `frappe/`.

## untested/ — system classes awaiting their first real build

Fleet tracking · ride ticket booking (generic) · HR management · POS ·
library/asset management · ERP-core. Each gets a stub folder only when a
build is scheduled; results and lessons return here, code stays in its own
project repo.

## Matching rule (the token-saver)

On intake, map the request's domain nouns + lifecycle + scale to the router.
Similarity tiers:
1. **Near match** (same domain class, ~same lifecycle) → start from the
   exemplar spec; ask only the deltas.
2. **Adjacent** (shared nouns, different lifecycle) → copy the relevant
   tables, mark rows `assumed`, confirm at check-in.
3. **No match** → full intake; the finished spec joins the library.
