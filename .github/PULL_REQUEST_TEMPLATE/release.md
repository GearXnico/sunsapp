<!-- Release PR: `release/x.y.z` → `main`. Open it with `?template=release.md`. The maintainer merges (rebase & merge) and creates the tag. -->

# Release x.y.z

## What's new

<!-- Two or three sentences for someone who uses the app: what they can do now that they couldn't before. -->

## Features included

<!-- One line per feature or user-visible change: short description, then the PR that brought it. -->

- **<Feature name>:** <what it does for the user>. (#<PR>)

## Fixes

<!-- One line per bug fixed, as the user would have noticed it. Leave the section out if there are none. -->

- <What was wrong and how it behaves now>. (#<PR>)

## Under the hood

<!-- Upgrades, refactors, CI and docs that a user does not see. One line each. -->

- <Change>. (#<PR>)

## Checklist

- [ ] `CHANGELOG.md` has the `## [x.y.z]` section at the top
- [ ] CI green on this branch
- [ ] After the merge: tag `vx.y.z` on `main` (maintainer)
- [ ] After the merge: `develop` brought up to date with `main`
