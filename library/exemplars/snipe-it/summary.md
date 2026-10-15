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

**Spec status**: `documented` — written from public docs/API reference
(v7/v8 era), NOT yet run-verified against a live instance (that is
`verification.csv`'s pending work; the exemplar rules require running the
system before rows graduate to `verified`).

**Files** (spec-template tables): requirements.csv · components.csv ·
data.csv · flows.md · states.csv · api.csv · failure-modes.csv ·
verification.csv · decisions.csv
