# Security checks

The application applies Helmet, global DTO validation, bcrypt password hashing,
expiring JWTs and JWT protection on administrative routes.

Run the following checks before release and attach their generated output here:

```sh
npm audit --audit-level=high
docker run --rm -v "$PWD:/repo" aquasec/trivy fs /repo
```

Secrets belong in `.env`; only `.env.example` may be committed.

## Validation

| Check                                                    | Result                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm audit --audit-level=high`                           | **Failed** — 6 vulnerabilities: 2 high, 2 moderate, 2 low                           |
| `docker run --rm -v "$PWD:/repo" aquasec/trivy fs /repo` | **Passed** — no production dependency vulnerabilities or secrets detected           |

The remaining npm audit findings are transitive development dependencies (`tmp` and
`undici`, through `@nestjs/mau`); the production dependency findings (`body-parser`
and `multer`) have been fixed.
