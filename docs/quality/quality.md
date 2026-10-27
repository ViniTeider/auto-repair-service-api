# Quality evidence

The repository quality checks are:

- `npm run lint` for static analysis.
- `npm run build` for the production TypeScript build.
- `DB_HOST=localhost npm run test:e2e -- --runInBand` for PostgreSQL-backed integration tests.

## Validation

| Command | Result |
| --- | --- |
| `npm run lint` | **Passed** |
| `npm run build` | **Passed** |
| `DB_HOST=localhost npm run test:e2e -- --runInBand` | **Passed** — 2 suites and 16 tests |

The e2e validation uses the PostgreSQL service started by Docker Compose. The
`DB_HOST=localhost` override is required because the tests run on the host while the
application container uses the Docker service name `postgres`.
