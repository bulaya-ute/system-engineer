# system-engineer

A skill that designs, builds, critiques, and remembers whole systems — for AI agents as primary readers.

- **Designs**: gathers requirements (before *and* during construction), writes complete specs in information-first structures, builds.
- **Critiques**: runs evidence-gated checks on what it builds (contrast math, reuse smells, state holes, cross-browser traps — the `ui-ux-audit` knowledge base is its eyes).
- **Remembers**: a library of complete system specs (open-source exemplars first), so a similar future build starts from a solved problem instead of burning tokens re-deriving it.
- **Coordinates**: multi-agent aware — scopes, reporting lines, branch-checkout agreements, escalation rules, per-agent memory folders.
- **Knows when to stop**: attempt ledgers make failed fix-chains mechanically revertible; nothing gets piled on rubbish.

Public. No private/proprietary project content belongs here — exemplars are open-source systems (Snipe-IT, Odoo, Frappe…) and generic system classes.

## Install & versioning

- **Install** — clone this repo and register it as a skill source (junction
  or `skills` config entry); `SKILL.md` at the root is the entry point.
- **Upgrade** — `git pull`; **pin/downgrade** — `git checkout vX.Y.Z`.
- **Current version** — see [`VERSION`](VERSION); release notes in
  [`CHANGELOG.md`](CHANGELOG.md); promises and playbook in
  [`VERSIONING.md`](VERSIONING.md).

## Dependencies

The skill tree — hard/soft dependencies, absence behavior, and the
in-repo ↔ skill transition map (extractions X1–X7): see
[`DEPENDENCIES.md`](DEPENDENCIES.md).

Status: see [`development-state.md`](development-state.md). Related skill: [bulaya-ute/ui-ux-audit](https://github.com/bulaya-ute/ui-ux-audit).
