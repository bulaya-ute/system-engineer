# Library router — topic → file map

≤200 tokens. Rebuilt whenever a spec lands. Agents load slices, not books.

| want | go |
|---|---|
| asset/checkout lifecycle domain | `exemplars/snipe-it/` (summary.md, data.csv, flows.md) |
| inventory + licenses + consumables in one system | `exemplars/snipe-it/data.csv`, `states.csv` |
| checkout/checkin API surface pattern | `exemplars/snipe-it/api.csv` |
| status-label taxonomy pattern (user-defined states w/ meta-types) | `exemplars/snipe-it/states.csv` + `decisions.csv` DEC-2 |
| multi-tenancy decision (companies) | `exemplars/snipe-it/decisions.csv` DEC-3 |
| depreciation/warranty/expiry alerting pattern | `exemplars/snipe-it/failure-modes.csv` + `components.csv` |
| exemplar qualification rules | `README.md` |
| untested system classes | `untested/` |
| how a spec is written (format contract) | `../requirements/spec-template.md` |

Matching entry point: intake nouns → this router → similarity tier per
`README.md` matching rule.
