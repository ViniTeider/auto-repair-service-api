# Security checks

The application applies Helmet, global DTO validation, bcrypt password hashing,
expiring JWTs and JWT protection on administrative routes.

Run the following checks before release and attach their generated output here:

```sh
npm audit --audit-level=high
docker run --rm -v "$PWD:/repo" aquasec/trivy fs /repo
```

Secrets belong in `.env`; only `.env.example` may be committed.

## Latest validation

Validated on 2026-10-22:

| Check                                                    | Result                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm audit --audit-level=high`                           | **Failed** — 25 vulnerabilities: 2 high, 21 moderate, 2 low, 0 critical   |
| `docker run --rm -v "$PWD:/repo" aquasec/trivy fs /repo` | **Passed** — no production dependency vulnerabilities or secrets detected |

The dependency scan improved after updating `nodemailer` to `10.2.1`. Remaining audit
findings are primarily transitive development dependencies and require targeted upgrades.
