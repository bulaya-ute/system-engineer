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
