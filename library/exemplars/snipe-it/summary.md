# Snipe-IT — exemplar spec summary

**What it is**: self-hosted open-source IT asset management (Laravel/PHP,
MySQL). Tracks hardware assets, licenses, accessories, consumables and
components; who/where they're assigned; depreciation, maintenance, audits.

**Who it serves**: IT departments — admins (inventory managers) +
end-users (request/see own assets) + finance (depreciation reports).

**What makes it hard**: the checkout/checkin lifecycle on a polymorphic
assignment target (user *or* location); license-seat accounting;
consumable stock decrement; user-defined status labels that still have to
behave (meta-types: deployable/pending/archived/lost); per-company data
isolation; custom fields per category; a full REST API.

**Spec status**: `run-verified 2026-10-16` (V-01…V-05 executed against a
live docker instance — see `verification.csv`; V-06/V-07 pending: company-mode
toggle + CSV multipart). Discoveries folded in: ERR-envelope semantics
(HTTP 200 + {status:error} on rejections), category_type `asset` (not
`hardware`), consumable qty ignored (1 call = 1 unit), license checkout needs
`target_type`.

**Files** (spec-template tables): requirements.csv · components.csv ·
data.csv · flows.md · states.csv · api.csv · failure-modes.csv ·
verification.csv · decisions.csv
