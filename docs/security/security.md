# Security checks

The application applies Helmet, global DTO validation, bcrypt password hashing,
expiring JWTs and JWT protection on administrative routes.

Run the following checks before release and attach their generated output here:

```sh
npm audit --audit-level=high
docker run --rm -v "$PWD:/repo" aquasec/trivy fs /repo
```

Secrets belong in `.env`; only `.env.example` may be committed.
