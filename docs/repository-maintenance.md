# Repository maintenance

## Automated checks

- **Cube design system / verify** runs the complete release gate on pull requests, pushes to the configured development branches and main, and daily at 09:23 UTC. It can also be started manually. It never publishes a release.
- **Security / CodeQL** scans JavaScript and TypeScript on pull requests, main pushes, and daily at 08:47 UTC.
- **Security / Dependency review** blocks newly introduced high or critical vulnerable dependencies on pull requests.
- **Security / Dependency audit** checks the committed lockfile, including development dependencies, on the same daily and change triggers. High and critical findings fail the job.
- Actions are pinned to immutable commit SHAs. Checkout credentials are not persisted, and jobs receive read-only repository access except CodeQL's security-result upload permission.

GitHub schedules are best-effort and run only once these workflows are on the default branch. GitHub may disable schedules after 60 days without repository activity. Failed-run notifications follow each maintainer's GitHub Actions notification preferences; these workflows do not configure email subscriptions.

## Renovate

The configuration retains the organization preset, allows update PR creation every day between 00:00 and 05:59 UTC, enables the dependency dashboard, and refreshes the lockfile weekly on Monday in the same window. Patch, minor, and major changes all require manual merging. Updates to pinned GitHub Actions are included.

The Renovate GitHub App must be installed for this repository. Configuration alone does not install or start a bot. Verify repository access in the organization's installed GitHub Apps, then confirm a Renovate dashboard or update PR appears. The app's own scan cadence controls when it visits within the configured daily window. Do not add Dependabot version-update PRs alongside Renovate; Dependabot vulnerability alerts can remain enabled.

## GitHub settings checklist

Apply settings separately after owner confirmation:

- Protect main with required pull requests, conversation resolution, up-to-date required checks, and no force pushes or branch deletion. Apply rules to administrators too.
- For a solo maintainer, use zero required independent approvals so the owner can merge their own PR after checks pass. Raise this once another reviewer is available.
- Require the existing `verify` check. Add `CodeQL`, `Dependency review`, and `Dependency audit` only after they have run successfully and their exact check names are visible in GitHub.
- Enable Dependabot alerts, secret scanning and push protection where available. Verify the dependency graph is enabled for dependency review.
- Require approval before running workflows from outside contributors. Never expose secrets or privileged tokens to untrusted pull requests.

Do not bypass a failing release gate to merge dependency updates. Investigate failures, including unrelated regressions, first. GitHub artifact storage quota failures do not currently fail the release gate, so logs may be the only diagnostic artifact available until quota recovers.
