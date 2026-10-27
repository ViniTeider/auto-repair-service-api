# Coverage evidence

Run `npm run test:cov` to generate the Jest report in `coverage/`.

The critical domain modules are covered by focused unit tests for:

- CPF/CNPJ, plate, money, quantity, and vehicle-year value objects.
- Work-order budget calculation, status transitions, rejection behavior, and item invariants.
- Authentication and API integration flows as the API modules are expanded.

## Validation

The latest run passed — 4 test suites and 19 tests passed. The configured
critical-domain threshold was satisfied:

| Scope                           | Statements |  Lines |
| ------------------------------- | ---------: | -----: |
| `src/core/domain`               |     96.92% | 96.92% |
| `src/core/domain/value-objects` |     92.53% | 93.75% |

The overall project coverage was 44.47% statements and 45.74% lines. The lower overall
percentage is expected because the threshold applies specifically to the critical domain
modules.
