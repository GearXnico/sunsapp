---
name: release
description: Use when closing a version: prepares release/x.y.z from develop, the CHANGELOG and the PRs to main and back to develop; the maintainer merges and tags.
---

# release

The agent prepares the release; **The maintainer merges both PRs and creates the tag. The agent never merges, approves, tags or pushes to `main` or `develop`.**

1. Pick the version `x.y.z` from the `## [Unreleased]` section of `CHANGELOG.md` and the latest released version, with SemVer: a breaking change to the API contract bumps MAJOR, any `Added` feature bumps MINOR, otherwise PATCH. If the maintainer gave a version, use it.
2. Branch from an up-to-date `develop`:
   ```bash
   git fetch origin
   git switch -c release/x.y.z origin/develop
   ```
3. Finalize `CHANGELOG.md`: rename `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD`, group its entries (Added, Changed, Removed, Fixed, Security), remove empty headings, and leave no `Unreleased` section behind. Commit: `docs: finalize changelog for x.y.z`.
4. Run the `check` and `security-pass` skills; both must be green.
5. Push and open the PR to `main`, filling `.github/PULL_REQUEST_TEMPLATE/release.md` (what's new, every feature with its PR, fixes, under the hood):
   ```bash
   git push -u origin release/x.y.z
   gh pr create --base main --head release/x.y.z --reviewer GearXnico \
     --title "chore: release x.y.z" --body-file <filled-release-template.md>
   ```
6. After the maintainer merges it into `main`, open the back-merge PR so `develop` gets the release commits:
   ```bash
   gh pr create --base develop --head main --reviewer GearXnico \
     --title "chore: merge release x.y.z back into develop" --body "Back-merge of release x.y.z."
   ```
7. Tell the maintainer the tag to create on `main` after the merge: `vX.Y.Z` (for example `git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0`, or a GitHub release). Do not create it yourself.
