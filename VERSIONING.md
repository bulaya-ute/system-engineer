# Versioning — releases, upgrade/downgrade, compatibility promises

One version for the whole skill: `vX.Y.Z` (semver, pre-1.0) tags `main`.
`VERSION` is canonical, the SKILL.md footer mirrors it, and the git tag must
match them. Pre-1.0 means machinery may still change — the promises below
still hold.

## Bumps (maintainer rule)

- **MINOR** — any halt that changes machinery (a resumed build would behave
  differently): SKILL.md, `requirements/`, `orchestration/`, `library/`.
- **PATCH** — corrections that don't change behavior (typos, links,
  clarifications). Board-only edits ride along with the next bump.

## Release process (at halt consolidation)

1. Update `VERSION`, the SKILL.md version footer, and `CHANGELOG.md`
   (Added / Changed / Fixed — phrased as *what a resumed build would do
   differently*).
2. Commit; tag `vX.Y.Z`; publish the GitHub release from the changelog
   section.

## Upgrade / downgrade (any install)

- **Upgrade**: `git pull` — junctioned or registered installs update in place.
- **Pin / downgrade**: `git checkout vX.Y.Z`.
- **Know your version**: `VERSION`, or `git describe --tags`.

## Compatibility promises (project artifacts)

Spec folders, ledgers and observations written under any version stay
readable under every later version — **upgrades never migrate or rewrite
project data**. Concretely:

1. **IDs are forever** — `R-14`, `QB-A01`, `OBS-…`: never renumbered, never
   reused for different meanings.
2. **Formats are additive-only** — tables gain columns/rows/sections; an
   existing column never changes meaning (new meaning = new column or file).
3. **History is forward-only** — ledgers and boards append; corrections are
   new rows, never rewrites.
4. **Mismatches are visible** — spec folders record their producing version
   (`skill: vX.Y.Z @<short-commit>` at intake); a newer skill reading an
   older spec knows what machinery it assumed, and an older skill reading a
   newer spec can flag references it doesn't know (e.g. right-sizing).
5. **Process moves, data doesn't** — new machinery may supersede old
   practice (new questions, new scales); existing spec content stays valid
   without edits. Artifact-internal labels (kit v1, shell v2) version
   components *inside* the skill, not the skill itself.

1.0 gate: owner call, not scheduled (lean: after the NFC first real loop
completes and E4 has evidence).
