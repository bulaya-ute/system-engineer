# Observations — per-agent records + the shared catalog

Scale note: team = `agents/<id>/observations.csv` (below); solo = one
`observations.csv` in the spec folder; one-shot = informal — only repeatable
lessons surface, as KB candidates. The catalog below applies at every scale
(`right-sizing.md`).

## Per-agent recording (mandatory)

Every agent records observations in **its own** memory folder,
`agents/<agent-id>/observations.csv`:

```csv
id,time,artifact,trigger,probe,outcome,route
OBS-2026-10-15-1,2026-10-15T08:12,web/src/Shell.tsx,"card edge invisible vs bg (#f8fafc on #ffffff)","contrast() both","1.04:1 — fails 3:1 non-text","fix: --border tier; KB: L-6 candidate"
```

`route` is the required disposition: `fix` (done, with evidence) ·
`spec` (new `discovered` row in the spec) · `kb` (proposed rule to the
manager, for the ui-ux-audit knowledge base) · `watch` (not actionable yet).
Unrouted observations are not allowed — an observation without a disposition
is noise.

## The shared catalog (what to look for while building)

Seeded from lived incidents (source tags = provenance). Agents run this
catalog mentally while working; each entry: trigger → likely cause → cheap
probe.

- **Invisible boundary** — card/table edge near-identical to background.
  Probe: contrast ratio of the pair (≥3:1 non-text). *(lived: LusakaRide
  admin dark borders)*
- **Layered-under content** — dropdown/tooltip painted behind something.
  Probe: z-index inventory at the node. *(classic; probe early, not after
  styling)*
- **Sibling drift** — one input/button styled unlike its siblings = probable
  inline copy instead of the shared component (reuse smell). Probe: grep the
  class/style block; compare tokens. *(audit C-1 family)*
- **State by color alone** — selection/status conveyed only by color.
  Probe: remove color mentally; does state survive? *(lived: selected
  sidebar item; fixed with accent bar)*
- **Hint-as-data** — placeholder that reads like stored user data.
  Probe: screenshot it cold; would a user think it's prefilled?
- **Stale metric beside error** — number from the previous state paired with
  a fresh error. Probe: force the error; check neighbors.
- **Cross-environment rendering** — looks broken only in one browser/tool.
  Probe: reproduce in the *user's* acceptance environment before "fixing".
  *(lived: Chromium-vs-Firefox dark border gamma — revert-first lesson)*
- **Grammar/interpolation gaps** — `via 1 stops`, `Good evening, !`.
  Probe: render with boundary data (0, 1, empty, very-long).

Growth rule: every lived incident with a repeatable trigger+probe becomes a
catalog row (proposed through the manager; provenance tag mandatory).
