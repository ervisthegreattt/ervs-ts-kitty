# Release Checklist

Follow this checklist before and after publishing Erv's TS Kitty.

## Pre-Release
1. **Refresh repository**
   - `git status` (ensure clean working tree)
   - `npm install` (if the helper script needs dependencies)
2. **Verify docs**
   - README links and commands tested
   - `WORKFLOW.md` + `PUBLISHING_GUIDE.md` still match repo layout
   - Sample progress log updated or replaced with latest anonymised run
3. **Run helper script smoke test**
   - `node scripts/ts-error-report.mjs` (should exit 0)
4. **Check licence/header**
   - Confirm `LICENSE` shows current year and your preferred copyright holder

## Release Prep
1. Update `CHANGELOG.md` (if you add one) with release notes
2. Tag the release in git (e.g., `git tag v1.0.0`)
3. Push code and tags to GitHub
4. Draft the GitHub release:
   - Short description of the toolkit
   - Highlights (multi-agent prompts, guardrails, helper script)
   - Link to sample progress log

## Post-Release
1. Share announcement (blog, social, communities)
2. Monitor issues/pull requests for feedback
3. Schedule periodic updates (TypeScript version bumps, docs refresh)

## Optional Extras
- Add a screencast or animated GIF of the helper script and guardrail workflow
- Publish an accompanying blog post that dives into the guardrail philosophy
