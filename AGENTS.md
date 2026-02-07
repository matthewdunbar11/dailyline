# AGENTS.md

## Required Workflow For Every Change
1. Make the code/documentation change.
2. Run unit tests after the change.
3. Run E2E tests when the change affects user flows, navigation, UI behavior, or integrations.
4. Verify the change end-to-end as applicable:
- Compilation/build passes.
- Test suites pass.
- If web/browser behavior is affected and runnable, verify in browser.
5. Commit the change to a non-main branch.

## Branching And Commits
1. Never commit directly to `main`.
2. Work on a feature branch (create one if not already on one).
3. Use clear, scoped commit messages that describe the actual change.
4. Commit only after the verification steps above are complete.

## Failure Handling
1. If unit tests, E2E tests, or compilation fail, do not commit.
2. Fix failures first, then re-run verification.
3. If verification cannot run (missing dependencies/tooling), report what could not be run and why before committing.

## Practical Test Selection
1. Documentation-only changes:
- Run lightweight validation if available; skip E2E.
2. Logic/data-layer changes:
- Run unit tests; run E2E only if user-visible behavior changed.
3. UI/navigation/flow changes:
- Run both unit tests and relevant E2E coverage.
