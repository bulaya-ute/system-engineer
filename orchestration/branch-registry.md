# Branch registry — checkout coordination for shared working trees

Scale gate: **team build** — shared trees are the reason this exists; solo
lanes use `att/` branches without registry ceremony (`right-sizing.md`).

Table of declared checkout intents on shared repos. **No agent switches a
shared working tree without a row here + acks (or manager arbitration).**

## Columns

`id · time · repo · from→to branch · reason · ETA · declared-by · acks ·
objections · status (open|acked|arbitrated|done|aborted)`

## Rows

| id | time | repo | from→to | reason | ETA | by | acks | objections | status |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — |

(Empty until the first multi-agent build; convention proven in the first
dry run — see development-state.md.)

## Micro-protocol

- Idle agents ACK immediately (their work isn't in that tree / is committed).
- Agents with in-flight work in that tree ACK after committing or state an
  objection with a finish-by time.
- Objections the declarer can't wait out → manager arbitrates.
- Rows are immutable once `done` — the history doubles as an audit trail.
