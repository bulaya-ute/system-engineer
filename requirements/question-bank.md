# Requirements — intake question bank (v0 starter)

Grouped by phase. The bank grows per project; unanswered questions land in
`open-questions.md` with IDs, never silently assumed.

## A. Purpose & users
1. What problem does this system solve, in one paragraph?
2. Who uses it (roles/personas)? What does each do daily?
3. What would make this an obvious success in 3 months? In a year?
4. What systems does it replace or live alongside?

## B. Scope & boundaries
5. What is explicitly OUT of scope (v1 and ever)?
6. Scale targets: users, records, requests/sec, data retention?
7. Client surfaces (web/mobile/desktop/API-only), per surface priority?
8. Languages/locales, currencies, time zones?
9. Compliance/regulatory constraints (data residency, audit logs, PII)?

## C. Domain & behavior
10. Core domain nouns and their relationships (walk me through them)?
11. Lifecycle of each key object (states + transitions)?
12. Invariants that must never break (double-booking, fare-lock class)?
13. Business rules that surprise (permissions, waitlists, auto-closing)?
14. Time/edge semantics: deadlines, grace periods, timezone handling?

## D. Data & integration
15. Existing data sources/shape? Migration needs?
16. External systems to integrate (payments, SMS, identity, maps)?
17. Read-heavy vs write-heavy patterns? Report/exports needs?

## E. Non-functional
18. Availability/uptime targets? Offline needs?
19. Security model: who may see/edit what (row-level? tenant-level)?
20. Performance budgets that matter (page load, API p95)?
21. Accessibility bar (WCAG AA default) and target devices/browsers?

## F. Delivery
22. Environment topology (dev/staging/prod), deployment constraints?
23. Who accepts? What does their acceptance test look like?
24. Budgeted time/phases? What's negotiable first?

## During-construction questions (always open)
- What did you observe that changed an assumption? (→ spec `discovered` row)
- What would you like to see working at the next check-in?
- What's bothering you about the current build? (→ observation catalog)
