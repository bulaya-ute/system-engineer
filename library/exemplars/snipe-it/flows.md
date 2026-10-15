# flows

## checkout asset (hardware)
actors: admin (or API key)
trigger: asset list / asset detail → *Check out*
steps:
1. admin selects asset (must be deployable status; else blocked with reason)
2. picks target: user OR location (polymorphic)
3. optional: expected checkin date, mail-on-checkout flag, e-sign acceptance
4. system writes assignment, sets status deployable→checked_out (via status label semantics)
outcomes: asset shows checked_out to target; user notified; webhook fires
failure-branches: already assigned → 409-ish error; non-deployable → blocked; FULL-company mode + cross-company target → blocked

## checkin asset
actors: admin
trigger: *Check in* on an assigned asset
steps: 1. optional note/status-on-checkin 2. assignment cleared 3. optional acceptance-reminder close
outcomes: asset deployable; webhook fires
failure-branches: never checked out → error

## request asset (self-service)
actors: end-user → admin
trigger: requestable asset shown to user → *Request*
steps: 1. user requests (qty 1) 2. admin sees request queue 3. approve → checkout flow runs (target=requester); or cancel
outcomes: approved → normal checkout + notification; cancelled → user notified
failure-branches: asset became non-requestable meanwhile → request invalid

## consumable checkout (stock decrement)
actors: admin
trigger: consumable → *Checkout*
steps: 1. pick user + qty 2. qty check 3. decrement 4. record row
outcomes: user holds qty; stock reflects
failure-branches: qty > remaining → blocked (never negative)

## license seat checkout
actors: admin
trigger: license → *Checkout seat*
steps: 1. pick user (or free-seat list) 2. seats_out check vs seats_total 3. assign seat row
outcomes: seat held; available-seat count drops
failure-branches: no free seat → blocked; reassignable flag may allow override of a held seat (recorded decision)

## audit asset (physical)
actors: admin
trigger: audit report / asset → *Audit*
steps: 1. print/check expected location 2. mark audited (+note: found/not found) 3. last_audit_date set
outcomes: audit log row; report shows unaudited delta
failure-branches: not found → status→lost workflow available

## CSV import
actors: admin
trigger: *Import* → upload
steps: 1. map columns 2. process rows 3. errors batched per row with reasons
outcomes: import row: processed/errors counts; errors downloadable
failure-branches: partial success IS the norm — never all-or-nothing
