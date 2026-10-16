# Interactive skeleton — elicitation by letting the user see the system

Owner-proposed 2026-10-15. Lineage: walking skeleton + throwaway prototyping +
Wizard-of-Oz + paper prototyping's deliberate ugliness; novel part: **feedback
modals as in-situ requirement capture**.

## When to use (vs interview alone)

- The user describes a system abstractly ("track my security company's
  vehicle escorts; see live missions") and **can recognize flows they cannot
  verbalize**.
- Early: domain nouns are guessable from expertise/exemplars, so a skeleton
  makes the guesses *visible and correctable* ("it's a job, not a mission").
- One screen the user keeps circling ("the real-time tracking screen") → use
  the targeted single-screen variant instead of the broad skeleton.

## The loop

1. **Domain inference (strong model)** — from the description + exemplar
   matching, infer: entities (Mission, Vehicle, Client, Guard), states,
   roles (dispatcher, guard, client), surfaces (dashboard, dispatch,
   tracking), and the 3–5 typical flows. Write these as a one-page brief
   (models, screens, flows, mock-data notes). The brief is the artifact.
2. **Skeleton generation (cheap model is fine)** — from the brief, one
   self-contained HTML file:
   - zero dependencies, zero build; opens by double-click
   - unstyled on purpose: bordered boxes, labels, placeholder-size rects;
     NO colors/typography (styling invites aesthetic critique instead of
     flow critique — documented bias control)
   - inline mock data named after the inferred nouns (user corrects nouns
     by seeing them wrong)
   - navigable: login → main (sidebar + topbar) → sections; flows walk
     end-to-end (e.g. *New mission*: list → form → submitted state)
   - every **planned-but-unbuilt** control (delete vehicle, assign guard)
     opens a **feedback modal**: textarea "what should this do?", optional
     context captured (which control, which screen)
   - "finish session" exports all captured notes as JSON
     (localStorage-backed so nothing is lost on refresh)
3. **Session** — the user plays; corrections to nouns/flows are made by
   editing notes or telling the AI at hand-back.
4. **Fold-back** — exported notes become:
   - each control-note → `requirements.csv` row `source:discovered`
   - each noun correction → data-table row edits + a `decisions.csv` row
     if it was a naming decision
   - each "this screen needs X" → open question or requirement, `blocking`
     decided immediately
   - contradictions (two notes disagree) surface at the check-in, never
     silently resolved.

## Hard rules

- **Skeletons are throwaway.** They never become the product UI, never get
  styled into one, never ship. Their value dies at fold-back.
- **No styling, ever** — not even "a little". A styled skeleton pulls the
  user into aesthetics where flow feedback dies.
- **Inference stays labeled**: mock data and screens are the *inferred*
   model made visible; the fold-back marks rows `discovered`, and the
   original `inferred` rows flip to `dropped` (with reasons) — never edited
   silently (spec-template lifecycle).
- **Every unbuilt control is a feedback modal** — a dead button without one
   is a lost requirement.
- Deep flows (live tracking, maps) may use fake movement/data **without**
   any real logic — Wizard-of-Oz is the point.

## Spawn split (see `orchestration/spawn-profiles.md`)

- Inference + brief: strong model (getting the domain right IS the task).
- Skeleton generation from brief: cheap/fast model — brief is one page,
  HTML is mechanical, iterations are cheap. Parallel: one skeleton per
  screen-variant if the user wants options.

## Promotion record (2026-10-16, owner "go")

**Kit v1 + session cockpit: PROMOTED from deferred → building.** Evidence bar
met (the discipline held — this is what earned promotion, not endpoint shine):
(1) owner's own in-session words: "comment on a specific component, or a
specific part of the screen" — pre-marked [?] controls cannot do that, only
inspect-mode + click-to-pin can; (2) owner's layering complaint (modal =
"lines drawn over the skeleton") — structural clarity is the kit's job;
(3) best feedback so far arrived via chat because in-situ capture was
missing; (4) owner intent — strongest evidence class. SCOPE: bounded —
cockpit (inspect mode, hover-outline, click/tap-pin, visibility toggle,
notes list, export, screen nav). NO elevation toggle, NO canvas (both stay
deferred until their evidence bars). Proving run = NFC skeleton re-declared
on the kit; the owner's open session continues on the upgraded artifact.

## IDE trajectory verdict (owner question 2026-10-16, recorded)

"Vibe-coding IDE" as a market term = spec-poor, prompt-and-hope generation —
crowded, funded, and the OPPOSITE of this skill's discipline. What the
cockpit → editable-skeleton → elevation arc converges on is a **spec-driven
build studio**: the moat is the library/fold-back loop (accumulated,
verified expertise), which no market product has. Discipline: build the
WIDGETS when sessions prove them; the "IDE" is a packaging decision made
only after the widgets are load-bearing. No standalone IDE is built.

## Planned upgrades (owner-approved design 2026-10-16 — documented, DEFERRED until session evidence; do not build speculatively)

1. **Skeleton kit (framework decision made)** — Vue 3 global build, vendored
   locally (~120KB, MIT; one-time), + a small component kit on top: PinPad,
   TapTarget, MoneyTable, ScreenNav, FeedbackModal, common atoms; monochrome
   structural CSS (spacing rhythm, modal layering via backdrop — structural
   clarity, never aesthetics); feedback-capture composable + finish-session
   export wired ONCE in the kit. Skeletons become declarations (~4x token
   cut measured vs hand-written HTML). DECISION: framework over custom
   engine (owner call — "the problem might already be solved"; correct:
   only feedback-capture and the unstyled-discipline are ours). No LOC
   caps — kit grows only when a real skeleton proves it needs a component.

2. **Session cockpit (owner preference: dedicated controls, not key-combos)** —
   a control panel beside the preview: enter/exit INSPECT mode (hover
   outlines the component under cursor; click/tap pins a comment anchored
   to its stable address `screen+component+context`; works on touch — the
   NFC sessions run on Android). Comments-visibility toggle; notes list;
   finish-session export; screen navigation; fidelity-tier control.
   Keyboard combo may remain as a desktop accelerator (both/and).

3. **Fidelity tiers (owner idea, 2026-10-16)** — Tier 0 skeleton = default
   (flow critique, bias control). Tier 1 = PER-SCREEN elevation on demand
   ("show me this one properly"): real tokens/styling for the named screen
   only, using theme-library/ui-ux-audit assets. Fidelity is a per-screen
   session attribute, not a global mode. Spawn-profile: T0 cheap models,
   T1 elevation strong model + design assets.

4. **Editable skeleton ("canvas" — DEFERRED until sessions show the need)** —
   owner-proposed user-draws-layout mode. Reframed per manager analysis:
   not a blank canvas but an EDITABLE declaration — start from the current
   skeleton, drag/resize/drop kit components (the palette IS the semantic
   shape set: dropping a Table need not be explained), AI diffs the layout
   tree as fold-back. The "chatbox" half is already solved: it is the
   fold-back conversation. Build trigger: ≥2 sessions where layout intent
   fought words. Trajectory (named by owner, owned openly): cockpit →
   editable skeleton → live elevation = a vibe-coding IDE arc, built only
   on evidence.
