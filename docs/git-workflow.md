# Git workflow

- `main` is protected and always deployable.
- Create short-lived branches from `main`: `feat/...`, `fix/...`, `chore/...`,
  or `docs/...`.
- Do not directly push to `main`, except for an explicit emergency hotfix.
- Use focused pull requests and request review from the other developer.
- The technical lead approves architecture, contracts, migrations, auth,
  infrastructure, and dependency changes.
- Squash merge approved pull requests after all required checks pass.
