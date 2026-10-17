# Coverage evidence

Run `npm run test:cov` to generate the Jest report in `coverage/`.

The critical domain modules are covered by focused unit tests for:

- CPF/CNPJ, plate, money, quantity, and vehicle-year value objects.
- Work-order budget calculation, status transitions, rejection behavior, and item invariants.
- Authentication and API integration flows as the API modules are expanded.
