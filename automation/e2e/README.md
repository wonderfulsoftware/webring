# webring e2e

E2E tests based on Cypress.

## Run with Docker

(Note: Invoke this command in repo root.)

```
docker-compose -f docker-compose.e2e.yml up
```

Then, open <http://localhost:6080> to control Cypress Test Runner.

## Development

Run `yarn` inside `automation/e2e` first so that type definitions are properly fetched.
